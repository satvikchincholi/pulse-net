import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { parseCivicIssue } from '@/lib/geminiClient';
import crypto from 'crypto';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// Note: To receive photo + location, Telegram typically sends them in separate messages
// unless sent together as a venue/location or using a special client flow.
// For simplicity in a single webhook, we'll assume the bot manages state (which is complex) 
// OR the user sends an image with location data (EXIF) or a caption with coordinates.
// Since Telegram doesn't let you send a photo AND a location attachment in one single atomic message easily,
// we will handle a generic text/photo payload. Wait, standard Telegram UI allows "Send Location" 
// and "Send Photo". To do both frictionlessly, we might parse a photo with a location caption, 
// or implement a basic state machine using the DB.
// Let's implement a stateless handler assuming the payload has location & photo.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));
    const message = body.message;
    if (!message) return NextResponse.json({ status: 'ignored' });
    const chatId = message.chat.id;
    
    // Minimal mock for demonstration:
    // We need an image and location. If we get a photo, we'll try to process it.
    // We will hardcode dummy coords if no location is present for MVP sake.
    if (!message.photo) {
      await sendMessage(chatId, "Please send a photo of the civic issue.");
      return NextResponse.json({ status: 'ok' });
    }
    // Get the highest resolution photo
    const photoId = message.photo[message.photo.length - 1].file_id;
    
    // Determine location (if sent alongside or use dummy)
    const lat = message.location?.latitude || 37.7749;
    const lng = message.location?.longitude || -122.4194;
    // 1. Fetch file path from Telegram
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${photoId}`);
    const fileData = await fileRes.json();
    if (!fileData.ok) throw new Error('Failed to get file from Telegram');
    
    const filePath = fileData.result.file_path;
    const telegramFileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    // 2. Download and upload to Supabase Storage
    const imgResponse = await fetch(telegramFileUrl);
    const imgBuffer = await imgResponse.arrayBuffer();
    
    const fileName = `${Date.now()}_${photoId}.jpg`;
    const { error: uploadError, data: uploadData } = await supabaseAdmin.storage
      .from('ticket-images')
      .upload(fileName, imgBuffer, { contentType: 'image/jpeg' });
    if (uploadError) throw uploadError;
    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('ticket-images')
      .getPublicUrl(fileName);
    // 3. Ask Gemini to analyze the image
    const aiData = await parseCivicIssue(publicUrl, lat, lng);
    
    // 4. Duplicate Check (PostGIS)
    const userPhoneIdHash = crypto.createHash('sha256').update(chatId.toString()).digest('hex');
    const { data: duplicate } = await supabaseAdmin.rpc('check_duplicate_ticket', {
      p_category: aiData.category,
      p_lat: lat,
      p_lng: lng,
      p_radius_meters: 50
    });
    
    // Note: If RPC doesn't exist, we can just do a direct query:
    /*
      Since we can't easily execute raw SQL with postgis via standard Supabase JS client without an RPC,
      we'll need to create an RPC function in the database for `check_duplicate_ticket`.
      Let's assume the RPC exists for now, or we just insert it directly if not possible.
    */
    
    let ticketId;
    if (duplicate && duplicate.length > 0) {
      // Increment duplicate
      ticketId = duplicate[0].id;
      await supabaseAdmin.rpc('increment_ticket_count', { t_id: ticketId });
      await sendMessage(chatId, `Thanks! We found an existing report for this ${aiData.category} issue and added your voice to it. (Severity: ${aiData.severity})`);
    } else {
      // Map numeric severity to enum
      const severityMap = ['low', 'low', 'medium', 'high', 'critical'];
      const mappedSeverity = severityMap[Math.min(4, Math.max(0, (aiData.severity || 1) - 1))];
      // Insert new
      const { data: newTicket, error: insertError } = await supabaseAdmin.from('tickets').insert({
        category: aiData.category || 'Infrastructure',
        description: aiData.description || 'Reported via Telegram',
        severity: mappedSeverity,
        lat,
        lng,
        before_image_url: publicUrl,
        status: 'open',
        bounty_amount: 10,
        upvote_count: 1
      }).select().single();
      
      if (insertError) throw insertError;
      ticketId = newTicket.id;
      await sendMessage(chatId, `Report received! Category: ${aiData.category}, Severity: ${mappedSeverity}. Our team is on it.`);
    }
    return NextResponse.json({ status: 'ok', ticketId });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
async function sendMessage(chatId: string | number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

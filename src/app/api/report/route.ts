import { supabaseAdmin } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

/**
 * POST /api/report
 * Handles report submissions and stores them in Supabase.
 * Expected form‑data fields:
 *   - image: File (image/*)
 *   - lat: string
 *   - lng: string
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;
    const lat = formData.get('lat')?.toString() ?? '';
    const lng = formData.get('lng')?.toString() ?? '';

    if (!imageFile || !lat || !lng) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${imageFile.type};base64,${base64}`;

    const ticketId = crypto.randomUUID();

    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert({
        id: ticketId,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        before_image_url: dataUrl,
        status: 'open',
        severity: 'low',
        category: 'Infrastructure',
        bounty_amount: 0,
        upvote_count: 1,
      })
      .select('id')
      .single();

    if (error || !data) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (err) {
    console.error('Report handler error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

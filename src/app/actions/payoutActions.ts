"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { GoogleGenerativeAI } from "@google/generative-ai";

const BASE_BOUNTIES = {
  low: 25,
  medium: 50,
  high: 100,
  critical: 200,
};

const TIER_MULTIPLIERS = {
  bronze: 1.0,
  silver: 1.25,
  gold: 1.75,
  diamond: 2.5,
};

export async function submitResolution(formData: FormData) {
  const ticketId = formData.get("ticketId") as string;
  const imageFile = formData.get("image") as File;

  if (!ticketId || !imageFile) return { success: false, error: "Missing required fields" };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required" };

  // 2. Fetch Responder profile for tier
  const { data: official, error: offErr } = await supabase
    .from("municipal_officials")
    .select("id, current_tier, help_coin_wallet, monthly_resolutions")
    .eq("id", user.id)
    .single();

  if (offErr || !official) return { success: false, error: "Unauthorized access" };

  // 3. Fetch Ticket details
  const { data: ticket, error: tktErr } = await supabase
    .from("tickets")
    .select("severity, status, solver_id, bounty_amount, category, before_image_url")
    .eq("id", ticketId)
    .single();

  if (tktErr || !ticket) return { success: false, error: "Ticket not found" };
  if (ticket.solver_id !== official.id) return { success: false, error: "You are not the solver of this ticket" };
  if (ticket.status !== "claimed") return { success: false, error: "Ticket is not in a claimed state" };

  // 4. AI Verification with Gemini
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const afterBytes = await imageFile.arrayBuffer();
    const afterBuffer = Buffer.from(afterBytes);

    let beforePart = null;
    if (ticket.before_image_url) {
      try {
        const beforeRes = await fetch(ticket.before_image_url);
        const beforeBuffer = Buffer.from(await beforeRes.arrayBuffer());
        const mimeType = beforeRes.headers.get("content-type") || "image/jpeg";
        beforePart = {
          inlineData: {
            data: beforeBuffer.toString("base64"),
            mimeType: mimeType
          }
        };
      } catch (err) {
        console.error("Failed to fetch before image", err);
      }
    }

    const afterPart = {
      inlineData: {
        data: afterBuffer.toString("base64"),
        mimeType: imageFile.type,
      },
    };

    const prompt = `You are a civic infrastructure inspector. I am providing you with one or two images. ` + 
      (beforePart ? `The FIRST image is the 'before' photo showing a civic issue (category: ${ticket.category}). The SECOND image is the 'after' photo submitted as proof of repair. ` : `The image is the 'after' photo submitted as proof of repair for category: ${ticket.category}. `) +
      `Does the 'after' photo clearly show that the issue has been RESOLVED or PATCHED? ` +
      (beforePart ? `The 'after' photo MUST be visibly different from the 'before' photo, showing actual repair work. If they are identical or show the exact same unrepaired state, it's a fake submission. ` : ``) +
      `Reply with YES or NO first, followed by a brief 1-sentence reason. If it's a random image, a selfie, AI generated, identical to the before state, or doesn't show a fix, say NO.`;

    const parts = beforePart ? [prompt, beforePart, afterPart] : [prompt, afterPart];

    const result = await model.generateContent(parts);

    const responseText = result.response.text();
    if (responseText.trim().toUpperCase().startsWith("NO")) {
      return { success: false, error: `AI Verification Failed: ${responseText}` };
    }

    // 5. Upload to Supabase Storage
    const fileName = `${ticketId}-${Date.now()}-${imageFile.name}`;
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(process.env.SUPABASE_REPORTS_BUCKET || "reports")
      .upload(`resolutions/${fileName}`, afterBuffer, {
        contentType: imageFile.type,
      });

    if (uploadErr) {
      console.error("Storage upload error:", uploadErr);
      return { success: false, error: "Failed to upload image to storage" };
    }

    const { data: publicUrlData } = supabase.storage
      .from(process.env.SUPABASE_REPORTS_BUCKET || "reports")
      .getPublicUrl(`resolutions/${fileName}`);

    const afterImageUrl = publicUrlData.publicUrl;

    // 6. Calculate Payout
    const severityKey = ticket.severity as keyof typeof BASE_BOUNTIES;
    const tierKey = official.current_tier as keyof typeof TIER_MULTIPLIERS;
    
    const baseReward = BASE_BOUNTIES[severityKey] || 25;
    const multiplier = TIER_MULTIPLIERS[tierKey] || 1.0;
    
    const calculatedBonus = Math.floor(baseReward * multiplier);
    const finalPayout = calculatedBonus + (ticket.bounty_amount || 0);

    // 7. ATOMIC DB UPDATES
    const { data: updatedTicket, error: tktUpdErr } = await supabase
      .from("tickets")
      .update({ 
        status: "resolved", 
        after_image_url: afterImageUrl,
        resolved_at: new Date().toISOString()
      })
      .eq("id", ticketId)
      .eq("status", "claimed")
      .select("id")
      .single();

    if (tktUpdErr || !updatedTicket) return { success: false, error: "Failed to update ticket. It may already be resolved or not claimed." };

    await supabase
      .from("municipal_officials")
      .update({
        help_coin_wallet: official.help_coin_wallet + finalPayout,
        monthly_resolutions: official.monthly_resolutions + 1
      })
      .eq("id", official.id);

    await supabase
      .from("transactions")
      .insert({
        receiver_id: official.id,
        amount: finalPayout,
        ticket_id: ticketId,
        type: "bounty_payout"
      });

    revalidatePath("/responder/dashboard");
    revalidatePath("/responder/jobs");

    return { success: true, payout: finalPayout, tierMultiplier: multiplier };

  } catch (error: any) {
    console.error("Resolution processing error:", error);
    return { success: false, error: error.message || "An error occurred during AI verification or upload." };
  }
}

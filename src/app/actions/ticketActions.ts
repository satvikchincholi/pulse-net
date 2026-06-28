"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function claimTicket(ticketId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Get authenticated user
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return { success: false, error: "Authentication required" };
  }

  // 2. Verify user is a municipal official
  const { data: official, error: offErr } = await supabase
    .from("municipal_officials")
    .select("id")
    .eq("id", user.id)
    .single();

  if (offErr || !official) {
    return { success: false, error: "Unauthorized: Responder access required" };
  }

  // 3. Atomically claim ticket (prevents race conditions)
  // The .eq("status", "open") ensures we only update if it hasn't been claimed yet.
  const { data: ticket, error: updateErr } = await supabase
    .from("tickets")
    .update({ 
      status: "claimed", 
      solver_id: official.id 
    })
    .eq("id", ticketId)
    .eq("status", "open")
    .select()
    .single();

  if (updateErr || !ticket) {
    console.error("❌ Failed to claim ticket:", updateErr);
    return { success: false, error: "Ticket is no longer available or already claimed" };
  }

  // 4. Revalidate responder dashboard cache if using SSR
  revalidatePath("/responder/dashboard");

  return { success: true, ticket };
}

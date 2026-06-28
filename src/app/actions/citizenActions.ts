"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createTicket(formData: {
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  reported_area: string;
  before_image_url: string;
  lat: number;
  lng: number;
  is_anonymous?: boolean;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required" };

  // Insert Ticket
  const insertPayload: any = {
    author_id: user.id,
    category: formData.category,
    description: formData.description,
    severity: formData.severity,
    reported_area: formData.reported_area,
    before_image_url: formData.before_image_url,
    lat: formData.lat,
    lng: formData.lng,
    status: "open",
    bounty_amount: 0,
    upvote_count: 1
  };

  const { data, error } = await supabase
    .from("tickets")
    .insert({
      ...insertPayload,
      is_anonymous: formData.is_anonymous ?? false
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes("is_anonymous") || error.message.includes("column")) {
      const { data: fallbackData, error: fallbackErr } = await supabase
        .from("tickets")
        .insert(insertPayload)
        .select()
        .single();
      if (fallbackErr) {
        console.error("❌ Failed fallback ticket insert:", fallbackErr);
        return { success: false, error: fallbackErr.message };
      }
      revalidatePath("/citizen/feed");
      revalidatePath("/responder/dashboard");
      return { success: true, ticket: fallbackData };
    }
    console.error("❌ Failed to create ticket:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/citizen/feed");
  revalidatePath("/responder/dashboard");

  return { success: true, ticket: data };
}

export async function upvoteTicket(ticketId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Authentication required" };

  // Insert into ticket_upvotes (this will fail if they already upvoted due to unique constraint on user_id + ticket_id)
  const { error: upvoteErr } = await supabase
    .from("ticket_upvotes")
    .insert({ user_id: user.id, ticket_id: ticketId });

  if (upvoteErr) {
    if (upvoteErr.code === "23505") {
      return { success: false, error: "You already upvoted this issue." };
    }
    return { success: false, error: upvoteErr.message };
  }

  // Get current ticket to increment
  const { data: ticket } = await supabase
    .from("tickets")
    .select("upvote_count, bounty_amount")
    .eq("id", ticketId)
    .single();

  if (ticket) {
    // Increment upvote_count and add 5 coins to bounty
    await supabase
      .from("tickets")
      .update({
        upvote_count: ticket.upvote_count + 1,
        bounty_amount: ticket.bounty_amount + 5
      })
      .eq("id", ticketId);
  }

  revalidatePath("/citizen/feed");
  return { success: true };
}

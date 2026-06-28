// src/app/actions/initiativeActions.ts
"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

/** Create a new initiative inside a community */
export async function createInitiative(data: {
  communityId: string;
  title: string;
  description?: string;
  targetAmount: number; // Help Coins needed
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  const { error } = await supabase.from("initiatives").insert({
    community_id: data.communityId,
    title: data.title,
    description: data.description ?? null,
    target_amount: data.targetAmount,
    created_by: user.id,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Pledge Help Coins to an initiative – wraps the RPC defined in Supabase */
export async function pledgeToInitiative(
  initiativeId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) return { success: false, error: "Authentication required" };

  const { error } = await supabase.rpc("pledge_to_initiative", {
    p_user_id: user.id,
    p_initiative_id: initiativeId,
    p_amount: amount,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/** Fetch all initiatives for a community (used by dashboard) */
export async function fetchInitiativesByCommunity(
  communityId: string
): Promise<any[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("initiatives")
    .select("*")
    .eq("community_id", communityId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

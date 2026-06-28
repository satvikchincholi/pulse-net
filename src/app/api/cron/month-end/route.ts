import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// We must use the Service Role Key to bypass RLS for a backend cron job
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    // 1. Fetch all officials
    const { data: officials, error: offErr } = await supabaseAdmin
      .from("municipal_officials")
      .select("*");

    if (offErr) throw offErr;
    if (!officials || officials.length === 0) {
      return NextResponse.json({ message: "No officials found" });
    }

    // 2. Group by Jurisdiction Area (Ward)
    const wards: Record<string, typeof officials> = {};
    for (const official of officials) {
      const ward = official.jurisdiction_area || "General";
      if (!wards[ward]) wards[ward] = [];
      wards[ward].push(official);
    }

    // For keeping track of updates to perform
    const updates: any[] = [];
    const transactions: any[] = [];
    const snapshots: any[] = [];

    // 3. Process each Ward
    for (const [wardName, wardOfficials] of Object.entries(wards)) {
      
      // Calculate composite scores and sort (Rank 1 to N)
      const rankedOfficials = wardOfficials.map(official => {
        // Score = (monthly_resolutions * 0.5) + (avg_community_rating * 0.3) + (avg_resolution_speed_score * 0.2)
        const score = (official.monthly_resolutions * 0.5) + 
                      (official.avg_community_rating * 0.3) + 
                      (official.avg_resolution_speed_score * 0.2);
        return { ...official, calculatedScore: score };
      }).sort((a, b) => b.calculatedScore - a.calculatedScore);

      // Distribute Leaderboard Pool
      // Let's assume a default monthly budget of 10,000 Coins per ward if not set in DB
      let monthlyBudget = 10000;
      const { data: budgetData } = await supabaseAdmin
        .from("monthly_budgets")
        .select("total_coins_allocated")
        .eq("ward_area", wardName)
        .eq("month", `${new Date().toISOString().slice(0, 7)}-01`)
        .single();
      
      if (budgetData) monthlyBudget = budgetData.total_coins_allocated;

      // Payout Logic: 1st=30%, 2nd=20%, 3rd=15%, 4th-10th=split 35%
      rankedOfficials.forEach((official, index) => {
        const rank = index + 1;
        let bonus = 0;

        if (rank === 1) bonus = monthlyBudget * 0.30;
        else if (rank === 2) bonus = monthlyBudget * 0.20;
        else if (rank === 3) bonus = monthlyBudget * 0.15;
        else if (rank >= 4 && rank <= 10) bonus = (monthlyBudget * 0.35) / Math.min(7, rankedOfficials.length - 3);

        bonus = Math.floor(bonus);

        // Determine New Tier based on monthly resolutions
        let newTier = "bronze";
        if (official.monthly_resolutions > 50) newTier = "diamond";
        else if (official.monthly_resolutions > 25) newTier = "gold";
        else if (official.monthly_resolutions > 10) newTier = "silver";

        // Prepare Transaction if they won a bonus
        if (bonus > 0) {
          transactions.push({
            receiver_id: official.id,
            amount: bonus,
            type: "leaderboard_bonus"
          });
        }

        // Prepare Snapshot
        snapshots.push({
          official_id: official.id,
          month: `${new Date().toISOString().slice(0, 7)}-01`,
          rank: rank,
          composite_score: official.calculatedScore,
          pool_bonus_earned: bonus
        });

        // Prepare Official Update (Add bonus, reset resolutions, update tier)
        updates.push({
          id: official.id,
          help_coin_wallet: official.help_coin_wallet + bonus,
          monthly_resolutions: 0,
          current_tier: newTier,
          composite_score: official.calculatedScore // Save the latest score
        });
      });
    }

    // 4. Execute Batch Updates
    // Since Supabase REST doesn't have native mass-update-different-values easily, we loop.
    // In production, an RPC function is much better here.
    for (const update of updates) {
      await supabaseAdmin.from("municipal_officials").update({
        help_coin_wallet: update.help_coin_wallet,
        monthly_resolutions: update.monthly_resolutions,
        current_tier: update.current_tier,
        composite_score: update.composite_score
      }).eq("id", update.id);
    }

    if (transactions.length > 0) {
      await supabaseAdmin.from("transactions").insert(transactions);
    }

    if (snapshots.length > 0) {
      await supabaseAdmin.from("leaderboard_snapshots").insert(snapshots);
    }

    return NextResponse.json({ 
      success: true, 
      processedWards: Object.keys(wards).length,
      processedOfficials: updates.length 
    });

  } catch (error: any) {
    console.error("Month End Job Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

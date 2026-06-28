// app/api/escalate/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { sendEscalationEmail, type Ticket } from "../../../../lib/escalation/emailService";

/**
 * POST /api/escalate
 * Body: { "ticket_id": string, "escalation_level": 1 | 2 | 3 }
 *
 * For demonstration we only implement level 1 (email + PDF).
 * Future levels will call the RPA and Twitter services.
 */
export async function POST(request: Request) {
  try {
    const { ticket_id, escalation_level } = await request.json();
    if (!ticket_id || !escalation_level) {
      return NextResponse.json({ error: "ticket_id and escalation_level are required" }, { status: 400 });
    }

    // Initialise Supabase client (server‑side)
    const cookieStore = await (await import("next/headers")).cookies();
    const supabase = createClient(cookieStore);

    // Fetch ticket data
    const { data: ticketData, error: fetchErr } = await supabase
      .from("tickets")
      .select("id, category, description, lat, lng")
      .eq("id", ticket_id)
      .single();

    if (fetchErr || !ticketData) {
      console.error("❌ Ticket fetch error", fetchErr);
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const ticket: Ticket = {
      id: ticketData.id,
      category: ticketData.category,
      description: ticketData.description,
      lat: Number(ticketData.lat),
      lng: Number(ticketData.lng),
    };

    // Dispatch based on escalation level
    let success = false;
    if (escalation_level === 1) {
      success = await sendEscalationEmail(ticket);
    } else if (escalation_level === 2) {
      // Import and invoke the RPA service
      const { runRpaEscalation } = await import("../../../../lib/escalation/rpaService");
      success = await runRpaEscalation(ticket);
    } else {
      // Placeholder for future levels (Twitter)
      return NextResponse.json({ error: "Escalation level not implemented yet" }, { status: 501 });
    }

    if (!success) {
      return NextResponse.json({ error: "Escalation action failed" }, { status: 500 });
    }

    return NextResponse.json({ message: "Escalation triggered successfully" }, { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error in escalation endpoint", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

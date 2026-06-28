// app/escalate/page.tsx

import React from "react";

/**
 * Simple helper page for manual testing of the escalation endpoint.
 * Visiting `/escalate` in a browser will show instructions and a tiny form.
 */
export default function EscalationInfo() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-4">PulseNet – Escalation Endpoint</h1>
      <p className="mb-2">
        Use the <code className="bg-gray-200 px-1 rounded">/api/escalate</code> API route to trigger
        automated escalation actions.
      </p>
      <p className="mb-2">
        Send a POST request with JSON body:
        <pre className="bg-gray-100 p-2 rounded mt-2">
{`{"ticket_id":"YOUR_TICKET_ID","escalation_level":1}`}
        </pre>
      </p>
      <p className="mb-2">
        • <strong>Level 1</strong> – Email + PDF (Resend).<br />
        • <strong>Level 2</strong> – RPA form submission (Puppeteer).<br />
        • Level 3 – (future) Twitter escalation.
      </p>
      <p className="text-sm text-gray-600">Make sure the required env vars are set in <code>.env.local</code>.</p>
    </main>
  );
}

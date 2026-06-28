// lib/escalation/emailService.ts

import { GenerativeModel, GoogleGenerativeAI } from "@google/generative-ai";
import PDFDocument from "pdfkit";
import { Resend } from "resend";
import { Buffer } from "buffer";

// Interface representing the data we need from a ticket
export interface Ticket {
  id: string;
  category: string;
  description: string;
  lat: number;
  lng: number;
  // optional fields you may want to include
  reporter_name?: string;
  created_at?: string;
}

// Initialise Gemini model – we use the flash model for speed & cost efficiency
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Initialise Resend mail client
const resend = new Resend(process.env.RESEND_API_KEY || "");

/**
 * Generates a formal grievance report using Gemini.
 * The report consists of three paragraphs in a legal‑style tone.
 */
async function generateReport(ticket: Ticket): Promise<string> {
  const prompt = `You are a legal professional drafting a formal grievance report for a civic‑infrastructure complaint.
Ticket details:
- Category: ${ticket.category}
- Description: ${ticket.description}
- Location (latitude, longitude): ${ticket.lat}, ${ticket.lng}
Provide exactly three concise paragraphs, formal tone, suitable for an official dossier.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Creates a PDF Buffer in memory containing the escalation dossier.
 */
function createPdf(reportText: string, ticket: Ticket): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", (err: Error) => reject(err));

    // Header – red, bold
    doc
      .fillColor("red")
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("AUTOMATED ESCALATION DOSSIER", { align: "center" })
      .moveDown(1);

    // Body – the AI‑generated report
    doc
      .fillColor("black")
      .fontSize(12)
      .font("Helvetica")
      .text(reportText, { align: "left" })
      .moveDown(1);

    // GPS coordinates – highlighted
    doc
      .fillColor("#555")
      .fontSize(10)
      .text(`Location: Latitude ${ticket.lat}, Longitude ${ticket.lng}`);

    doc.end();
  });
}

/**
 * Sends the escalation email with the PDF attached.
 */
export async function sendEscalationEmail(ticket: Ticket): Promise<boolean> {
  try {
    // 1️⃣ Generate the AI report
    const report = await generateReport(ticket);

    // 2️⃣ Build the PDF in memory
    const pdfBuffer = await createPdf(report, ticket);

    // 3️⃣ Dispatch the email via Resend
    const toAddress = process.env.ESCALATION_EMAIL_TARGET || "ward.officer@example.com";
    const response = await resend.emails.send({
      from: "PulseNet <no-reply@pulsenet.example.com>",
      to: [toAddress],
      subject: `Escalation Dossier – Ticket ${ticket.id}`,
      html: `<p>Dear Officer,</p><p>Please find attached the escalation dossier for the ticket referenced below.</p>`,
      attachments: [
        {
          filename: `Escalation_Dossier_${ticket.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    return !response.error;
  } catch (error) {
    console.error("❌ Escalation email failed:", error);
    return false;
  }
}

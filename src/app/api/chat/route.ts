import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are PulseBot, the official AI assistant for PulseNet. 
PulseNet is a civic infrastructure platform where citizens report issues (potholes, streetlights, graffiti) and municipal workers (responders) fix them to earn Help Coins (bounties).
Your goal is to assist users. Keep responses extremely concise, friendly, and formatted cleanly. Do not use overly complex markdown, just simple bolding or lists if necessary.
If asked about Help Coins, explain that they are earned by workers who resolve issues, and citizens can boost them by upvoting open issues.

CRITICAL INSTRUCTION: You MUST speak in the language the user speaks to you in. If the user speaks in Kannada or Kanglish (Kannada written in English script like "nanu e app hege balasabeku"), you MUST reply in Kannada (or Kanglish) gracefully. You are fully proficient in Kannada.`;

export async function POST(req: Request) {
  try {
    const { history, message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt 
    });

    const chat = model.startChat({
      history: history || [],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("PulseBot Error Details:", error.message, error.stack);
    return NextResponse.json(
      { error: "Failed to generate response.", details: error.message || String(error) },
      { status: 500 }
    );
  }
}

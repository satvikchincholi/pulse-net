import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function parseCivicIssue(imageUrl: string, lat: number, lng: number) {
  // We'll fetch the image and pass it as base64 to Gemini
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error('Failed to fetch image for Gemini');
  
  const buffer = await response.arrayBuffer();
  const base64Image = Buffer.from(buffer).toString('base64');
  
  const prompt = `Analyze this image of a civic issue at location (Lat: ${lat}, Lng: ${lng}).
Return a JSON object with strictly these fields:
- "category": Must be one of ["Pothole", "Lighting", "Water", "Waste", "Infrastructure"].
- "description": A short summary of the issue.
- "severity": An integer from 1 to 5, where 5 is the most severe.`;

  const result = await visionModel.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image,
        mimeType: response.headers.get('content-type') || 'image/jpeg',
      },
    },
  ]);

  const text = result.response.text();
  // Strip potential markdown code block formatting to safely parse JSON
  const jsonStr = text.replace(/```json|```/g, '').trim();
  
  try {
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error('Failed to parse Gemini response as JSON', text);
    throw err;
  }
}

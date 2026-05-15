import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || text.length < 50)
    return NextResponse.json({ error: "Resume too short" }, { status: 400 });

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Analyse this student's resume and return ONLY valid JSON — no markdown, no explanation.

Resume:
"""
${text.slice(0, 4000)}
"""

Return exactly:
{
  "keywords": ["skills, tools, roles, subjects, achievements — max 30 items"],
  "detectedInterests": ["from: technology, AI, computing, engineering, business, finance, fintech, law, medicine, healthcare, design, architecture, data, analytics, social sciences, psychology, communications, science, biotech, economics, marketing, supply chain, games, arts"],
  "detectedIndustries": ["inferred industries e.g. Technology, Finance, Healthcare, Education, Government, Consulting, Media, Engineering, Biotech, Legal, Marketing, Logistics"]
}`;

  const result = await model.generateContent(prompt);
  const cleaned = result.response.text().replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({
      rawText: text,
      keywords: parsed.keywords ?? [],
      detectedInterests: parsed.detectedInterests ?? [],
      detectedIndustries: parsed.detectedIndustries ?? [],
    });
  } catch {
    return NextResponse.json({ error: "AI parse failed" }, { status: 500 });
  }
}
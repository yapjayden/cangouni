import { NextRequest, NextResponse } from "next/server";
import { generateContentResilient } from "@/lib/gemini";
import type { ResumeParseResult } from "@/types";

export const runtime = "nodejs";

function fallbackParse(text: string): ResumeParseResult {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4);
  const keywords = [...new Set(words)].slice(0, 25);

  const interestHints = [
    "technology", "computing", "engineering", "business", "finance",
    "law", "medicine", "design", "data", "science", "marketing",
  ];
  const industryHints = [
    "Technology", "Finance", "Healthcare", "Consulting", "Engineering",
    "Education", "Government", "Media", "Legal", "Marketing",
  ];

  const lower = text.toLowerCase();
  const detectedInterests = interestHints.filter(h => lower.includes(h));
  const detectedIndustries = industryHints.filter(h => lower.includes(h.toLowerCase()));

  return {
    rawText: text,
    keywords,
    detectedInterests,
    detectedIndustries,
  };
}

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "No resume text provided" }, { status: 400 });
  }

  const trimmed = text.trim();
  if (trimmed.length < 30) {
    return NextResponse.json(
      { error: "Resume text is too short. Add more detail or use the manual field." },
      { status: 400 },
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("YourKeyHere")) {
    return NextResponse.json(fallbackParse(trimmed));
  }

  try {
    const prompt = `Analyse this student's resume and return ONLY valid JSON — no markdown, no explanation.

Resume:
"""
${trimmed.slice(0, 4000)}
"""

Return exactly:
{
  "keywords": ["skills, tools, roles, subjects, achievements — max 30 items"],
  "detectedInterests": ["from: technology, AI, computing, engineering, business, finance, fintech, law, medicine, healthcare, design, architecture, data, analytics, social sciences, psychology, communications, science, biotech, economics, marketing, supply chain, games, arts"],
  "detectedIndustries": ["inferred industries e.g. Technology, Finance, Healthcare, Education, Government, Consulting, Media, Engineering, Biotech, Legal, Marketing, Logistics"]
}`;

    const raw = await generateContentResilient(apiKey, [prompt]);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      rawText: trimmed,
      keywords: parsed.keywords ?? [],
      detectedInterests: parsed.detectedInterests ?? [],
      detectedIndustries: parsed.detectedIndustries ?? [],
    } satisfies ResumeParseResult);
  } catch (e) {
    console.error("parse-resume AI error", e);
    return NextResponse.json(fallbackParse(trimmed));
  }
}

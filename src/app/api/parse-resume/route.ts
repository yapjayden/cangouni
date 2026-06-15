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
    const prompt = `You are parsing a student's resume. EXTRACT ONLY TRUE TECHNICAL SKILLS.

Skip anything that looks like:
- Document headers, dates, months, years, phone numbers, emails
- Company or university names
- Generic section titles (Experience, Education, Contact, Profile, Summary)
- Common resume words (resume, curriculum, vitae, pdf, document)
- Filler words (the, and, or, a, an, to, for, in, at, by, with, is, are)
- Pronouns (i, me, my, they, he, she, it)

INCLUDE ONLY:
- Programming languages: Python, Java, C++, JavaScript, React, etc
- Tools & platforms: Docker, Git, AWS, GCP, Figma, etc
- Frameworks & libraries: Django, Spring, Node.js, Vue, etc
- Certifications: AWS Solutions Architect, Google Cloud Professional, etc
- Technical roles: Software Engineer, Data Scientist, DevOps Engineer, etc
- Specific achievements with numbers/impact: "Led team of 5", "Reduced latency by 40%", etc

Examples of BAD keywords to SKIP: "resume", "profile", "john", "smith", "2024", "january", "contact", "acme corp", "stanford university"

Resume text (ignore first ~100 words as they're often headers):
"""
${trimmed.slice(400, 4400)}
"""

Return ONLY valid JSON — no markdown, no extra text:
{
  "keywords": ["only true technical skills, tools, roles, certifications"],
  "detectedInterests": ["from: technology, AI, computing, engineering, business, finance, fintech, law, medicine, healthcare, design, architecture, data, analytics, social sciences, psychology, communications, science, biotech, economics, marketing, supply chain, games, arts"],
  "detectedIndustries": ["inferred industries e.g. Technology, Finance, Healthcare, Education, Government, Consulting, Media, Engineering, Biotech, Legal, Marketing, Logistics"]
}`;

    const raw = await generateContentResilient(apiKey, [prompt]);
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const commonFalsePositives = new Set([
      "resume", "profile", "experience", "education", "skills", "summary", "objective",
      "contact", "information", "phone", "email", "address", "linkedin", "github",
      "pdf", "document", "curriculum", "vitae", "cv", "attachment", "etc",
      // Months
      "january", "february", "march", "april", "may", "june",
      "july", "august", "september", "october", "november", "december",
      "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
      // Years
      "2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026",
      // Common names / company names
      "john", "jane", "smith", "johnson", "williams", "corporation", "inc", "ltd",
      // Generic action/descriptor words (not skills)
      "i", "a", "the", "and", "or", "in", "at", "to", "for", "by", "with", "is",
      "are", "was", "were", "be", "been", "being", "have", "has", "do", "does",
      "me", "my", "we", "our", "they", "he", "she", "it", "us",
      "team", "member", "part", "role", "worked", "participated", "involved",
      "project", "course", "subject", "level", "award", "scholarship",
    ]);

    const filtered = (parsed.keywords ?? [])
      .filter((k: string) => {
        const lower = k.toLowerCase().trim();

        // Skip if empty or too short
        if (lower.length < 3) return false;

        // Skip if it's a known false positive
        if (commonFalsePositives.has(lower)) return false;

        // Skip if it's just numbers (years, dates, phone)
        if (/^\d+$/.test(lower)) return false;

        // Skip if it's a single letter
        if (/^[a-z]$/.test(lower)) return false;

        // Skip if it looks like a date (e.g., "12/2024", "Dec 2023")
        if (/^\d{1,2}\/\d{4}$|^\w+ \d{4}$/.test(lower)) return false;

        // Skip if it starts with a number (likely a list item)
        if (/^\d/.test(lower)) return false;

        return true;
      })
      // Capitalize each keyword (Title Case) for professional appearance
      .map((k: string) => {
        const lower = k.toLowerCase();
        return lower.split(/\s+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
      })
      .slice(0, 20);

    // Map detected interests to actual category IDs
    const interestMap: Record<string, string> = {
      "technology": "technology", "tech": "technology",
      "ai": "AI", "ai and ml": "AI", "ai/ml": "AI", "machine learning": "AI",
      "computing": "computing", "computer": "computing",
      "engineering": "engineering",
      "business": "business",
      "finance": "finance",
      "fintech": "fintech",
      "law": "law",
      "medicine": "medicine", "medical": "medicine",
      "healthcare": "healthcare", "health": "healthcare",
      "design": "design",
      "architecture": "architecture",
      "data": "data", "data science": "data",
      "analytics": "analytics",
      "social sciences": "social sciences", "social science": "social sciences",
      "psychology": "psychology",
      "communications": "communications", "communication": "communications",
      "science": "science",
      "biotech": "biotech", "biotechnology": "biotech",
      "economics": "economics",
      "marketing": "marketing",
      "supply chain": "supply chain",
      "games": "games", "game development": "games",
      "arts": "arts", "art": "arts",
    };

    const mappedInterests = (parsed.detectedInterests ?? [])
      .map((interest: string) => {
        const lower = interest.toLowerCase().trim();
        return interestMap[lower] || lower;
      })
      .filter((id: string) => {
        // Only include if it's a valid category ID
        return ["technology", "AI", "computing", "engineering", "business", "finance", "fintech", "law", "medicine", "healthcare", "design", "architecture", "data", "analytics", "social sciences", "psychology", "communications", "science", "biotech", "economics", "marketing", "supply chain", "games", "arts"].includes(id);
      });

    return NextResponse.json({
      rawText: trimmed,
      keywords: filtered,
      detectedInterests: mappedInterests,
      detectedIndustries: parsed.detectedIndustries ?? [],
    } satisfies ResumeParseResult);
  } catch (e) {
    console.error("parse-resume AI error", e);
    return NextResponse.json(fallbackParse(trimmed));
  }
}

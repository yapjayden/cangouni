import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function isPdf(file: File): boolean {
  const name = file.name.toLowerCase();
  return file.type === "application/pdf" || name.endsWith(".pdf");
}

function isDocx(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith(".docx") ||
    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  );
}

function isTxt(file: File): boolean {
  return file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");
}

/**
 * Pull text out of a PDF using Gemini's native document understanding.
 *
 * We deliberately do NOT use a local PDF library here: bundling a PDF worker
 * into a Vercel serverless function is fragile and was the cause of the
 * "Unexpected token '<'" crash (the function died and returned an HTML error
 * page instead of JSON). Gemini reads the PDF bytes directly and is already
 * proven to work in this deployment (the AI advisor uses it).
 */
async function extractPdfWithGemini(buffer: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("YourKeyHere")) {
    throw new Error(
      "PDF reading needs the AI service. Upload a TXT/DOCX instead, or paste your achievements below.",
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    { inlineData: { mimeType: "application/pdf", data: buffer.toString("base64") } },
    {
      text:
        "Extract all readable text from this resume/CV verbatim. " +
        "Return only the plain text content — no commentary, no markdown.",
    },
  ]);

  return result.response.text() ?? "";
}

export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Could not read the upload — the file may be too large (max 4MB)." },
      { status: 400 },
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  // Vercel serverless caps request bodies around 4.5MB, so keep files under 4MB.
  const maxBytes = 4 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json(
      { error: "File exceeds 4MB limit. Try a smaller PDF or paste your achievements below." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  try {
    if (isPdf(file)) {
      text = await extractPdfWithGemini(buffer);
    } else if (isDocx(file)) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (isTxt(file)) {
      text = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        { error: "Unsupported format. Use PDF, DOCX, or TXT." },
        { status: 400 },
      );
    }
  } catch (e) {
    console.error("extract error", e);
    const message = e instanceof Error ? e.message : "Failed to read file";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!text.trim()) {
    return NextResponse.json(
      { error: "No readable text found. Try a text-based PDF or paste your achievements below." },
      { status: 422 },
    );
  }

  return NextResponse.json({ text: text.slice(0, 8000) });
}

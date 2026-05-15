import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPdf } from "@/lib/pdf-extract";

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

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const maxBytes = 5 * 1024 * 1024;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let text = "";

  try {
    if (isPdf(file)) {
      text = await extractTextFromPdf(buffer);
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

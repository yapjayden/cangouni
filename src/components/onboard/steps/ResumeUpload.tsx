"use client";

import { useState } from "react";
import { ResumeParseResult } from "@/types";

export function ResumeUpload({ onParsed }: { onParsed: (r: ResumeParseResult) => void }) {
  const [status, setStatus] = useState<"idle" | "reading" | "parsing" | "done" | "error">("idle");
  const [filename, setFilename] = useState("");
  const [errorDetail, setErrorDetail] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    setErrorDetail("");
    setStatus("reading");

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File exceeds 5MB limit");
      }

      let rawText = "";

      if (file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt")) {
        rawText = await file.text();
      } else {
        const fd = new FormData();
        fd.append("file", file);
        const extractRes = await fetch("/api/parse-resume/extract", { method: "POST", body: fd });
        const extractBody = (await extractRes.json()) as { text?: string; error?: string };
        if (!extractRes.ok) {
          throw new Error(extractBody.error ?? "Could not read file");
        }
        rawText = extractBody.text ?? "";
      }

      if (!rawText.trim()) {
        throw new Error("No text found in file. Try a different PDF or paste achievements below.");
      }

      setStatus("parsing");
      const parseRes = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText }),
      });
      const parseBody = (await parseRes.json()) as ResumeParseResult & { error?: string };
      if (!parseRes.ok) {
        throw new Error(parseBody.error ?? "AI parsing failed");
      }
      onParsed(parseBody);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setErrorDetail(err instanceof Error ? err.message : "Upload failed");
    } finally {
      e.target.value = "";
    }
  }

  const statusText = {
    idle: "Click to upload — PDF, DOCX, or TXT",
    reading: "Reading file...",
    parsing: "AI extracting your skills...",
    done: `✓ Parsed: ${filename}`,
    error: errorDetail || "Error reading file — try a different format",
  }[status];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "24px", color: "#E8EAE3" }}>
        Upload your resume
      </h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "#9AA392", lineHeight: 1.6 }}>
        Optional but recommended. We extract your skills and achievements to find courses that match you — not just your grades.
      </p>

      <label style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "10px", border: `1px dashed ${status === "error" ? "rgba(220,80,80,0.5)" : "rgba(120,190,80,0.3)"}`,
        padding: "40px 24px", background: "rgba(120,190,80,0.03)", cursor: "pointer",
      }}>
        <input
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={handleFile}
          style={{ display: "none" }}
        />
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "10px",
          color: status === "done" ? "#78BE50" : status === "error" ? "#E07070" : "#9AA392",
          letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.5,
        }}>
          {statusText}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#383E33", letterSpacing: "0.08em" }}>
          PDF · DOCX · TXT · Max 5MB
        </div>
      </label>

      <div>
        <label style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#9AA392", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
          Or describe your achievements manually
        </label>
        <textarea
          rows={4}
          placeholder="e.g. Captain of debate team, Bronze at Science Olympiad, internship at DBS, built a mobile app..."
          style={{ width: "100%", background: "#0F120F", border: "0.5px solid rgba(255,255,255,0.1)", padding: "12px 14px", color: "#E8EAE3", fontFamily: "var(--font-ui)", fontSize: "13px", lineHeight: 1.6, resize: "vertical", outline: "none" }}
          onChange={e => {
            const value = e.target.value;
            if (value.trim().length < 10) return;
            onParsed({
              rawText: value,
              keywords: value.split(/\s+/).filter(w => w.length > 4).slice(0, 20),
              detectedInterests: [],
              detectedIndustries: [],
            });
            setStatus("done");
            setFilename("manual entry");
            setErrorDetail("");
          }}
        />
      </div>
    </div>
  );
}

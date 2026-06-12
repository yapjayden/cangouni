"use client";

import type { ProbabilityResult } from "@/types";

interface Props {
  result: ProbabilityResult;
  rank: number;
}

function chanceColor(p: number) {
  if (p >= 70) return "#78BE50";
  if (p >= 40) return "#C4A035";
  return "#9AA392";
}

export function ProbabilityCard({ result, rank }: Props) {
  const { course, admissionChance, matchScore, matchedLifestyle, reasons } = result;

  // Plain-language match summary, built only from things that actually matched.
  const matchBits: string[] = [];
  if (reasons.interests > 0) matchBits.push(`${reasons.interests} interest${reasons.interests > 1 ? "s" : ""}`);
  if (reasons.subjects > 0) matchBits.push(`${reasons.subjects} subject${reasons.subjects > 1 ? "s" : ""}`);
  if (reasons.industries > 0) matchBits.push(`${reasons.industries} industry`);
  if (reasons.resumeHits > 0) matchBits.push(`${reasons.resumeHits} from your resume`);

  return (
    <article style={{
      background: "#0F120F",
      border: "0.5px solid rgba(255,255,255,0.08)",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#78BE50", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            #{rank} · {course.university}
          </div>
          <h3 style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "16px", color: "#E8EAE3", marginBottom: "4px" }}>
            {course.course}
          </h3>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "#9AA392" }}>{course.faculty}</p>
        </div>
        <div style={{ display: "flex", gap: "20px", flexShrink: 0, textAlign: "right" }}>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: chanceColor(admissionChance), lineHeight: 1 }}>
              {admissionChance}%
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#383E33", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>
              Admission chance
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "32px", color: "#E8EAE3", lineHeight: 1 }}>
              {matchScore}%
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#383E33", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>
              Match
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {course.categories.slice(0, 4).map(cat => (
          <span key={cat} style={{ fontFamily: "var(--font-mono)", fontSize: "8px", padding: "3px 8px", border: "0.5px solid rgba(255,255,255,0.1)", color: "#9AA392", textTransform: "uppercase" }}>
            {cat}
          </span>
        ))}
        {reasons.interview && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", padding: "3px 8px", border: "0.5px solid rgba(196,160,53,0.4)", color: "#C4A035" }}>
            Interview*
          </span>
        )}
      </div>

      {matchBits.length > 0 && (
        <div style={{ fontFamily: "var(--font-ui)", fontSize: "12px", color: "#9AA392", lineHeight: 1.5 }}>
          Matches {matchBits.join(" · ")}
        </div>
      )}

      {matchedLifestyle.length > 0 && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#78BE50", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ✓ Campus fit · {matchedLifestyle.join(" · ")}
        </div>
      )}

      <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#383E33", letterSpacing: "0.06em" }}>
        Your {reasons.scaleLabel} {reasons.studentScore} vs cut-off {reasons.cutoff}
        {reasons.interview && " · interview required"}
      </div>
    </article>
  );
}

"use client";

import type { ProbabilityResult } from "@/types";
import { colors } from "@/theme";

interface Props {
  result: ProbabilityResult;
  rank: number;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
  compareDisabled?: boolean;
}

function chanceColor(p: number) {
  if (p >= 70) return "#78BE50";
  if (p >= 40) return "#C4A035";
  return "#9AA392";
}

/** A percentage shown inside a ring whose fill tracks the value, with a label centred below. */
function RingStat({ value, label, color, numberColor }: { value: number; label: string; color: string; numberColor: string }) {
  const size = 66;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "84px" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontSize: "20px", color: numberColor, lineHeight: 1,
        }}>
          {value}%
        </div>
      </div>
      <div style={{
        fontFamily: "var(--font-mono)", fontSize: "8px", color: "#D4DACC",
        letterSpacing: "0.08em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3,
      }}>
        {label}
      </div>
    </div>
  );
}

export function ProbabilityCard({ result, rank, compareSelected, onToggleCompare, compareDisabled }: Props) {
  const { course, admissionChance, matchScore, matchedLifestyle, reasons } = result;

  // Plain-language "why this fits", naming the actual things that matched.
  const matchBits: string[] = [];
  if (reasons.matchedInterests.length > 0) matchBits.push(`your interest in ${reasons.matchedInterests.join(", ")}`);
  if (reasons.matchedSubjects.length > 0) matchBits.push(`your strength in ${reasons.matchedSubjects.join(", ")}`);
  if (reasons.matchedIndustries.length > 0) matchBits.push(`the ${reasons.matchedIndustries.join(", ")} pathway`);
  if (reasons.resumeHits > 0) matchBits.push(`${reasons.resumeHits} skill${reasons.resumeHits > 1 ? "s" : ""} from your resume`);

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
        <div style={{ display: "flex", gap: "16px", flexShrink: 0 }}>
          <RingStat value={admissionChance} label="Admission chance" color={chanceColor(admissionChance)} numberColor={chanceColor(admissionChance)} />
          <RingStat value={matchScore} label="Match" color={colors.accent} numberColor="#E8EAE3" />
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
          <span style={{ color: "#78BE50" }}>Why this fits: </span>
          matches {matchBits.join(" · ")}
        </div>
      )}

      {matchedLifestyle.length > 0 && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#78BE50", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          ✓ Campus fit · {matchedLifestyle.join(" · ")}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#C8CEC0", letterSpacing: "0.06em" }}>
          Your {reasons.scaleLabel} {reasons.studentScore} vs cut-off {reasons.cutoff}
          {reasons.interview && " · interview required"}
        </div>
        {onToggleCompare && (
          <button
            type="button"
            onClick={() => onToggleCompare(course.id)}
            disabled={!compareSelected && compareDisabled}
            style={{
              flexShrink: 0,
              fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.08em", textTransform: "uppercase",
              padding: "5px 10px",
              cursor: !compareSelected && compareDisabled ? "not-allowed" : "pointer",
              border: `0.5px solid ${compareSelected ? "#78BE50" : "rgba(255,255,255,0.14)"}`,
              background: compareSelected ? "rgba(120,190,80,0.12)" : "transparent",
              color: compareSelected ? "#78BE50" : (compareDisabled ? "#5A5F54" : "#9AA392"),
            }}
          >
            {compareSelected ? "✓ Comparing" : "+ Compare"}
          </button>
        )}
      </div>
    </article>
  );
}

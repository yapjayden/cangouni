"use client";

import { useState } from "react";
import type { ProbabilityResult } from "@/types";
import { colors } from "@/theme";

interface Props {
  selected: ProbabilityResult[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

function chanceColor(p: number) {
  if (p >= 70) return "#78BE50";
  if (p >= 40) return "#C4A035";
  return "#9AA392";
}

export function CompareTray({ selected, onRemove, onClear }: Props) {
  const [open, setOpen] = useState(false);

  if (selected.length === 0) return null;

  return (
    <>
      {/* Sticky tray pinned to the bottom of the viewport */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60,
        background: "rgba(8,10,8,0.96)", borderTop: "0.5px solid rgba(255,255,255,0.12)",
        padding: "14px 24px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Compare ({selected.length}/4)
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", flex: 1, minWidth: 0 }}>
          {selected.map(r => (
            <span key={r.course.id} style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontFamily: "var(--font-ui)", fontSize: "11px", color: colors.text,
              border: "0.5px solid rgba(255,255,255,0.14)", padding: "5px 10px",
            }}>
              {r.course.university} · {r.course.course}
              <button onClick={() => onRemove(r.course.id)} style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", fontSize: "13px", lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <button
          onClick={onClear}
          style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: colors.faint, background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          Clear
        </button>
        <button
          onClick={() => setOpen(true)}
          disabled={selected.length < 2}
          style={{
            background: selected.length < 2 ? "rgba(120,190,80,0.3)" : colors.accent,
            color: colors.bg, border: "none", padding: "10px 20px",
            fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "12px",
            cursor: selected.length < 2 ? "not-allowed" : "pointer",
          }}
        >
          Compare →
        </button>
      </div>

      {/* Full comparison overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: colors.surface, border: "0.5px solid rgba(255,255,255,0.12)",
              maxWidth: "960px", width: "100%", maxHeight: "85vh", overflow: "auto", padding: "28px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "26px", color: colors.text }}>
                Comparing {selected.length} courses
              </h2>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "0.5px solid rgba(255,255,255,0.14)", color: colors.muted, cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", padding: "8px 12px", textTransform: "uppercase" }}>Close</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `130px repeat(${selected.length}, minmax(0, 1fr))`, gap: "0" }}>
              <CompareRow label="" first values={selected.map(r => (
                <div key={r.course.id}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: colors.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{r.course.university}</div>
                  <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "13px", color: colors.text }}>{r.course.course}</div>
                </div>
              ))} />
              <CompareRow label="Admission chance" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: chanceColor(r.admissionChance) }}>{r.admissionChance}%</span>
              ))} />
              <CompareRow label="Match" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-display)", fontSize: "22px", color: colors.text }}>{r.matchScore}%</span>
              ))} />
              <CompareRow label="Your score vs cut-off" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.text }}>{r.reasons.scaleLabel} {r.reasons.studentScore} vs {r.reasons.cutoff}</span>
              ))} />
              <CompareRow label="Faculty" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-ui)", fontSize: "11px", color: colors.muted }}>{r.course.faculty}</span>
              ))} />
              <CompareRow label="Duration" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-ui)", fontSize: "11px", color: colors.muted }}>{r.course.duration} years</span>
              ))} />
              <CompareRow label="Interview" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-ui)", fontSize: "11px", color: r.reasons.interview ? "#C4A035" : colors.muted }}>{r.reasons.interview ? "Required" : "No"}</span>
              ))} />
              <CompareRow label="Labels" values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: colors.muted, textTransform: "uppercase", lineHeight: 1.6 }}>{r.course.categories.join(" · ")}</span>
              ))} />
              <CompareRow label="Campus fit" last values={selected.map(r => (
                <span key={r.course.id} style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: r.matchedLifestyle.length ? "#78BE50" : colors.faint, textTransform: "uppercase", lineHeight: 1.6 }}>{r.matchedLifestyle.length ? r.matchedLifestyle.join(" · ") : "—"}</span>
              ))} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CompareRow({ label, values, first, last }: { label: string; values: React.ReactNode[]; first?: boolean; last?: boolean }) {
  const border = last ? "none" : "0.5px solid rgba(255,255,255,0.08)";
  return (
    <>
      <div style={{
        gridColumn: "1", padding: first ? "0 14px 16px 0" : "14px 14px 14px 0",
        borderBottom: border,
        fontFamily: "var(--font-mono)", fontSize: "8px", color: "#9AA392", letterSpacing: "0.08em", textTransform: "uppercase",
        display: "flex", alignItems: "center",
      }}>
        {label}
      </div>
      {values.map((v, i) => (
        <div key={i} style={{
          padding: first ? "0 14px 16px" : "14px",
          borderBottom: border,
          borderLeft: "0.5px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center",
        }}>
          {v}
        </div>
      ))}
    </>
  );
}

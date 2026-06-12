// src/components/onboard/steps/Interests.tsx
"use client";
import { interestCategories } from "@/lib/courses";

interface Props {
  selected: string[];
  onChange: (v: string[]) => void;
  suggestedFromResume?: string[];
}

export function Interests({ selected, onChange, suggestedFromResume = [] }: Props) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "24px", color: "#E8EAE3" }}>
        What interests you?
      </h2>

      {/* Resume-detected suggestions banner */}
      {suggestedFromResume.length > 0 && (
        <div style={{ background: "rgba(120,190,80,0.06)", border: "0.5px solid rgba(120,190,80,0.25)", padding: "12px 16px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#78BE50", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Detected from your resume
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {suggestedFromResume.map(id => (
              <button key={id} onClick={() => toggle(id)} style={{
                fontFamily: "var(--font-mono)", fontSize: "9px", padding: "4px 10px",
                border: "0.5px solid #78BE50", letterSpacing: "0.08em", textTransform: "uppercase",
                background: selected.includes(id) ? "#78BE50" : "transparent",
                color: selected.includes(id) ? "#080A08" : "#78BE50", cursor: "pointer",
              }}>
                {interestCategories.find(c => c.id === id)?.label ?? id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full interest grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {interestCategories.map(cat => {
          const on = selected.includes(cat.id);
          return (
            <button key={cat.id} onClick={() => toggle(cat.id)} style={{
              fontFamily: "var(--font-mono)", fontSize: "9px", padding: "6px 12px",
              border: `0.5px solid ${on ? "#78BE50" : "rgba(255,255,255,0.12)"}`,
              background: on ? "rgba(120,190,80,0.18)" : "transparent",
              color: on ? "#E8EAE3" : "#9AA392", cursor: "pointer", letterSpacing: "0.08em",
              textTransform: "uppercase", transition: "all 0.15s",
            }}>
              {cat.icon} {cat.label}
            </button>
          );
        })}
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#6B7566", letterSpacing: "0.06em" }}>
        SELECT ALL THAT APPLY · {selected.length} SELECTED
      </div>
    </div>
  );
}
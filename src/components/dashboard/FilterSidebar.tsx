"use client";

import type { University } from "@/types";

const UNIVERSITIES: University[] = ["NUS", "NTU", "SMU", "SUTD", "SIT", "SUSS"];

interface Props {
  universities: University[];
  onUniversitiesChange: (v: University[]) => void;
  minProb: number;
  onMinProbChange: (v: number) => void;
  search: string;
  onSearchChange: (v: string) => void;
}

export function FilterSidebar({
  universities,
  onUniversitiesChange,
  minProb,
  onMinProbChange,
  search,
  onSearchChange,
}: Props) {
  const toggleUni = (u: University) => {
    onUniversitiesChange(
      universities.includes(u) ? universities.filter(x => x !== u) : [...universities, u]
    );
  };

  return (
    <aside style={{
      width: "240px", flexShrink: 0,
      background: "#0F120F",
      border: "0.5px solid rgba(255,255,255,0.08)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      height: "fit-content",
      position: "sticky",
      top: "80px",
    }}>
      <div>
        <label style={labelStyle}>Search courses</label>
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="e.g. Computer Science"
          style={inputStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Min. admission chance</label>
        <input
          type="range"
          min={0}
          max={90}
          step={5}
          value={minProb}
          onChange={e => onMinProbChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#78BE50" }}
        />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#78BE50" }}>{minProb}%+</span>
      </div>

      <div>
        <label style={labelStyle}>Universities</label>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {UNIVERSITIES.map(u => {
            const on = universities.length === 0 ? true : universities.includes(u);
            return (
              <button
                key={u}
                type="button"
                onClick={() => toggleUni(u)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  border: `0.5px solid ${on ? "#78BE50" : "rgba(255,255,255,0.1)"}`,
                  background: on ? "rgba(120,190,80,0.1)" : "transparent",
                  color: on ? "#78BE50" : "#9AA392",
                }}
              >
                {u}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => onUniversitiesChange([])}
          style={{ marginTop: "8px", fontFamily: "var(--font-mono)", fontSize: "8px", color: "#383E33", background: "none", border: "none", cursor: "pointer" }}
        >
          Show all
        </button>
      </div>
    </aside>
  );
}

const labelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "9px",
  color: "#9AA392",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  display: "block",
  marginBottom: "8px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#1A1E18",
  border: "0.5px solid rgba(255,255,255,0.1)",
  padding: "8px 10px",
  color: "#E8EAE3",
  fontFamily: "var(--font-ui)",
  fontSize: "12px",
  outline: "none",
};

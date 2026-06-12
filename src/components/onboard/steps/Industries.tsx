// src/components/onboard/steps/Industries.tsx
"use client";

const INDUSTRIES = [
  { id: "Technology",     icon: "💻", desc: "Software, hardware, startups, big tech" },
  { id: "Finance",        icon: "💹", desc: "Banking, investment, trading, insurance" },
  { id: "Healthcare",     icon: "🏥", desc: "Medicine, pharma, biotech, medtech" },
  { id: "Consulting",     icon: "📋", desc: "Management consulting, strategy" },
  { id: "Government",     icon: "🏛️", desc: "Public service, policy, civil service" },
  { id: "Engineering",    icon: "⚙️", desc: "Construction, aerospace, manufacturing" },
  { id: "Biotech",        icon: "🧬", desc: "Research, life sciences, genomics" },
  { id: "Media",          icon: "📺", desc: "Broadcasting, journalism, digital media" },
  { id: "Legal",          icon: "⚖️", desc: "Law firms, in-house counsel, judiciary" },
  { id: "Education",      icon: "📚", desc: "Teaching, edtech, research" },
  { id: "Design",         icon: "🎨", desc: "UX, product design, creative agencies" },
  { id: "Fintech",        icon: "🏦", desc: "Payments, crypto, digital banking" },
  { id: "Logistics",      icon: "🚢", desc: "Supply chain, shipping, aviation" },
  { id: "Sustainability", icon: "🌿", desc: "Green tech, environment, ESG" },
  { id: "Marketing",      icon: "📣", desc: "Advertising, brand, growth marketing" },
];

interface Props {
  selected: string[];
  onChange: (v: string[]) => void;
  suggestedFromResume?: string[];
}

export function Industries({ selected, onChange, suggestedFromResume = [] }: Props) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "24px", color: "#E8EAE3" }}>
        What industries excite you?
      </h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: "#9AA392", lineHeight: 1.6 }}>
        Pick sectors you'd want to work in. We surface courses with the right career pathways for each.
      </p>

      {suggestedFromResume.length > 0 && (
        <div style={{ background: "rgba(120,190,80,0.06)", border: "0.5px solid rgba(120,190,80,0.25)", padding: "12px 16px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#78BE50", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>
            Suggested from your resume
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {suggestedFromResume.map(id => (
              <button key={id} onClick={() => toggle(id)} style={{
                fontFamily: "var(--font-mono)", fontSize: "9px", padding: "4px 10px",
                border: "0.5px solid #78BE50", letterSpacing: "0.08em", textTransform: "uppercase",
                background: selected.includes(id) ? "#78BE50" : "transparent",
                color: selected.includes(id) ? "#080A08" : "#78BE50", cursor: "pointer",
              }}>{id}</button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        {INDUSTRIES.map(ind => {
          const on = selected.includes(ind.id);
          return (
            <button key={ind.id} onClick={() => toggle(ind.id)} style={{
              display: "flex", alignItems: "flex-start", gap: "10px", textAlign: "left",
              padding: "14px 16px",
              border: `0.5px solid ${on ? "#78BE50" : "rgba(255,255,255,0.09)"}`,
              background: on ? "rgba(120,190,80,0.08)" : "#0F120F",
              cursor: "pointer", transition: "all 0.15s",
            }}>
              <span style={{ fontSize: "18px", lineHeight: 1 }}>{ind.icon}</span>
              <div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "13px", fontWeight: 600, color: on ? "#E8EAE3" : "#9AA392", marginBottom: "3px" }}>{ind.id}</div>
                <div style={{ fontFamily: "var(--font-ui)", fontSize: "11px", color: "#6B7566", lineHeight: 1.4 }}>{ind.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
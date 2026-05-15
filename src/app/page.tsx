"use client";

export default function LandingPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#080A08", color: "#E8EAE3", fontFamily: "var(--font-ui), sans-serif" }}>

      {/* NAV */}
      <nav style={{
        height: "64px", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 48px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, background: "rgba(8,10,8,0.92)",
        backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 0, lineHeight: 1 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "22px", letterSpacing: "-0.02em", color: "#E8EAE3" }}>Can</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "22px", letterSpacing: "-0.02em", color: "#78BE50" }}>Go</span>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 900, fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#E8EAE3", marginLeft: "5px", paddingBottom: "2px", alignSelf: "flex-end" }}>Uni</span>
        </div>
        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9AA392", cursor: "pointer" }}>Courses</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#9AA392", cursor: "pointer" }}>About</span>
          <button style={{
            background: "#78BE50", color: "#080A08", border: "none",
            padding: "10px 20px", fontFamily: "var(--font-ui)", fontWeight: 700,
            fontSize: "13px", cursor: "pointer", letterSpacing: "0.02em",
          }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(120,190,80,0.07) 0%, transparent 65%)",
        }} />

        {/* Kicker pill */}
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: "10px",
          letterSpacing: "0.16em", textTransform: "uppercase",
          color: "#78BE50", marginBottom: "28px",
          display: "flex", alignItems: "center", gap: "10px",
          position: "relative",
        }}>
          <span style={{ color: "#383E33" }}>—</span>
          For JC &amp; Poly Students · Singapore
          <span style={{ color: "#383E33" }}>—</span>
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "var(--font-display)", fontWeight: 300,
          fontStyle: "italic", fontSize: "clamp(42px, 7vw, 80px)",
          letterSpacing: "-0.02em", lineHeight: 1.1,
          color: "#E8EAE3", marginBottom: "24px",
          maxWidth: "820px", position: "relative",
        }}>
          Eh, <span style={{ color: "#78BE50" }}>can go uni</span> or not?<br />
          Let&apos;s find out — properly.
        </h1>

        {/* Thin rule */}
        <div style={{ position: "relative", width: "80px", height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 auto 28px" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: "48px", height: "1px", background: "#78BE50" }} />
        </div>

        {/* Subheadline */}
        <p style={{
          fontFamily: "var(--font-ui)", fontWeight: 300,
          fontSize: "17px", color: "#9AA392",
          lineHeight: 1.7, maxWidth: "480px",
          marginBottom: "44px", position: "relative",
        }}>
          Enter your results. We crunch the real IGP numbers and show you
          exactly which courses you stand a chance at — across all 6 local universities.
        </p>

        {/* CTA buttons */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", position: "relative", marginBottom: "72px" }}>
          <button style={{
            background: "#78BE50", color: "#080A08",
            border: "none", padding: "14px 28px",
            fontFamily: "var(--font-ui)", fontWeight: 700,
            fontSize: "14px", cursor: "pointer", letterSpacing: "0.02em",
          }}>
            Check My Chances →
          </button>
          <button style={{
            background: "transparent", color: "#9AA392",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "14px 24px",
            fontFamily: "var(--font-mono)", fontSize: "10px",
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer",
          }}>
            How it works
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          paddingTop: "40px", position: "relative",
        }}>
          {[
            { n: "6",       l: "Universities" },
            { n: "500+",    l: "Courses"      },
            { n: "IGP '24", l: "Live data"    },
          ].map((s, i) => (
            <div key={i} style={{
              textAlign: "center", padding: "0 48px",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{
                fontFamily: "var(--font-display)", fontWeight: 300,
                fontSize: "36px", color: "#78BE50",
                lineHeight: 1, marginBottom: "8px",
              }}>
                {s.n}
              </div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "9px",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "#383E33",
              }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{
        padding: "96px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        maxWidth: "1100px", margin: "0 auto",
      }}>
        <div style={{ marginBottom: "56px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#383E33", marginBottom: "16px" }}>
            What we do
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(28px, 4vw, 42px)", color: "#E8EAE3", letterSpacing: "-0.01em" }}>
            Three tools, one clear answer.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
          {[
            {
              num: "01",
              title: "Admission Probability",
              desc: "Enter your rank points or GPA. We compare against real IGP data and estimate your exact % chance for every course at every university.",
            },
            {
              num: "02",
              title: "Course Discovery",
              desc: "Not sure what to study? Answer a few questions about your strengths and interests. We'll surface courses you'd never have considered.",
            },
            {
              num: "03",
              title: "AI Advisor",
              desc: "Chat with our AI like you'd talk to a senior who's been through it. Ask anything — course comparisons, campus life, career paths.",
            },
          ].map((f) => (
            <div key={f.num} style={{
              background: "#080A08", padding: "40px 32px",
              borderLeft: "2px solid transparent",
              transition: "border-color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.borderLeftColor = "#78BE50")}
              onMouseLeave={e => (e.currentTarget.style.borderLeftColor = "transparent")}
            >
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#78BE50", letterSpacing: "0.1em", marginBottom: "20px" }}>{f.num}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "16px", color: "#E8EAE3", marginBottom: "12px" }}>{f.title}</div>
              <div style={{ fontFamily: "var(--font-ui)", fontWeight: 300, fontSize: "14px", color: "#9AA392", lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* UNIVERSITIES */}
      <section style={{ padding: "64px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#383E33", marginBottom: "32px" }}>
          Covering all 6 local universities
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}>
          {["NUS", "NTU", "SMU", "SUTD", "SIT", "SUSS"].map(u => (
            <span key={u} style={{ fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "13px", color: "#383E33", letterSpacing: "0.06em" }}>{u}</span>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        padding: "96px 48px", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#383E33", marginBottom: "20px" }}>
          Free to use · No sign-up needed
        </div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic",
          fontSize: "clamp(32px, 5vw, 56px)", color: "#E8EAE3",
          letterSpacing: "-0.02em", marginBottom: "36px", lineHeight: 1.1,
        }}>
          Confirm can one.<br /><span style={{ color: "#78BE50" }}>Start here.</span>
        </h2>
        <button style={{
          background: "#78BE50", color: "#080A08", border: "none",
          padding: "16px 36px", fontFamily: "var(--font-ui)",
          fontWeight: 700, fontSize: "15px", cursor: "pointer", letterSpacing: "0.02em",
        }}>
          Check My Chances →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "32px 48px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0 }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "16px", color: "#383E33" }}>Can</span>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "16px", color: "#4A7A28" }}>Go</span>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 900, fontSize: "7px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#383E33", marginLeft: "4px" }}>Uni</span>
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "#383E33", letterSpacing: "0.08em" }}>
          © 2025 · For Singapore students
        </div>
      </footer>

    </main>
  );
}
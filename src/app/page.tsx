"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { colors } from "@/theme";
import { loadProfile } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import type { UserProfile } from "@/types";

const btnPrimary: React.CSSProperties = {
  background: colors.accent,
  color: colors.bg,
  border: "none",
  padding: "14px 28px",
  fontFamily: "var(--font-ui)",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
  letterSpacing: "0.02em",
};

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    setProfile(loadProfile());
  }, [user]);

  // Show the profile chip if signed in or a local profile exists.
  const hasProfile = Boolean(user) || Boolean(profile);

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text, fontFamily: "var(--font-ui), sans-serif" }}>
      <nav style={{
        height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, background: "rgba(8,10,8,0.92)", backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <Logo size="md" href="/" />
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <button type="button" onClick={() => scrollTo("features")} style={navBtn}>Courses</button>
          <button type="button" onClick={() => scrollTo("how-it-works")} style={navBtn}>About</button>
          {hasProfile ? (
            <Link href="/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: colors.accent, color: colors.bg, fontWeight: 700, fontSize: "16px" }} title="Profile">
              {profile?.schoolType === "Poly" ? "P" : profile?.schoolType === "JC" ? "J" : "•"}
            </Link>
          ) : (
            <button type="button" onClick={() => router.push("/login")} style={{ ...btnPrimary, padding: "10px 20px", fontSize: "13px" }}>Sign in</button>
          )}
        </div>
      </nav>

      <section style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 24px", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(120,190,80,0.07) 0%, transparent 65%)" }} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: colors.accent, marginBottom: "28px", display: "flex", gap: "10px" }}>
          <span style={{ color: colors.faint }}>—</span> For JC &amp; Poly Students · Singapore <span style={{ color: colors.faint }}>—</span>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(42px, 7vw, 80px)", lineHeight: 1.1, color: colors.text, marginBottom: "24px", maxWidth: "820px" }}>
          Eh, <span style={{ color: colors.accent }}>can go uni</span> or not?<br />Let&apos;s find out — properly.
        </h1>
        <p style={{ fontSize: "17px", color: colors.muted, lineHeight: 1.7, maxWidth: "480px", marginBottom: "44px" }}>
          Enter your results. We crunch the real IGP numbers and show you exactly which courses you stand a chance at — across all 6 local universities.
        </p>
        <div style={{ display: "flex", gap: "12px", marginBottom: "72px" }}>
          <button type="button" onClick={() => router.push("/login")} style={btnPrimary}>Check My Chances →</button>
          <button type="button" onClick={() => scrollTo("how-it-works")} style={{ background: "transparent", color: colors.muted, border: "1px solid rgba(255,255,255,0.12)", padding: "14px 24px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>How it works</button>
        </div>
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "40px" }}>
          {[{ n: "6", l: "Universities" }, { n: "500+", l: "Courses" }, { n: "IGP '26", l: "Live data" }].map((s, i) => (
            <div key={s.l} style={{ textAlign: "center", padding: "0 48px", borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "36px", color: colors.accent }}>{s.n}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, letterSpacing: "0.12em", textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" style={{ padding: "96px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, marginBottom: "48px" }}>Three steps to your answer.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {[
            { step: "01", title: "Build your profile", desc: "Enter grades, upload your resume, and tell us your interests." },
            { step: "02", title: "See your chances", desc: "We match you against real IGP data across all 6 local universities." },
            { step: "03", title: "Ask the AI advisor", desc: "Chat about courses, campus life, and career paths." },
          ].map(item => (
            <div key={item.step} style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "32px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.accent, marginBottom: "16px" }}>{item.step}</div>
              <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "10px" }}>{item.title}</div>
              <div style={{ fontSize: "14px", color: colors.muted, lineHeight: 1.65 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" style={{ padding: "96px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "clamp(28px, 4vw, 42px)", color: colors.text, marginBottom: "48px" }}>Three tools, one clear answer.</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1px", background: "rgba(255,255,255,0.06)" }}>
          {[
            { num: "01", title: "Admission Probability", desc: "Compare against real IGP data and estimate your % chance for every course." },
            { num: "02", title: "Course Discovery", desc: "Surface courses based on your strengths, interests, and resume." },
            { num: "03", title: "AI Advisor", desc: "Chat about course comparisons, campus life, and career paths." },
          ].map(f => (
            <div key={f.num} style={{ background: colors.bg, padding: "40px 32px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.accent, marginBottom: "20px" }}>{f.num}</div>
              <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "12px" }}>{f.title}</div>
              <div style={{ fontSize: "14px", color: colors.muted, lineHeight: 1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "96px 48px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(32px, 5vw, 56px)", marginBottom: "36px" }}>
          Confirm can one.<br /><span style={{ color: colors.accent }}>Start here.</span>
        </h2>
        <button type="button" onClick={() => router.push("/login")} style={{ ...btnPrimary, padding: "16px 36px", fontSize: "15px" }}>Check My Chances →</button>
      </section>

      <footer style={{ padding: "32px 48px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none", color: colors.faint }}>CanGoUni</Link>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint }}>© 2025 · For Singapore students</span>
      </footer>
    </main>
  );
}

const navBtn: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: colors.muted,
  cursor: "pointer",
  background: "none",
  border: "none",
};

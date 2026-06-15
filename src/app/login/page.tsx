"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { colors } from "@/theme";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { enabled, signInEmail, signUpEmail, signInGoogle } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await signInEmail(email, password);
        if (error) setError(error);
        else router.push("/dashboard");
      } else {
        const { error, needsConfirmation } = await signUpEmail(email, password);
        if (error) setError(error);
        else if (needsConfirmation) setInfo("Check your email to confirm your account, then sign in.");
        else router.push("/onboard");
      }
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    const { error } = await signInGoogle();
    if (error) setError(error);
    // On success Supabase redirects away, so nothing else to do here.
  }

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 55% at 50% 0%, rgba(120,190,80,0.07) 0%, transparent 65%)" }} />

      <Link href="/" style={{ display: "flex", alignItems: "baseline", lineHeight: 1, textDecoration: "none", marginBottom: "32px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: "26px", color: colors.text }}>Can</span>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "26px", color: colors.accent }}>Go</span>
        <span style={{ fontFamily: "var(--font-ui)", fontWeight: 900, fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: colors.text, marginLeft: "5px", alignSelf: "flex-end" }}>Uni</span>
      </Link>

      <div style={{ width: "100%", maxWidth: "380px", background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "32px", zIndex: 1 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "26px", marginBottom: "6px" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "13px", color: colors.muted, marginBottom: "24px", lineHeight: 1.5 }}>
          {mode === "login" ? "Sign in to access your saved profile and shortlist." : "Save your profile and shortlist across devices."}
        </p>

        {!enabled && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#C4A035", border: "0.5px solid rgba(196,160,53,0.4)", padding: "10px", marginBottom: "16px", lineHeight: 1.5 }}>
            Sign-in isn&apos;t configured yet. You can still explore as a guest below.
          </div>
        )}

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={!enabled || busy}
            style={inputStyle}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={!enabled || busy}
            style={inputStyle}
          />

          {error && <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "#E07070", lineHeight: 1.5 }}>{error}</div>}
          {info && <div style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.accent, lineHeight: 1.5 }}>{info}</div>}

          <button type="submit" disabled={!enabled || busy} style={{ ...primaryBtn, opacity: !enabled || busy ? 0.5 : 1 }}>
            {busy ? "..." : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "16px 0", color: colors.faint }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
        </div>

        <button type="button" onClick={google} disabled={!enabled} style={{ ...secondaryBtn, opacity: !enabled ? 0.5 : 1, marginBottom: "10px" }}>
          Continue with Google
        </button>

        <button type="button" onClick={() => router.push("/onboard")} style={secondaryBtn}>
          Explore as guest →
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setInfo(""); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.muted, letterSpacing: "0.04em" }}
          >
            {mode === "login" ? "No account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>

      <p style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginTop: "20px", maxWidth: "360px", textAlign: "center", lineHeight: 1.5, zIndex: 1 }}>
        Guests are stored only in this browser. Sign in to save your profile and shortlist across devices.
      </p>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  background: colors.bg,
  border: "0.5px solid rgba(255,255,255,0.12)",
  padding: "12px 14px",
  color: colors.text,
  fontFamily: "var(--font-ui)",
  fontSize: "14px",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  background: colors.accent,
  color: colors.bg,
  border: "none",
  padding: "13px",
  fontFamily: "var(--font-ui)",
  fontWeight: 700,
  fontSize: "14px",
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  width: "100%",
  background: "transparent",
  color: colors.text,
  border: "0.5px solid rgba(255,255,255,0.16)",
  padding: "12px",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  letterSpacing: "0.06em",
  cursor: "pointer",
};

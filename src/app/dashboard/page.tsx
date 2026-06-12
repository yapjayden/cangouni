"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterSidebar } from "@/components/dashboard/FilterSidebar";
import { ResultsGrid } from "@/components/dashboard/ResultsGrid";
import { calculateProbabilities } from "@/lib/probability";
import { colors } from "@/theme";
import type { ProbabilityResult, University, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<ProbabilityResult[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [minProb, setMinProb] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("cgu_profile");
    if (!raw) {
      router.replace("/onboard");
      return;
    }
    try {
      const p = JSON.parse(raw) as UserProfile;
      setProfile(p);
      setResults(calculateProbabilities(p));
    } catch {
      router.replace("/onboard");
    }
  }, [router]);

  const filtered = useMemo(() => {
    return results.filter(r => {
      if (r.admissionChance < minProb) return false;
      if (universities.length > 0 && !universities.includes(r.course.university)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.course.course} ${r.course.faculty} ${r.course.university}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [results, minProb, universities, search]);

  if (!profile) {
    return (
      <main style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted }}>
        Loading your results…
      </main>
    );
  }

  const scoreLabel = profile.schoolType === "JC"
    ? `${profile.rankPoints ?? "—"} RP`
    : `GPA ${profile.gpa ?? "—"}`;

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text }}>
      <header style={{
        height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky", top: 0, background: "rgba(8,10,8,0.95)", zIndex: 50,
      }}>
        <Link href="/" style={{ textDecoration: "none", color: colors.text, fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "20px" }}>
          Can<span style={{ color: colors.accent }}>Go</span>Uni
        </Link>
        <nav style={{ display: "flex", gap: "12px" }}>
          <Link href="/onboard" style={navLinkStyle}>Edit profile</Link>
          <Link href="/chat" style={{ ...navLinkStyle, background: colors.accent, color: colors.bg, border: "none" }}>AI Advisor →</Link>
        </nav>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Your admission outlook
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: "8px" }}>
            {filtered.length} courses ranked for you
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: colors.muted }}>
            {profile.schoolType} · {scoreLabel} · * = may require interview
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.faint, lineHeight: 1.6, marginTop: "10px", maxWidth: "640px" }}>
            Admission chance is an estimate from past IGP cut-offs — use it to compare courses, not as a guarantee.
            Match shows how well a course fits your subjects, interests and priorities.
          </p>
        </div>

        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
          <FilterSidebar
            universities={universities}
            onUniversitiesChange={setUniversities}
            minProb={minProb}
            onMinProbChange={setMinProb}
            search={search}
            onSearchChange={setSearch}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <ResultsGrid results={filtered} />
          </div>
        </div>
      </div>
    </main>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "10px 16px",
  border: "0.5px solid rgba(255,255,255,0.12)",
  color: colors.muted,
  textDecoration: "none",
};

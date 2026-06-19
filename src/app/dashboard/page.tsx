"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FilterSidebar, type SortKey } from "@/components/dashboard/FilterSidebar";
import { ResultsGrid } from "@/components/dashboard/ResultsGrid";
import { CompareTray } from "@/components/dashboard/CompareTray";
import { Logo } from "@/components/Logo";
import { calculateProbabilities } from "@/lib/probability";
import {
  loadProfile,
  saveProfile,
  loadBookmarks,
  saveBookmarks,
  encodeProfile,
  decodeProfile,
} from "@/lib/storage";
import { colors } from "@/theme";
import type { ProbabilityResult, University, UserProfile } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [results, setResults] = useState<ProbabilityResult[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [minProb, setMinProb] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [labels, setLabels] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [shortlistOnly, setShortlistOnly] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");

  const COMPARE_MAX = 4;
  const toggleCompare = (id: string) =>
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < COMPARE_MAX ? [...prev, id] : prev
    );

  const toggleBookmark = (id: string) =>
    setBookmarks(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      saveBookmarks(next);
      return next;
    });

  useEffect(() => {
    // A shared link (?p=...) takes precedence and is saved as the active profile.
    const shared = new URLSearchParams(window.location.search).get("p");
    const fromLink = shared ? decodeProfile(shared) : null;
    const p = fromLink ?? loadProfile();
    if (!p) {
      router.replace("/onboard");
      return;
    }
    if (fromLink) saveProfile(p);
    setProfile(p);
    setResults(calculateProbabilities(p));
    setBookmarks(loadBookmarks());
  }, [router]);

  // Every label (course category) and industry present in the results, for the manual filters.
  const allLabels = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => r.course.categories.forEach(c => set.add(c)));
    return [...set].sort();
  }, [results]);

  const allIndustries = useMemo(() => {
    const set = new Set<string>();
    results.forEach(r => r.course.industries.forEach(c => set.add(c)));
    return [...set].sort();
  }, [results]);

  const filtered = useMemo(() => {
    const matches = results.filter(r => {
      if (shortlistOnly && !bookmarks.includes(r.course.id)) return false;
      if (r.admissionChance < minProb) return false;
      if (universities.length > 0 && !universities.includes(r.course.university)) return false;
      if (labels.length > 0 && !labels.some(l => r.course.categories.includes(l))) return false;
      if (industries.length > 0 && !industries.some(ind => r.course.industries.includes(ind))) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${r.course.course} ${r.course.faculty} ${r.course.university}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...matches];
    if (sort === "admission") sorted.sort((a, b) => b.admissionChance - a.admissionChance);
    else if (sort === "match") sorted.sort((a, b) => b.matchScore - a.matchScore);
    else sorted.sort((a, b) => b.combinedScore - a.combinedScore);
    return sorted;
  }, [results, minProb, universities, labels, industries, search, sort, shortlistOnly, bookmarks]);

  // Copy a shareable link that re-creates these results from the profile alone.
  async function share() {
    if (!profile) return;
    const url = `${window.location.origin}/dashboard?p=${encodeProfile(profile)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareLabel("Link copied!");
    } catch {
      setShareLabel("Copy failed");
    }
    setTimeout(() => setShareLabel("Share"), 2000);
  }

  // Download the currently-shown ranking as a CSV.
  function downloadCsv() {
    const head = ["Rank", "University", "Course", "Faculty", "Admission chance %", "Match %", "Your score", "Cut-off", "Shortlisted"];
    const rows = filtered.map((r, i) => [
      i + 1,
      r.course.university,
      r.course.course,
      r.course.faculty,
      r.admissionChance,
      r.matchScore,
      `${r.reasons.scaleLabel} ${r.reasons.studentScore}`,
      r.reasons.cutoff,
      bookmarks.includes(r.course.id) ? "yes" : "",
    ]);
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [head, ...rows].map(row => row.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "cangouni-results.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // The selected courses, in the order the user picked them, for the compare tray.
  const compareSelected = useMemo(
    () => compareIds.map(id => results.find(r => r.course.id === id)).filter(Boolean) as ProbabilityResult[],
    [compareIds, results]
  );

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
        <Logo size="md" href="/" />
        <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button onClick={share} style={navBtnStyle}>{shareLabel}</button>
          <button onClick={downloadCsv} style={navBtnStyle}>Download</button>
          <Link href="/onboard" style={navLinkStyle}>Edit profile</Link>
          <Link href="/chat" style={{ ...navLinkStyle, background: colors.accent, color: colors.bg, border: "none" }}>AI Advisor →</Link>
        </nav>
      </header>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: compareSelected.length > 0 ? "32px 24px 120px" : "32px 24px 64px" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Your admission outlook
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "clamp(28px, 4vw, 40px)", marginBottom: "8px" }}>
            {filtered.length} courses ranked for you
          </h1>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: colors.muted }}>
            {profile.schoolType} · {scoreLabel}
            {profile.schoolType === "Poly" ? " · * = interview / aptitude test required" : ""} · † = estimated data
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: colors.faint, lineHeight: 1.6, marginTop: "10px", maxWidth: "640px" }}>
            Admission chance is an estimate from past IGP cut-offs — use it to compare courses, not as a guarantee.
            Match shows how well a course fits your subjects, interests and priorities.
            {profile.schoolType === "JC"
              ? " Interviews / aptitude tests for these programmes apply to polytechnic applicants — as an 'A'-level student you're assessed on grades."
              : ""}
            {" "}† SUTD does not publish per-programme grade profiles, so its figures are estimated.
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
            sort={sort}
            onSortChange={setSort}
            allLabels={allLabels}
            labels={labels}
            onLabelsChange={setLabels}
            allIndustries={allIndustries}
            industries={industries}
            onIndustriesChange={setIndustries}
            shortlistOnly={shortlistOnly}
            onShortlistOnlyChange={setShortlistOnly}
            shortlistCount={bookmarks.length}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <ResultsGrid
              results={filtered}
              compareIds={compareIds}
              onToggleCompare={toggleCompare}
              compareLimitReached={compareIds.length >= COMPARE_MAX}
              bookmarks={bookmarks}
              onToggleBookmark={toggleBookmark}
            />
          </div>
        </div>
      </div>

      <CompareTray
        selected={compareSelected}
        onRemove={toggleCompare}
        onClear={() => setCompareIds([])}
      />
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

const navBtnStyle: React.CSSProperties = {
  ...navLinkStyle,
  background: "transparent",
  cursor: "pointer",
};

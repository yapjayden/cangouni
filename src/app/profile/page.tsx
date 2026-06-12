"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { colors } from "@/theme";
import { loadProfile, loadBookmarks, clearProfile } from "@/lib/storage";
import { calculateProbabilities } from "@/lib/probability";
import type { UserProfile, ProbabilityResult } from "@/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkedCourses, setBookmarkedCourses] = useState<ProbabilityResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = loadProfile();
    if (!p) {
      router.replace("/onboard");
      return;
    }
    setProfile(p);
    const bm = loadBookmarks();
    setBookmarks(bm);

    const results = calculateProbabilities(p);
    const shortlisted = results.filter(r => bm.includes(r.course.id));
    setBookmarkedCourses(shortlisted);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearProfile();
    router.replace("/");
  };

  if (loading || !profile) {
    return (
      <main style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted }}>
        Loading…
      </main>
    );
  }

  const scoreLabel = profile.schoolType === "JC"
    ? `${profile.rankPoints ?? "—"} RP${profile.rankSystem ? ` (${profile.rankSystem}-pt)` : ""}`
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
        <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link href="/dashboard" style={navLinkStyle}>Back to results</Link>
          <button onClick={handleLogout} style={navBtnStyle}>Logout</button>
        </nav>
      </header>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "48px 24px" }}>
        {/* Profile Summary */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Your Profile
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "32px", marginBottom: "32px" }}>
            {profile.schoolType} Student
          </h1>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            {/* Academic Score */}
            <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "8px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Academic Score
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: colors.accent, marginBottom: "4px" }}>
                {scoreLabel}
              </div>
            </div>

            {/* Subjects */}
            {profile.subjects.length > 0 && (
              <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "8px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Subjects
                </div>
                <div style={{ fontSize: "14px", color: colors.text }}>
                  {profile.subjects.join(", ")}
                </div>
              </div>
            )}

            {/* Interests */}
            {profile.interests.length > 0 && (
              <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "8px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Interests
                </div>
                <div style={{ fontSize: "14px", color: colors.text }}>
                  {profile.interests.join(", ")}
                </div>
              </div>
            )}

            {/* Industries */}
            {profile.preferredIndustries.length > 0 && (
              <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "8px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Industries
                </div>
                <div style={{ fontSize: "14px", color: colors.text }}>
                  {profile.preferredIndustries.join(", ")}
                </div>
              </div>
            )}

            {/* Lifestyle Preferences */}
            {profile.lifestylePrefs.length > 0 && (
              <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "8px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Lifestyle Preferences
                </div>
                <div style={{ fontSize: "14px", color: colors.text }}>
                  {profile.lifestylePrefs.join(", ")}
                </div>
              </div>
            )}

            {/* Resume Keywords */}
            {profile.resumeKeywords.length > 0 && (
              <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "24px", borderRadius: "8px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Skills
                </div>
                <div style={{ fontSize: "13px", color: colors.text, lineHeight: 1.5 }}>
                  {profile.resumeKeywords.slice(0, 5).join(", ")}
                  {profile.resumeKeywords.length > 5 ? ` +${profile.resumeKeywords.length - 5} more` : ""}
                </div>
              </div>
            )}
          </div>

          <Link href="/onboard" style={{ ...linkStyle, display: "inline-block" }}>
            ← Edit Profile
          </Link>
        </div>

        {/* Bookmarked Courses */}
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "8px" }}>
            Saved Courses
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: "24px", marginBottom: "24px" }}>
            {bookmarkedCourses.length} shortlisted {bookmarkedCourses.length === 1 ? "course" : "courses"}
          </h2>

          {bookmarkedCourses.length === 0 ? (
            <div style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "32px", textAlign: "center", borderRadius: "8px" }}>
              <p style={{ color: colors.muted, marginBottom: "16px" }}>No courses saved yet.</p>
              <Link href="/dashboard" style={{ ...linkStyle, display: "inline-block" }}>
                Go to Dashboard →
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {bookmarkedCourses.map(r => (
                <div key={r.course.id} style={{ background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "20px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", color: colors.text }}>
                      {r.course.university} {r.course.course}
                    </div>
                    <div style={{ fontSize: "13px", color: colors.muted, marginTop: "4px" }}>
                      {r.course.faculty} · {r.course.duration} years
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "18px", fontWeight: 700, color: colors.accent }}>
                      {r.admissionChance}%
                    </div>
                    <div style={{ fontSize: "11px", color: colors.faint, marginTop: "4px" }}>
                      admission chance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

const linkStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "10px 16px",
  border: "0.5px solid rgba(255,255,255,0.12)",
  color: colors.muted,
  textDecoration: "none",
  borderRadius: "4px",
};

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

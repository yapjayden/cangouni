// src/app/onboard/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfile, ResumeParseResult } from "@/types";
import { colors } from "@/theme";
import { ResumeUpload } from "@/components/onboard/steps/ResumeUpload";
import { Interests } from "@/components/onboard/steps/Interests";
import { Industries } from "@/components/onboard/steps/Industries";

const STEPS = ["Academic", "Resume", "Interests", "Industries", "Lifestyle"];

const SUBJECTS = [
  "Mathematics", "Further Mathematics", "Physics", "Chemistry", "Biology",
  "Economics", "Computing", "Literature", "History", "Geography",
  "Art & Design", "Accounting",
];

const EMPTY: UserProfile = {
  schoolType: "JC", rankSystem: "70", subjects: [],
  resumeText: "", resumeKeywords: [], achievements: "",
  interests: [], preferredIndustries: [], lifestylePrefs: [],
};

export default function OnboardPage() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(EMPTY);
  const [resumeData, setResumeData] = useState<ResumeParseResult | null>(null);
  const router = useRouter();

  const update = (patch: Partial<UserProfile>) => setProfile(p => ({ ...p, ...patch }));

  function handleResumeParsed(result: ResumeParseResult) {
    setResumeData(result);
    update({
      resumeText: result.rawText,
      resumeKeywords: result.keywords,
      interests: profile.interests.length === 0 ? result.detectedInterests : profile.interests,
      preferredIndustries: profile.preferredIndustries.length === 0 ? result.detectedIndustries : profile.preferredIndustries,
    });
  }

  function submit() {
    sessionStorage.setItem("cgu_profile", JSON.stringify(profile));
    router.push("/dashboard");
  }

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px" }}>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "48px", width: "100%", maxWidth: "520px" }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "6px", height: "6px", background: i <= step ? colors.accent : colors.faint }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase", color: i <= step ? colors.accent : colors.faint, whiteSpace: "nowrap" }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: "0.5px", background: i < step ? colors.accent : "rgba(255,255,255,0.08)", margin: "0 4px", marginBottom: "14px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Form card */}
      <div style={{ width: "100%", maxWidth: "520px", background: colors.surface, border: "0.5px solid rgba(255,255,255,0.08)", padding: "36px" }}>

        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "24px", color: colors.text }}>Your academic profile</h2>
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>School type</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {(["JC", "Poly"] as const).map(t => (
                  <button key={t} onClick={() => update({ schoolType: t })} style={{
                    flex: 1, padding: "10px",
                    border: `0.5px solid ${profile.schoolType === t ? colors.accent : "rgba(255,255,255,0.1)"}`,
                    background: profile.schoolType === t ? "rgba(120,190,80,0.1)" : "transparent",
                    color: profile.schoolType === t ? colors.accent : colors.muted,
                    fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer",
                  }}>{t}</button>
                ))}
              </div>
            </div>
            {profile.schoolType === "JC" ? (
              <>
                <div>
                  <label style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Rank-point system</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {([["70", "70-point (2026 onwards)"], ["90", "90-point (before 2026)"]] as const).map(([sys, label]) => {
                      const on = (profile.rankSystem ?? "70") === sys;
                      return (
                        <button key={sys} onClick={() => update({ rankSystem: sys, rankPoints: undefined })} style={{
                          flex: 1, padding: "10px 8px",
                          border: `0.5px solid ${on ? colors.accent : "rgba(255,255,255,0.1)"}`,
                          background: on ? "rgba(120,190,80,0.1)" : "transparent",
                          color: on ? colors.accent : colors.muted,
                          fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", lineHeight: 1.4,
                        }}>{label}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  {(() => {
                    const max = (profile.rankSystem ?? "70") === "70" ? 70 : 90;
                    return (
                      <>
                        <label style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Rank Points (0–{max})</label>
                        <input type="number" min={0} max={max} step={0.5} value={profile.rankPoints ?? ""} onChange={e => update({ rankPoints: parseFloat(e.target.value) })} placeholder={max === 70 ? "e.g. 68.75" : "e.g. 87.5"}
                          style={{ width: "100%", background: colors.input, border: "0.5px solid rgba(255,255,255,0.1)", padding: "10px 13px", color: colors.text, fontFamily: "var(--font-ui)", fontSize: "13px", outline: "none" }} />
                      </>
                    );
                  })()}
                </div>
              </>
            ) : (
              <div>
                <label style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>GPA (0.0–4.0)</label>
                <input type="number" min={0} max={4} step={0.01} value={profile.gpa ?? ""} onChange={e => update({ gpa: parseFloat(e.target.value) })} placeholder="e.g. 3.85"
                  style={{ width: "100%", background: colors.input, border: "0.5px solid rgba(255,255,255,0.1)", padding: "10px 13px", color: colors.text, fontFamily: "var(--font-ui)", fontSize: "13px", outline: "none" }} />
              </div>
            )}
            <div>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.muted, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Your strongest subjects</label>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: "11px", color: colors.faint, marginBottom: "10px" }}>Pick the ones closest to your studies — we use these to surface courses that fit your strengths.</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {SUBJECTS.map(subject => {
                  const on = profile.subjects.includes(subject);
                  return (
                    <button key={subject} onClick={() => update({ subjects: on ? profile.subjects.filter(s => s !== subject) : [...profile.subjects, subject] })} style={{
                      fontFamily: "var(--font-mono)", fontSize: "9px", padding: "6px 12px",
                      border: `0.5px solid ${on ? colors.accent : "rgba(255,255,255,0.12)"}`,
                      background: on ? "rgba(120,190,80,0.1)" : "transparent",
                      color: on ? colors.text : colors.muted, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
                    }}>{subject}</button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step === 1 && <ResumeUpload onParsed={handleResumeParsed} />}

        {step === 2 && (
          <Interests
            selected={profile.interests}
            onChange={interests => update({ interests })}
            suggestedFromResume={resumeData?.detectedInterests}
          />
        )}

        {step === 3 && (
          <Industries
            selected={profile.preferredIndustries}
            onChange={preferredIndustries => update({ preferredIndustries })}
            suggestedFromResume={resumeData?.detectedIndustries}
          />
        )}

        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize: "24px", color: colors.text }}>What matters to you on campus?</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {["Strong hall life","Research focus","Career-oriented","Sports culture","Study spaces","Vibrant social scene","Overseas exchange","Startup ecosystem","Arts & culture","Close-knit community"].map(pref => {
                const on = profile.lifestylePrefs.includes(pref);
                return (
                  <button key={pref} onClick={() => update({ lifestylePrefs: on ? profile.lifestylePrefs.filter(p => p !== pref) : [...profile.lifestylePrefs, pref] })} style={{
                    fontFamily: "var(--font-mono)", fontSize: "9px", padding: "6px 12px",
                    border: `0.5px solid ${on ? colors.accent : "rgba(255,255,255,0.12)"}`,
                    background: on ? "rgba(120,190,80,0.1)" : "transparent",
                    color: on ? colors.text : colors.muted, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer",
                  }}>{pref}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* Nav buttons */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ background: "transparent", color: colors.muted, border: "0.5px solid rgba(255,255,255,0.1)", padding: "10px 20px", fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer" }}>← Back</button>
          ) : <div />}
          <button onClick={step < STEPS.length - 1 ? () => setStep(s => s + 1) : submit} style={{ background: colors.accent, color: colors.bg, border: "none", padding: "10px 24px", fontFamily: "var(--font-ui)", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
            {step === STEPS.length - 1 ? "See My Results →" : "Continue →"}
          </button>
        </div>
      </div>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: colors.faint, letterSpacing: "0.08em", marginTop: "16px" }}>
        STEP {step + 1} OF {STEPS.length} · DATA STAYS IN YOUR BROWSER
      </div>
    </main>
  );
}
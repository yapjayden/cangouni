export type University = "NUS" | "NTU" | "SMU" | "SUTD" | "SIT" | "SUSS";
export type SchoolType = "JC" | "Poly";
export type Trend = "rising" | "stable" | "falling";

export interface UserProfile {
  // Step 1 — Academic
  schoolType: SchoolType;
  rankSystem?: "70" | "90";      // JC rank-point scale: 70-pt (2026+) or 90-pt (older)
  rankPoints?: number;           // JC: 0–90 (or 0–70 on the new scale)
  gpa?: number;                  // Poly: 0.0–4.0
  subjects: string[];            // strongest subjects, used for course-fit matching

  // Step 2 — Resume
  resumeText?: string;           // raw extracted text
  resumeKeywords: string[];      // AI-extracted skills, roles, achievements
  achievements: string;          // free-text fallback

  // Step 3 — Interests
  interests: string[];           // e.g. ["AI", "computing", "design"]

  // Step 4 — Industries
  preferredIndustries: string[]; // e.g. ["Technology", "Finance"]

  // Step 5 — Lifestyle
  lifestylePrefs: string[];
}

export interface CourseEntry {
  id: string;
  university: University;
  faculty: string;
  course: string;
  degree: string;
  duration: number;
  type: "JC" | "Poly" | "Both";
  rankPoints90: number;          // 10th-percentile cut-off, 90-pt scale
  rankPoints70: number;          // 10th-percentile cut-off, 70-pt scale (2026+)
  polyGpa10: number | null;      // 10th-percentile cut-off GPA (null = no poly route)
  polyGpa90: number | null;
  alGrade10: string | null;
  alGrade90: string | null;
  requiresAssessment: boolean;
  trend: Trend;
  categories: string[];          // interest tags
  industries: string[];          // career pathways e.g. ["finance", "banking"]
  subjectReqs: string[];
  lifestyleTags: string[];       // campus-life traits inherited from the university
  resumeKeywords: string[];      // keywords that boost this course from resume match
  notes: string;
  url: string;                   // official university course/programme page
}

export interface ProbabilityResult {
  course: CourseEntry;
  admissionChance: number;       // 3–97, academic estimate only (grades vs cut-off)
  matchScore: number;            // 0–100, suitability to the student's preferences
  combinedScore: number;         // chance × 0.55 + match × 0.45, used for sorting
  matchedLifestyle: string[];    // student's lifestyle prefs this university satisfies
  label: string;
  reasons: {
    cutoff: number;              // course cut-off in the student's scale
    studentScore: number;        // student's score in the same scale
    scaleLabel: string;          // "RP (70-pt)" | "RP (90-pt)" | "GPA"
    interview: boolean;
    interests: number;           // matched counts, for the "why you match" line
    subjects: number;
    industries: number;
    resumeHits: number;
    matchedInterests: string[];  // the actual items that matched, for plain-language reasons
    matchedSubjects: string[];
    matchedIndustries: string[];
  };
}

export interface ResumeParseResult {
  rawText: string;
  keywords: string[];
  detectedInterests: string[];
  detectedIndustries: string[];
}
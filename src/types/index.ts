export type University = "NUS" | "NTU" | "SMU" | "SUTD" | "SIT" | "SUSS";
export type SchoolType = "JC" | "Poly";
export type Trend = "rising" | "stable" | "falling";

export interface UserProfile {
  // Step 1 — Academic
  schoolType: SchoolType;
  rankPoints?: number;           // JC: 0–90
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
  polyGpa10: number | null;
  polyGpa90: number | null;
  alGrade10: string | null;
  alGrade90: string | null;
  requiresAssessment: boolean;
  trend: Trend;
  categories: string[];          // interest tags
  industries: string[];          // career pathways e.g. ["finance", "banking"]
  subjectReqs: string[];
  resumeKeywords: string[];      // keywords that boost this course from resume match
  notes: string;
}

export interface ProbabilityResult {
  course: CourseEntry;
  probability: number;           // 5–95, chance of admission
  fitScore: number;              // 0–100, profile match
  combinedScore: number;         // prob × 0.6 + fit × 0.4, used for sorting
  label: string;
  breakdown: {
    baseProb: number;
    subjectBoost: number;
    interestBoost: number;
    industryBoost: number;
    resumeBoost: number;
    assessmentPenalty: number;
  };
}

export interface ResumeParseResult {
  rawText: string;
  keywords: string[];
  detectedInterests: string[];
  detectedIndustries: string[];
}
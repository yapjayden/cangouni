import { igpData } from "@/lib/courses";
import { UserProfile, ProbabilityResult, CourseEntry } from "@/types";

const MAX = { rp90: 90, rp70: 70, gpa: 4 };

/**
 * Resolve the student's score, the course's cut-off, and the max for the
 * student's track — JC uses the 70-pt (2026+) or 90-pt rank-point scale,
 * poly uses GPA. Everything downstream works off these three numbers.
 */
function track(course: CourseEntry, profile: UserProfile) {
  if (profile.schoolType === "Poly") {
    return { cutoff: course.polyGpa10 ?? MAX.gpa, max: MAX.gpa, score: profile.gpa ?? 0, scaleLabel: "GPA" };
  }
  const use70 = (profile.rankSystem ?? "70") === "70";
  return {
    cutoff: use70 ? course.rankPoints70 : course.rankPoints90,
    max: use70 ? MAX.rp70 : MAX.rp90,
    score: profile.rankPoints ?? 0,
    scaleLabel: use70 ? "RP (70-pt)" : "RP (90-pt)",
  };
}

/**
 * Estimated admission chance from the gap to the published IGP cut-off.
 *
 * The cut-off is the 10th percentile of ADMITTED students (≈90% of those
 * admitted scored at or above it), so a student exactly at the cut-off is
 * borderline. We pass the gap (in % of the scale's max, so one curve fits all
 * tracks) through a logistic anchored at:
 *   gap  0%  → ~55%   right at the cut-off — competitive but not safe
 *   gap +8%  → ~85%   clearly above — safe
 *   gap −8%  → ~25%   clearly below — unlikely but not impossible
 * Interview/portfolio courses carry uncertainty grades can't cover, so their
 * chance is scaled down. This is an estimate for comparing courses, not a
 * guaranteed probability.
 */
function admissionChance(cutoff: number, max: number, score: number, interview: boolean): number {
  const gap = ((score - cutoff) / max) * 100;
  let p = 1 / (1 + Math.exp(-(0.19 * gap + 0.2)));
  if (interview) p *= 0.9;
  return Math.round(Math.max(3, Math.min(97, p * 100)));
}

/** Lifestyle prefs the university satisfies — feeds Match only, never chance. */
function matchedLifestyleTags(course: CourseEntry, profile: UserProfile): string[] {
  if (!profile.lifestylePrefs?.length || !course.lifestyleTags?.length) return [];
  return course.lifestyleTags.filter(tag => profile.lifestylePrefs.includes(tag));
}

/**
 * Suitability as an interpretable weighted percentage rather than arbitrary
 * point additions. Each dimension contributes a 0–1 ratio (saturating, so a
 * couple of strong matches = full marks), and only dimensions the student
 * actually filled in are counted — blank fields don't drag the score down.
 */
function suitability(course: CourseEntry, profile: UserProfile) {
  const interests = course.categories.filter(cat =>
    profile.interests.some(i => i.toLowerCase() === cat.toLowerCase())
  ).length;

  const subjects = course.subjectReqs.filter(req =>
    profile.subjects.some(s => s.toLowerCase() === req.toLowerCase())
  ).length;

  const industries = course.industries.filter(ind =>
    profile.preferredIndustries.some(pi => {
      const a = pi.toLowerCase();
      const b = ind.toLowerCase();
      return a.includes(b) || b.includes(a);
    })
  ).length;

  const lifestyle = matchedLifestyleTags(course, profile).length;

  const text = `${course.course} ${course.categories.join(" ")} ${course.industries.join(" ")}`.toLowerCase();
  const resumeHits = (profile.resumeKeywords ?? []).filter(k => k.length > 3 && text.includes(k.toLowerCase())).length;

  const dims = [
    { weight: 0.30, provided: profile.interests.length > 0, ratio: Math.min(interests / 3, 1) },
    { weight: 0.25, provided: profile.subjects.length > 0, ratio: Math.min(subjects / 2, 1) },
    { weight: 0.20, provided: profile.preferredIndustries.length > 0, ratio: Math.min(industries / 2, 1) },
    { weight: 0.15, provided: profile.lifestylePrefs.length > 0, ratio: profile.lifestylePrefs.length ? lifestyle / profile.lifestylePrefs.length : 0 },
    { weight: 0.10, provided: (profile.resumeKeywords ?? []).length > 0, ratio: Math.min(resumeHits / 4, 1) },
  ];
  const active = dims.filter(d => d.provided);
  const totalWeight = active.reduce((sum, d) => sum + d.weight, 0) || 1;
  const matchScore = Math.round((active.reduce((sum, d) => sum + d.ratio * d.weight, 0) / totalWeight) * 100);

  return { matchScore, interests, subjects, industries, resumeHits };
}

export function calculateProbabilities(profile: UserProfile): ProbabilityResult[] {
  return igpData
    .filter(course => (profile.schoolType === "Poly" ? course.polyGpa10 != null : true))
    .map(course => {
      const t = track(course, profile);
      const chance = admissionChance(t.cutoff, t.max, t.score, course.requiresAssessment);
      const s = suitability(course, profile);
      const matchedLifestyle = matchedLifestyleTags(course, profile);

      // Rank by a blend that slightly favours courses you can actually get into.
      const combinedScore = chance * 0.55 + s.matchScore * 0.45;

      return {
        course,
        admissionChance: chance,
        matchScore: s.matchScore,
        combinedScore,
        matchedLifestyle,
        reasons: {
          cutoff: Math.round(t.cutoff * 10) / 10,
          studentScore: Math.round(t.score * 10) / 10,
          scaleLabel: t.scaleLabel,
          interview: course.requiresAssessment,
          interests: s.interests,
          subjects: s.subjects,
          industries: s.industries,
          resumeHits: s.resumeHits,
        },
        label: `${chance}%${course.requiresAssessment ? "*" : ""}`,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

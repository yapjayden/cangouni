import { igpData } from "@/data/igp";
import { UserProfile, ProbabilityResult, CourseEntry } from "@/types";

// Normalise both grading systems to 0–90 scale
function normaliseScore(profile: UserProfile): number {
  if (profile.schoolType === "JC") return profile.rankPoints ?? 70;
  return (profile.gpa ?? 3.0) * 22.5; // 4.0 GPA → 90 RP equivalent
}

// Sigmoid-like curve: right at boundary = 50%, approaches 95% above, 5% below
function calcBaseProbability(studentScore: number, igp10: number): number {
  const igpScore = igp10 * 22.5;
  const gap = studentScore - igpScore;
  const prob = 50 + (gap * 5) - (gap * gap * 0.15);
  return Math.max(5, Math.min(95, prob));
}

// +3% per matching interest category, capped at +12%
function calcInterestBoost(course: CourseEntry, profile: UserProfile): number {
  const matches = course.categories.filter(cat =>
    profile.interests.some(i => i.toLowerCase() === cat.toLowerCase())
  ).length;
  return Math.min(matches * 3, 12);
}

// +2% per matching preferred industry, capped at +8%
function calcIndustryBoost(course: CourseEntry, profile: UserProfile): number {
  if (!course.industries) return 0;
  const matches = course.industries.filter(ind =>
    profile.preferredIndustries.some(pi =>
      pi.toLowerCase().includes(ind.toLowerCase()) ||
      ind.toLowerCase().includes(pi.toLowerCase())
    )
  ).length;
  return Math.min(matches * 2, 8);
}

// +1% per resume keyword that matches course keywords, capped at +6%
function calcResumeBoost(course: CourseEntry, profile: UserProfile): number {
  if (!profile.resumeKeywords?.length || !course.resumeKeywords?.length) return 0;
  const profileKws = profile.resumeKeywords.map(k => k.toLowerCase());
  const courseKws = course.resumeKeywords.map(k => k.toLowerCase());
  const matches = profileKws.filter(k => courseKws.includes(k)).length;
  return Math.min(matches, 6);
}

// Fit Score: how well the course matches the student regardless of grades
function calcFitScore(course: CourseEntry, profile: UserProfile): number {
  const totalCats = Math.max(course.categories.length, 1);
  const matchedInterests = course.categories.filter(cat =>
    profile.interests.some(i => i.toLowerCase() === cat.toLowerCase())
  ).length;
  const interestScore = (matchedInterests / totalCats) * 40;

  const totalInds = Math.max((course.industries ?? []).length, 1);
  const matchedInds = (course.industries ?? []).filter(ind =>
    profile.preferredIndustries.some(pi => pi.toLowerCase().includes(ind.toLowerCase()))
  ).length;
  const industryScore = (matchedInds / totalInds) * 35;

  const totalKws = Math.max((course.resumeKeywords ?? []).length, 1);
  const matchedKws = (profile.resumeKeywords ?? []).filter(k =>
    (course.resumeKeywords ?? []).map(ck => ck.toLowerCase()).includes(k.toLowerCase())
  ).length;
  const resumeScore = Math.min(matchedKws / totalKws, 1) * 25;

  return Math.round(interestScore + industryScore + resumeScore);
}

export function calculateProbabilities(profile: UserProfile): ProbabilityResult[] {
  const studentScore = normaliseScore(profile);

  return igpData
    .filter(course => course.type === profile.schoolType || course.type === "Both")
    .filter(course => profile.schoolType === "Poly" ? course.polyGpa10 !== null : true)
    .map(course => {
      const igp10 = profile.schoolType === "Poly"
        ? course.polyGpa10!
        : parseFloat(course.alGrade10?.split("/")[0] ?? "3.5");

      const baseProb      = calcBaseProbability(studentScore, igp10);
      const interestBoost = calcInterestBoost(course, profile);
      const industryBoost = calcIndustryBoost(course, profile);
      const resumeBoost   = calcResumeBoost(course, profile);
      const penalty       = course.requiresAssessment ? 5 : 0;

      const probability = Math.round(
        Math.max(5, Math.min(95, baseProb + interestBoost + industryBoost + resumeBoost - penalty))
      );
      const fitScore = calcFitScore(course, profile);
      const combinedScore = (probability * 0.6) + (fitScore * 0.4);

      
    return {
        course, probability, fitScore, combinedScore,
        label: `${probability}%${course.requiresAssessment ? "*" : ""}`,
        breakdown: {
            baseProb: Math.round(baseProb),
            interestBoost, industryBoost, resumeBoost,
            assessmentPenalty: penalty,
        },
    };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);
}
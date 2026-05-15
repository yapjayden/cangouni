import { igpData } from "@/lib/courses";
import { UserProfile, ProbabilityResult, CourseEntry } from "@/types";

function studentScore(profile: UserProfile): number {
  if (profile.schoolType === "JC") return profile.rankPoints ?? 70;
  return (profile.gpa ?? 3.0) * 22.5;
}

function igpThreshold(course: CourseEntry, profile: UserProfile): number {
  if (profile.schoolType === "Poly") return (course.polyGpa10 ?? 3) * 22.5;
  return parseFloat(course.alGrade10 ?? "65") || 65;
}

function calcBaseProbability(score: number, threshold: number): number {
  const gap = score - threshold;
  const prob = 50 + gap * 5 - gap * gap * 0.15;
  return Math.max(5, Math.min(95, prob));
}

function calcInterestBoost(course: CourseEntry, profile: UserProfile): number {
  const matches = course.categories.filter(cat =>
    profile.interests.some(i => i.toLowerCase() === cat.toLowerCase())
  ).length;
  return Math.min(matches * 3, 12);
}

function calcIndustryBoost(course: CourseEntry, profile: UserProfile): number {
  const matches = course.industries.filter(ind =>
    profile.preferredIndustries.some(pi =>
      pi.toLowerCase().includes(ind.toLowerCase()) ||
      ind.toLowerCase().includes(pi.toLowerCase())
    )
  ).length;
  return Math.min(matches * 2, 8);
}

function calcResumeBoost(course: CourseEntry, profile: UserProfile): number {
  if (!profile.resumeKeywords?.length) return 0;
  const text = `${course.course} ${course.categories.join(" ")} ${course.industries.join(" ")}`.toLowerCase();
  const matches = profile.resumeKeywords.filter(k => k.length > 3 && text.includes(k.toLowerCase())).length;
  return Math.min(matches, 6);
}

function calcFitScore(course: CourseEntry, profile: UserProfile): number {
  const totalCats = Math.max(course.categories.length, 1);
  const matchedInterests = course.categories.filter(cat =>
    profile.interests.some(i => i.toLowerCase() === cat.toLowerCase())
  ).length;
  const interestScore = (matchedInterests / totalCats) * 40;

  const totalInds = Math.max(course.industries.length, 1);
  const matchedInds = course.industries.filter(ind =>
    profile.preferredIndustries.some(pi => pi.toLowerCase().includes(ind.toLowerCase()))
  ).length;
  const industryScore = (matchedInds / totalInds) * 35;

  const text = `${course.course} ${course.categories.join(" ")}`.toLowerCase();
  const matchedKws = (profile.resumeKeywords ?? []).filter(k => k.length > 3 && text.includes(k.toLowerCase())).length;
  const resumeScore = Math.min(matchedKws / 5, 1) * 25;

  return Math.round(interestScore + industryScore + resumeScore);
}

export function calculateProbabilities(profile: UserProfile): ProbabilityResult[] {
  const score = studentScore(profile);

  return igpData
    .filter(course => profile.schoolType === "Poly" ? course.polyGpa10 != null : true)
    .map(course => {
      const threshold = igpThreshold(course, profile);
      const baseProb = calcBaseProbability(score, threshold);
      const interestBoost = calcInterestBoost(course, profile);
      const industryBoost = calcIndustryBoost(course, profile);
      const resumeBoost = calcResumeBoost(course, profile);
      const penalty = course.requiresAssessment ? 5 : 0;

      const probability = Math.round(
        Math.max(5, Math.min(95, baseProb + interestBoost + industryBoost + resumeBoost - penalty))
      );
      const fitScore = calcFitScore(course, profile);
      const combinedScore = probability * 0.6 + fitScore * 0.4;

      return {
        course,
        probability,
        fitScore,
        combinedScore,
        label: `${probability}%${course.requiresAssessment ? "*" : ""}`,
        breakdown: {
          baseProb: Math.round(baseProb),
          interestBoost,
          industryBoost,
          resumeBoost,
          assessmentPenalty: penalty,
        },
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);
}

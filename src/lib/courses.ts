import { universityData, type CourseIGP } from "@/data/igp";
import type { CourseEntry, University } from "@/types";

export const interestCategories = [
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "AI", label: "AI & ML", icon: "🤖" },
  { id: "computing", label: "Computing", icon: "🖥️" },
  { id: "engineering", label: "Engineering", icon: "⚙️" },
  { id: "business", label: "Business", icon: "📊" },
  { id: "finance", label: "Finance", icon: "💹" },
  { id: "fintech", label: "Fintech", icon: "🏦" },
  { id: "law", label: "Law", icon: "⚖️" },
  { id: "medicine", label: "Medicine", icon: "🩺" },
  { id: "healthcare", label: "Healthcare", icon: "🏥" },
  { id: "design", label: "Design", icon: "🎨" },
  { id: "architecture", label: "Architecture", icon: "🏛️" },
  { id: "data", label: "Data Science", icon: "📈" },
  { id: "analytics", label: "Analytics", icon: "🔍" },
  { id: "social sciences", label: "Social Sciences", icon: "🌍" },
  { id: "psychology", label: "Psychology", icon: "🧠" },
  { id: "communications", label: "Communications", icon: "📣" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "biotech", label: "Biotech", icon: "🧬" },
  { id: "economics", label: "Economics", icon: "📉" },
  { id: "marketing", label: "Marketing", icon: "📢" },
  { id: "supply chain", label: "Supply Chain", icon: "🚢" },
  { id: "games", label: "Games", icon: "🎮" },
  { id: "arts", label: "Arts", icon: "🎭" },
] as const;

const CATEGORY_RULES: { pattern: RegExp; tags: string[] }[] = [
  { pattern: /law|legal/i, tags: ["law"] },
  { pattern: /medic|nurs|dentist|pharm|health/i, tags: ["medicine", "healthcare", "science"] },
  { pattern: /computer|computing|info|ict|software|data|analytics|ai|artificial/i, tags: ["technology", "computing", "AI", "data"] },
  { pattern: /engineer|architecture|built|design & eng/i, tags: ["engineering", "technology"] },
  { pattern: /business|account|finance|econom|marketing|management|commerce/i, tags: ["business", "finance", "economics", "marketing"] },
  { pattern: /fintech|financial technology/i, tags: ["fintech", "finance", "technology"] },
  { pattern: /psycholog|social|sociolog|humanities|behavioural/i, tags: ["psychology", "social sciences"] },
  { pattern: /communicat|media|journalism|film|arts/i, tags: ["communications", "arts", "media"] },
  { pattern: /design|architecture|fine art|creative/i, tags: ["design", "architecture", "arts"] },
  { pattern: /biotech|biology|life science|science/i, tags: ["biotech", "science"] },
  { pattern: /supply|logistics|maritime|aviation/i, tags: ["supply chain", "engineering"] },
  { pattern: /education|teaching|early childhood/i, tags: ["education", "social sciences"] },
  { pattern: /game|interactive media/i, tags: ["games", "technology", "design"] },
  { pattern: /music|theatre|dance/i, tags: ["arts"] },
];

// Relevant / recommended subjects per course, inferred from the course name.
// Labels MUST match the SUBJECTS list shown in onboarding so they can be matched.
const SUBJECT_RULES: { pattern: RegExp; tags: string[] }[] = [
  { pattern: /engineer|architecture|built|aerospace|mechanical|electrical|civil|robot/i, tags: ["Mathematics", "Physics"] },
  { pattern: /computer|computing|info|ict|software|data|analytics|ai|artificial|game/i, tags: ["Mathematics", "Computing"] },
  { pattern: /medic|nurs|dentist|pharm|health|biolog|life science|biotech/i, tags: ["Biology", "Chemistry"] },
  { pattern: /business|account|finance|econom|bank|commerce|management|fintech/i, tags: ["Mathematics", "Economics"] },
  { pattern: /\bscience\b|physic|chemi/i, tags: ["Chemistry", "Mathematics"] },
  { pattern: /design|fine art|creative|media|interactive/i, tags: ["Art & Design"] },
  { pattern: /law|legal/i, tags: ["Literature", "History"] },
  { pattern: /psycholog|social|sociolog|humanities|communicat|arts|geograph/i, tags: ["Literature", "Geography"] },
];

const INDUSTRY_RULES: { pattern: RegExp; tags: string[] }[] = [
  { pattern: /law|legal/i, tags: ["Legal"] },
  { pattern: /medic|nurs|dentist|pharm|health/i, tags: ["Healthcare"] },
  { pattern: /computer|computing|info|ict|software|engineer|technology|sutd/i, tags: ["Technology", "Engineering"] },
  { pattern: /business|account|finance|econom|marketing|management/i, tags: ["Finance", "Consulting", "Marketing"] },
  { pattern: /design|architecture|creative|arts|media/i, tags: ["Design", "Media"] },
  { pattern: /education|teaching/i, tags: ["Education"] },
  { pattern: /psycholog|social work|human resource/i, tags: ["Government", "Healthcare", "Education"] },
  { pattern: /biotech|biology|science/i, tags: ["Biotech", "Healthcare"] },
  { pattern: /supply|logistics|maritime/i, tags: ["Logistics", "Engineering"] },
  { pattern: /public safety|security/i, tags: ["Government"] },
];

// Campus-life traits per university. Labels MUST match the lifestyle options
// shown in onboarding so a student's priorities can be matched against them.
// (These describe the university, not the individual course.)
const UNIVERSITY_LIFESTYLE: Record<University, string[]> = {
  NUS:  ["Strong hall life", "Research focus", "Sports culture", "Study spaces", "Vibrant social scene", "Overseas exchange", "Startup ecosystem", "Arts & culture"],
  NTU:  ["Strong hall life", "Research focus", "Sports culture", "Study spaces", "Overseas exchange", "Arts & culture"],
  SMU:  ["Career-oriented", "Vibrant social scene", "Overseas exchange", "Startup ecosystem", "Close-knit community"],
  SUTD: ["Research focus", "Startup ecosystem", "Close-knit community", "Study spaces"],
  SIT:  ["Career-oriented", "Close-knit community", "Sports culture"],
  SUSS: ["Career-oriented", "Close-knit community"],
};

function inferTags(text: string, rules: { pattern: RegExp; tags: string[] }[]): string[] {
  const out = new Set<string>();
  for (const { pattern, tags } of rules) {
    if (pattern.test(text)) tags.forEach(t => out.add(t));
  }
  return [...out];
}

function toCourseEntry(c: CourseIGP): CourseEntry {
  const text = `${c.courseName} ${c.school ?? ""}`;
  const categories = inferTags(text, CATEGORY_RULES);
  if (categories.length === 0) categories.push("science");

  return {
    id: c.id,
    university: c.university as University,
    faculty: c.school ?? c.university,
    course: c.courseName,
    degree: "Bachelor",
    duration: 4,
    type: c.polyGPA != null ? "Both" : "JC",
    rankPoints90: c.rankPoints90,
    rankPoints70: c.rankPoints70,
    polyGpa10: c.polyGPA,
    polyGpa90: c.polyGPA,
    alGrade10: String(c.rankPoints90),
    alGrade90: String(c.rankPoints90),
    requiresAssessment: c.hasInterview,
    trend: "stable",
    categories,
    industries: inferTags(text, INDUSTRY_RULES),
    subjectReqs: inferTags(text, SUBJECT_RULES),
    lifestyleTags: UNIVERSITY_LIFESTYLE[c.university as University] ?? [],
    resumeKeywords: categories,
    notes: `IGP grades: ${c.aLevelGrades}`,
  };
}

export const igpData: CourseEntry[] = universityData.map(toCourseEntry);

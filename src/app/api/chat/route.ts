// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not set");
      return new Response("API key not configured", { status: 500 });
    }

    const { messages, userProfile, rankedCourses } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const courses = Array.isArray(rankedCourses) ? rankedCourses : [];
    const courseLines = courses.length
      ? courses
          .map(
            (c: { university: string; course: string; admissionChance: number; matchScore: number; interview?: boolean; shortlisted?: boolean }, i: number) =>
              `${i + 1}. ${c.university} ${c.course} — admission chance ${c.admissionChance}%, match ${c.matchScore}%${c.interview ? ", needs interview" : ""}${c.shortlisted ? ", SHORTLISTED" : ""}`
          )
          .join("\n")
      : "not yet calculated";

    // Describe the academic score WITH its scale so the AI doesn't misread it.
    // JC rank points: higher is better, max is 70 (2026+ scale) or 90 (older).
    // Poly: GPA out of 4.0. A score AT the max is the strongest possible.
    let academicLine: string;
    if (userProfile?.schoolType === "JC") {
      const max = (userProfile?.rankSystem ?? "70") === "70" ? 70 : 90;
      const rp = userProfile?.rankPoints;
      const note =
        typeof rp === "number"
          ? rp >= max
            ? ` — this is the MAXIMUM possible (a perfect score); higher RP is better`
            : ` out of a max of ${max} (higher RP is better)`
          : "";
      academicLine = `${rp ?? "not provided"} rank points on the ${max}-point scale${note}`;
    } else if (userProfile?.schoolType === "Poly") {
      academicLine = `GPA ${userProfile?.gpa ?? "not provided"} out of 4.0 (higher is better)`;
    } else {
      academicLine = "not provided";
    }

    const system = `You are the CanGoUni AI advisor for Singapore students.

Singapore JC rank points: a HIGHER number is BETTER. The 2026+ scale maxes at 70,
the older scale maxes at 90. So 70 on the 70-point scale is a PERFECT score, and
90 on the 90-point scale is perfect. Never treat a near-max rank point as weak.
Poly GPA is out of 4.0, where higher is better.

Student Profile:
- School Type: ${userProfile?.schoolType ?? "unknown"}
- Academic Score: ${academicLine}
- Subjects: ${userProfile?.subjects?.join(", ") ?? "not specified"}
- Skills/Experience: ${userProfile?.resumeKeywords?.slice(0, 8).join(", ") ?? "none"}
- Interests: ${userProfile?.interests?.slice(0, 8).join(", ") ?? "not specified"}
- Preferred Industries: ${userProfile?.preferredIndustries?.join(", ") ?? "not specified"}
- Lifestyle Preferences: ${userProfile?.lifestylePrefs?.join(", ") ?? "not specified"}

The student's top ranked courses (from our estimator, based on past IGP cut-offs):
${courseLines}

When recommending, reference specific courses by number and respect SHORTLISTED courses.
Admission chance is estimated vs past cut-offs, not guaranteed.
Match reflects fit to their interests, subjects, and priorities.
Be direct, specific, and professional. Max 4 sentences unless asked for more.`;

    const priorHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Seed the system prompt as the opening turn instead of using
    // `systemInstruction`, which this API version rejects (it forces an
    // unsupported role: "system" on the Content).
    const history = [
      { role: "user", parts: [{ text: system }] },
      { role: "model", parts: [{ text: "Understood — I'll advise based on this profile and these ranked courses." }] },
      ...priorHistory,
    ];

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(messages.at(-1).content);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream)
            controller.enqueue(new TextEncoder().encode(chunk.text()));
          controller.close();
        } catch (e) {
          console.error("Chat stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (e) {
    console.error("Chat API error:", e);
    return new Response(`Chat error: ${e instanceof Error ? e.message : String(e)}`, { status: 500 });
  }
}

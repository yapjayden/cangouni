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

    // Strip resumeText to avoid JSON encoding issues with newlines/special chars
    const profileForSystem = userProfile ? { ...userProfile, resumeText: undefined } : {};

    const system = `You are the CanGoUni AI advisor for Singapore students.
Profile: ${JSON.stringify(profileForSystem)}
Interests: ${userProfile?.interests?.join(", ") ?? "not specified"}
Preferred industries: ${userProfile?.preferredIndustries?.join(", ") ?? "not specified"}
Resume keywords: ${userProfile?.resumeKeywords?.slice(0, 10).join(", ") ?? "none"}

The student's top ranked courses (from our estimator, based on past IGP cut-offs):
${courseLines}

Admission chance is an estimate vs past cut-offs, not a guarantee. Match is fit to
their interests/subjects/priorities. When recommending, reference these specific
courses and their numbers, and respect any SHORTLISTED ones.
Be direct, specific, occasionally Singlish. Max 4 sentences unless asked for more.`;

    const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history, systemInstruction: system });
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

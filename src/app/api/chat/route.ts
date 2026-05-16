// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { messages, userProfile } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const system = `You are the CanGoUni AI advisor for Singapore students.
Profile: ${JSON.stringify(userProfile ?? {})}
Interests: ${userProfile?.interests?.join(", ") ?? "not specified"}
Preferred industries: ${userProfile?.preferredIndustries?.join(", ") ?? "not specified"}
Resume keywords: ${userProfile?.resumeKeywords?.slice(0, 10).join(", ") ?? "none"}
Be direct, specific, occasionally Singlish. Max 4 sentences unless asked for more.`;

  const history = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history, systemInstruction: system });
  const result = await chat.sendMessageStream(messages.at(-1).content);

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of result.stream)
        controller.enqueue(new TextEncoder().encode(chunk.text()));
      controller.close();
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

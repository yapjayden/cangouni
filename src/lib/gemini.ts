import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

/**
 * Models tried in order. When the primary is overloaded (503 "high demand"),
 * we fall back to the next one — which is usually under less load — rather
 * than just failing the user's request.
 */
const MODELS = ["gemini-2.5-flash", "gemini-2.0-flash"] as const;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** True for transient "try again later" errors (overload / rate limit). */
function isTransient(err: unknown): boolean {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return /\b(503|429|500)\b|overload|high demand|unavailable|rate limit|try again/.test(msg);
}

/**
 * Call Gemini's generateContent with automatic model fallback and a short
 * retry, so a temporary spike in demand doesn't surface as an error to users.
 */
export async function generateContentResilient(
  apiKey: string,
  parts: Array<string | Part>,
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErr: unknown;

  // Two rounds over the model list = up to 4 attempts, with brief backoff.
  for (let round = 0; round < 2; round++) {
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(parts);
        return result.response.text() ?? "";
      } catch (err) {
        lastErr = err;
        if (!isTransient(err)) throw err; // real error — don't waste retries
        await sleep(700);
      }
    }
  }

  if (isTransient(lastErr)) {
    throw new Error("The AI service is briefly overloaded. Please wait a few seconds and try again.");
  }
  throw lastErr instanceof Error ? lastErr : new Error("AI request failed");
}

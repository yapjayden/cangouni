"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatThread, type ChatMessage } from "@/components/chat/ChatThread";
import { ChatInput } from "@/components/chat/ChatInput";
import { colors } from "@/theme";
import type { UserProfile } from "@/types";

const STARTERS = [
  "Which of my top courses should I apply first?",
  "What's the difference between NUS and NTU computing?",
  "How do I improve my chances for SMU business?",
];

export default function ChatPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("cgu_profile");
    if (!raw) {
      router.replace("/onboard");
      return;
    }
    try {
      setProfile(JSON.parse(raw) as UserProfile);
    } catch {
      router.replace("/onboard");
    }
  }, [router]);

  async function send(text: string) {
    if (!profile || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);

    const assistantIdx = nextMessages.length;
    setMessages([...nextMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
          userProfile: profile,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages(prev => {
          const copy = [...prev];
          copy[assistantIdx] = { role: "assistant", content: full };
          return copy;
        });
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev];
        copy[assistantIdx] = {
          role: "assistant",
          content: "Sorry, I couldn't respond. Check your GEMINI_API_KEY in .env.local and try again.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
    }
  }

  if (!profile) {
    return (
      <main style={{ minHeight: "100vh", background: colors.bg, display: "flex", alignItems: "center", justifyContent: "center", color: colors.muted }}>
        Loading…
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: colors.bg, color: colors.text, display: "flex", flexDirection: "column" }}>
      <header style={{
        height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <Link href="/dashboard" style={{ textDecoration: "none", color: colors.muted, fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.08em" }}>
          ← Back to results
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "18px" }}>AI Advisor</span>
        <Link href="/onboard" style={{ textDecoration: "none", color: colors.muted, fontFamily: "var(--font-mono)", fontSize: "10px" }}>
          Edit profile
        </Link>
      </header>

      <div style={{ flex: 1, maxWidth: "720px", width: "100%", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", minHeight: 0 }}>
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
            {STARTERS.map(q => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={loading}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  padding: "8px 12px",
                  border: "0.5px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  color: colors.muted,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <ChatThread messages={messages} />
        <ChatInput onSend={send} disabled={loading} />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { ChatBubble } from "./ChatBubble";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Props {
  messages: ChatMessage[];
}

export function ChatThread({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "8px 0", minHeight: "320px" }}>
      {messages.length === 0 && (
        <p style={{ fontFamily: "var(--font-ui)", fontSize: "14px", color: "#9AA392", textAlign: "center", padding: "48px 24px" }}>
          Ask me anything — course comparisons, which uni suits you, or what your chances mean.
        </p>
      )}
      {messages.map((m, i) => (
        <ChatBubble key={i} role={m.role} content={m.content} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

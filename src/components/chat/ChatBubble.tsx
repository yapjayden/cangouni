"use client";

interface Props {
  role: "user" | "assistant";
  content: string;
}

export function ChatBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: "12px",
    }}>
      <div style={{
        maxWidth: "85%",
        padding: "12px 16px",
        background: isUser ? "rgba(120,190,80,0.15)" : "#0F120F",
        border: `0.5px solid ${isUser ? "rgba(120,190,80,0.35)" : "rgba(255,255,255,0.08)"}`,
        fontFamily: "var(--font-ui)",
        fontSize: "14px",
        lineHeight: 1.6,
        color: "#E8EAE3",
        whiteSpace: "pre-wrap",
      }}>
        {content || (role === "assistant" ? "…" : "")}
      </div>
    </div>
  );
}

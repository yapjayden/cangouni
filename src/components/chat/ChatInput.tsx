"use client";

import { FormEvent, useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} style={{
      display: "flex",
      gap: "8px",
      padding: "16px 0 0",
      borderTop: "0.5px solid rgba(255,255,255,0.08)",
    }}>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={disabled}
        placeholder="Ask about courses, campus life, careers…"
        style={{
          flex: 1,
          background: "#0F120F",
          border: "0.5px solid rgba(255,255,255,0.1)",
          padding: "12px 14px",
          color: "#E8EAE3",
          fontFamily: "var(--font-ui)",
          fontSize: "14px",
          outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        style={{
          background: "#78BE50",
          color: "#080A08",
          border: "none",
          padding: "12px 20px",
          fontFamily: "var(--font-ui)",
          fontWeight: 700,
          fontSize: "13px",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled || !text.trim() ? 0.5 : 1,
        }}
      >
        Send
      </button>
    </form>
  );
}

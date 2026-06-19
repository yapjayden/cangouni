import Link from "next/link";
import { colors } from "@/theme";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const sizes = {
    sm: { can: "20px", go: "20px", uni: "8px" },
    md: { can: "22px", go: "22px", uni: "9px" },
    lg: { can: "26px", go: "26px", uni: "11px" },
  };

  const s = sizes[size];

  const content = (
    <div style={{ display: "flex", alignItems: "baseline", lineHeight: 1 }}>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontSize: s.can, color: colors.text }}>Can</span>
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 300, fontStyle: "italic", fontSize: s.go, color: colors.accent }}>Go</span>
      <span style={{ fontFamily: "var(--font-ui)", fontWeight: 900, fontSize: s.uni, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.text, marginLeft: "5px", alignSelf: "flex-end" }}>Uni</span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  }

  return content;
}

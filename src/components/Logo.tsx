import Link from "next/link";
import { colors } from "@/theme";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const fontSize = { sm: "20px", md: "22px", lg: "26px" }[size];

  const content = (
    <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 300, fontSize, color: colors.text, lineHeight: 1 }}>
      Can<span style={{ color: colors.accent }}>Go</span>Uni
    </span>
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

/**
 * CanGoUni design tokens — the single source of truth for the brand.
 *
 * The whole app styles with inline `style={{ ... }}` objects, so colors and
 * fonts live here as plain values you can import anywhere:
 *
 *   import { colors, fonts } from "@/theme";
 *   <div style={{ background: colors.bg, color: colors.text }} />
 *
 * Want to rebrand? Change a value here and it updates everywhere that imports
 * it. (Fonts are wired up in src/app/layout.tsx via next/font.)
 */

export const colors = {
  bg: "#080A08", // page background (also used as text color on the accent button)
  surface: "#0F120F", // cards & panels
  input: "#1A1E18", // form input fields

  text: "#E8EAE3", // primary text
  muted: "#9AA392", // secondary text
  faint: "#6B7566", // tertiary text & subtle dividers (brighter than before)

  accent: "#78BE50", // brand green
} as const;

/**
 * Translucent shades — kept as raw rgba strings because they layer over other
 * colors. The white borders give the thin hairline outlines; the green tints
 * are the accent at low opacity (for highlighted/selected states).
 */
export const tints = {
  border: "rgba(255,255,255,0.08)", // standard hairline border
  borderSoft: "rgba(255,255,255,0.06)", // faintest section divider
  accentSoft: "rgba(120,190,80,0.1)", // accent fill for selected chips/buttons
} as const;

/** Font-family CSS variables, defined by next/font in src/app/layout.tsx. */
export const fonts = {
  display: "var(--font-display)", // Cormorant Garamond — headings
  ui: "var(--font-ui)", // Figtree — body & buttons
  mono: "var(--font-mono)", // Martian Mono — labels & captions
} as const;

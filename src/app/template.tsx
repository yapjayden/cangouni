"use client";

// Wraps every page. Because a template remounts on each top-level navigation
// (unlike a layout, which persists), this gives us a clean "enter" animation on
// every route change — a soft fade with a subtle upward rise. The easing curve
// [0.22, 1, 0.36, 1] is an ease-out-expo: fast to start, gently settling, which
// reads as smooth and deliberate rather than bouncy.
import { motion, useReducedMotion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

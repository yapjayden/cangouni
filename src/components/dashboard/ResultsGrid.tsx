"use client";

import type { ProbabilityResult } from "@/types";
import { ProbabilityCard } from "./ProbabilityCard";

interface Props {
  results: ProbabilityResult[];
}

export function ResultsGrid({ results }: Props) {
  if (results.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#9AA392", fontFamily: "var(--font-ui)" }}>
        No courses match your filters. Try lowering the minimum probability or clearing university filters.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {results.map((r, i) => (
        <ProbabilityCard key={r.course.id} result={r} rank={i + 1} />
      ))}
    </div>
  );
}

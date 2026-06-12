"use client";

import type { ProbabilityResult } from "@/types";
import { ProbabilityCard } from "./ProbabilityCard";

interface Props {
  results: ProbabilityResult[];
  compareIds?: string[];
  onToggleCompare?: (id: string) => void;
  compareLimitReached?: boolean;
}

export function ResultsGrid({ results, compareIds = [], onToggleCompare, compareLimitReached }: Props) {
  if (results.length === 0) {
    return (
      <div style={{ padding: "48px", textAlign: "center", color: "#9AA392", fontFamily: "var(--font-ui)" }}>
        No courses match your filters. Try lowering the minimum admission chance or clearing university filters.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {results.map((r, i) => (
        <ProbabilityCard
          key={r.course.id}
          result={r}
          rank={i + 1}
          compareSelected={compareIds.includes(r.course.id)}
          onToggleCompare={onToggleCompare}
          compareDisabled={compareLimitReached}
        />
      ))}
    </div>
  );
}

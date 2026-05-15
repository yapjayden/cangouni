import { NextRequest, NextResponse } from "next/server";
import { calculateProbabilities } from "@/lib/probability";
import type { UserProfile } from "@/types";

export async function POST(req: NextRequest) {
  const profile = (await req.json()) as UserProfile;
  if (!profile?.schoolType) {
    return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  }
  const results = calculateProbabilities(profile);
  return NextResponse.json({ results });
}

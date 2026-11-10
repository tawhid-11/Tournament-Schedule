import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({}));
    const updated = tournamentStore.generateFixtures(params.id, {
      legs: body.legs || 1,
      hasThirdPlace: body.hasThirdPlace ?? true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({
      matches: updated.matches,
      count: updated.matches.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

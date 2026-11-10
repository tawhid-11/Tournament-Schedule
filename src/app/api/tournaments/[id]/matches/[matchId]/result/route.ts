import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";
import { UpdateScoreSchema } from "@/lib/validations/tournament.schema";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; matchId: string } }
) {
  try {
    const body = await req.json();
    const validated = UpdateScoreSchema.parse(body);

    const updated = tournamentStore.updateMatchScore(
      params.id,
      params.matchId,
      validated
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Tournament or match not found" },
        { status: 404 }
      );
    }

    const updatedMatch = updated.matches.find((m) => m.id === params.matchId);
    return NextResponse.json({
      match: updatedMatch,
      matches: updated.matches,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.errors ? err.errors[0].message : err.message },
      { status: 400 }
    );
  }
}

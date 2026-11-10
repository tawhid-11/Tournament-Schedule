import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";
import { CreateTournamentSchema } from "@/lib/validations/tournament.schema";

export async function GET(req: NextRequest) {
  try {
    const tournaments = tournamentStore.getAll();
    return NextResponse.json({ tournaments });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateTournamentSchema.parse(body);

    const tournament = tournamentStore.create({
      name: validated.name,
      sportType: validated.sportType,
      sportLabel: validated.sportLabel,
      scoreModel: validated.scoreModel,
      format: validated.format,
      season: validated.season,
      startDate: validated.startDate,
      endDate: validated.endDate,
      isPublic: validated.isPublic,
    });

    return NextResponse.json({ tournament }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.errors ? err.errors[0].message : err.message },
      { status: 400 }
    );
  }
}

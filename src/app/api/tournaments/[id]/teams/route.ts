import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const tournament = tournamentStore.getById(params.id);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }
  return NextResponse.json({ teams: tournament.teams });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    // Accept either a single team or an array of teams (e.g. from CSV import)
    const teamsToAdd = Array.isArray(body) ? body : [body];

    const updated = tournamentStore.addTeams(params.id, teamsToAdd);
    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    return NextResponse.json({ teams: updated.teams }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

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
  return NextResponse.json({ groups: tournament.groups });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { groups } = await req.json();
    const updated = tournamentStore.saveGroups(params.id, groups);
    if (!updated) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }
    return NextResponse.json({ groups: updated.groups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

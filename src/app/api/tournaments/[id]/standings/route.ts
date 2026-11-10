import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const standingsMap = tournamentStore.getStandings(params.id);
    const groupsStandings: Record<string, any[]> = {};
    standingsMap.forEach((table, groupName) => {
      groupsStandings[groupName] = table;
    });

    return NextResponse.json({ standings: groupsStandings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

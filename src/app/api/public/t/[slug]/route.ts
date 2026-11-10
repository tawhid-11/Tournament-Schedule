import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const tournament = tournamentStore.getBySlug(params.slug);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const standingsMap = tournamentStore.getStandings(tournament.id);
    const standings: Record<string, any[]> = {};
    standingsMap.forEach((table, groupName) => {
      standings[groupName] = table;
    });

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        slug: tournament.slug,
        sportType: tournament.sportType,
        sportLabel: tournament.sportLabel,
        scoreModel: tournament.scoreModel,
        season: tournament.season,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        teams: tournament.teams,
        groups: tournament.groups,
        matches: tournament.matches,
        venues: tournament.venues,
      },
      standings,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { tournamentStore } from "@/lib/tournament-store";
import { createBatchBannersZip, BatchBannerItem } from "@/lib/banner/zip-packager";
import { BannerSize } from "@/lib/banner/types";
import { formatDate, formatTime } from "@/lib/utils";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tournament = tournamentStore.getById(params.id);
    if (!tournament) {
      return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const templateId = body.templateId || "modern-bold";
    const size = (body.size || "SQUARE_1080x1080") as BannerSize;

    const teamMap = new Map(tournament.teams.map((t) => [t.id, t]));
    const venueMap = new Map(tournament.venues.map((v) => [v.id, v]));

    // Prepare batch items for all matches
    const items: BatchBannerItem[] = tournament.matches.map((m, idx) => {
      const homeTeam = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
      const awayTeam = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
      const venue = m.venueId ? venueMap.get(m.venueId) : null;

      const homeName = homeTeam?.name || m.homePlaceholder || "Home";
      const awayName = awayTeam?.name || m.awayPlaceholder || "Away";

      return {
        filename: `match_${m.matchNumber || idx + 1}_${homeName}_vs_${awayName}.png`,
        templateId,
        size,
        data: {
          tournamentName: tournament.name,
          stageName: "Tournament Match",
          groupName: m.groupId || null,
          roundNumber: m.round,
          matchday: m.matchday || 1,
          dateStr: formatDate(m.scheduledAt || new Date()),
          timeStr: formatTime(m.scheduledAt || new Date()) || "TBD",
          venueName: venue?.name || "Main Arena",
          homeTeam: {
            name: homeName,
            shortName: homeTeam?.shortName || homeName.slice(0, 3).toUpperCase(),
            primaryColor: homeTeam?.primaryColor || "#2563eb",
          },
          awayTeam: {
            name: awayName,
            shortName: awayTeam?.shortName || awayName.slice(0, 3).toUpperCase(),
            primaryColor: awayTeam?.primaryColor || "#ef4444",
          },
          result:
            m.status === "COMPLETED" && m.homeScore !== undefined && m.awayScore !== undefined
              ? { homeScore: m.homeScore, awayScore: m.awayScore }
              : undefined,
        },
      };
    });

    const zipBuffer = await createBatchBannersZip(items.slice(0, 10)); // Top 10 matches for responsive download

    return new NextResponse(zipBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${tournament.slug}-banners.zip"`,
      },
    });
  } catch (err: any) {
    console.error("ZIP export error:", err);
    return NextResponse.json(
      { error: "Failed to generate ZIP", details: err.message },
      { status: 500 }
    );
  }
}

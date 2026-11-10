import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renderMatchBannerToPng } from "@/lib/banner/renderer";
import { BannerSize, MatchBannerData } from "@/lib/banner/types";
import { formatDate, formatTime } from "@/lib/utils";

export async function GET(
  req: NextRequest,
  { params }: { params: { matchId: string } }
) {
  try {
    const { matchId } = params;
    const url = new URL(req.url);
    const templateId = url.searchParams.get("template") || "modern-bold";
    const size = (url.searchParams.get("size") || "SQUARE_1080x1080") as BannerSize;

    // Fetch match from database
    let match = null;
    try {
      match = await db.match.findUnique({
        where: { id: matchId },
        include: {
          tournament: true,
          stage: true,
          group: true,
          venue: true,
          homeTeam: { include: { team: true } },
          awayTeam: { include: { team: true } },
          result: true,
        },
      });
    } catch (e) {
      // Fallback if DB is unavailable
    }

    // Default or mock data if not found or DB disconnected
    const homeTeamName =
      match?.homeTeam?.team.name || match?.homePlaceholder || "Home Team";
    const homeShortName =
      match?.homeTeam?.team.shortName ||
      homeTeamName.slice(0, 3).toUpperCase();
    const awayTeamName =
      match?.awayTeam?.team.name || match?.awayPlaceholder || "Away Team";
    const awayShortName =
      match?.awayTeam?.team.shortName ||
      awayTeamName.slice(0, 3).toUpperCase();

    const bannerData: MatchBannerData = {
      tournamentName: match?.tournament.name || "Championship Tournament",
      stageName: match?.stage.name || "Playoffs",
      groupName: match?.group?.name || null,
      roundNumber: match?.round || 1,
      matchday: match?.matchday || 1,
      dateStr: formatDate(match?.scheduledAt || new Date()),
      timeStr: formatTime(match?.scheduledAt || new Date()) || "18:00 UTC",
      venueName: match?.venue?.name || "Main Arena",
      homeTeam: {
        name: homeTeamName,
        shortName: homeShortName,
        primaryColor: match?.homeTeam?.team.primaryColor || "#3b82f6",
      },
      awayTeam: {
        name: awayTeamName,
        shortName: awayShortName,
        primaryColor: match?.awayTeam?.team.primaryColor || "#ef4444",
      },
      result: match?.result
        ? {
            homeScore: match.result.homeScore,
            awayScore: match.result.awayScore,
          }
        : undefined,
    };

    const pngBuffer = await renderMatchBannerToPng(bannerData, {
      templateId,
      size,
    });

    return new NextResponse(pngBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("Banner generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate match banner", details: error.message },
      { status: 500 }
    );
  }
}

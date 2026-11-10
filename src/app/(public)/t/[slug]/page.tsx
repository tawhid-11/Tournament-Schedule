import React from "react";
import { notFound } from "next/navigation";
import { tournamentStore } from "@/lib/tournament-store";
import { StandingsTable } from "@/components/tournament/StandingsTable";
import { BracketViewer } from "@/components/tournament/BracketViewer";
import {
  Trophy,
  Users,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function PublicTournamentPage({
  params,
}: {
  params: { slug: string };
}) {
  const tournament = tournamentStore.getBySlug(params.slug);
  if (!tournament) notFound();

  const standingsMap = tournamentStore.getStandings(tournament.id);
  const teamMap = new Map(tournament.teams.map((t) => [t.id, t]));
  const venueMap = new Map(tournament.venues.map((v) => [v.id, v]));

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-10 max-w-6xl">
      {/* Tournament Hero */}
      <div className="p-8 sm:p-12 rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-primary/10 shadow-lg text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
          <Trophy className="h-3.5 w-3.5" />
          <span>{tournament.sportLabel} Championship</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          {tournament.name}
        </h1>

        <p className="text-sm text-muted-foreground font-medium">
          Season {tournament.season || "2026"} • {tournament.teams.length} Teams •{" "}
          {tournament.matches.length} Total Matches
        </p>
      </div>

      {/* Standings Section */}
      {standingsMap.size > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Group Standings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from(standingsMap.entries()).map(([groupName, rows]) => (
              <StandingsTable
                key={groupName}
                title={groupName}
                standings={rows}
                advanceCount={2}
              />
            ))}
          </div>
        </section>
      )}

      {/* Knockout Bracket Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Knockout Tournament Tree
        </h2>
        <div className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm">
          <BracketViewer
            matches={tournament.matches}
            teams={tournament.teams}
          />
        </div>
      </section>

      {/* Fixture Schedule Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Match Schedule & Scores
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tournament.matches.map((m) => {
            const homeTeam = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
            const awayTeam = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
            const venue = m.venueId ? venueMap.get(m.venueId) : null;

            return (
              <div
                key={m.id}
                className="p-4 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/40">
                  <span className="font-semibold">Match #{m.matchNumber}</span>
                  <Link
                    href={`/api/banners/${m.id}?template=modern-bold&size=SQUARE_1080x1080`}
                    target="_blank"
                    className="flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                  >
                    <ImageIcon className="h-3 w-3" />
                    Match Banner
                  </Link>
                </div>

                <div className="space-y-2 text-sm font-bold text-foreground">
                  <div className="flex items-center justify-between">
                    <span>{homeTeam?.name || m.homePlaceholder || "TBD"}</span>
                    {m.homeScore !== undefined && (
                      <span className="text-primary font-black">
                        {m.homeScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{awayTeam?.name || m.awayPlaceholder || "TBD"}</span>
                    {m.awayScore !== undefined && (
                      <span className="text-primary font-black">
                        {m.awayScore}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {m.scheduledAt
                        ? `${formatDate(m.scheduledAt)} • ${formatTime(m.scheduledAt)}`
                        : "Schedule TBD"}
                    </span>
                  </div>
                  <span>{venue?.name || "Official Arena"}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

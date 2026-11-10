"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { StandingsTable } from "@/components/tournament/StandingsTable";
import { ScoreEntryModal } from "@/components/tournament/ScoreEntryModal";
import { StoredTournament, StoredMatch } from "@/lib/tournament-store";
import { StandingEntry } from "@/lib/fixture-engine/types";
import { Loader2, Trophy, CheckCircle2 } from "lucide-react";

export default function TournamentStandingsPage() {
  const params = useParams();
  const id = params.id as string;
  const [tournament, setTournament] = useState<StoredTournament | null>(null);
  const [standings, setStandings] = useState<Record<string, StandingEntry[]>>({});
  const [selectedMatch, setSelectedMatch] = useState<StoredMatch | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tRes, sRes] = await Promise.all([
        fetch(`/api/tournaments/${id}`),
        fetch(`/api/tournaments/${id}/standings`),
      ]);
      if (tRes.ok && sRes.ok) {
        const tData = await tRes.json();
        const sData = await sRes.json();
        setTournament(tData.tournament);
        setStandings(sData.standings || {});
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleScoreSubmit = async (scoreData: any) => {
    if (!selectedMatch) return;
    const res = await fetch(
      `/api/tournaments/${id}/matches/${selectedMatch.id}/result`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreData),
      }
    );
    if (res.ok) {
      await loadData();
    }
  };

  if (loading || !tournament) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const teamMap = new Map(tournament.teams.map((t) => [t.id, t]));

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Results & Live Standings
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Tiebreakers (Points, Goal Difference, Head-to-Head) are automatically computed with qualification cut-offs.
        </p>
      </div>

      {/* Standings Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(standings).map(([groupName, rows]) => (
          <StandingsTable
            key={groupName}
            title={groupName}
            standings={rows}
            advanceCount={2}
          />
        ))}
      </div>

      {/* Quick Score Entry Queue */}
      <div className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">
            Quick Match Results Entry
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tournament.matches.map((m) => {
            const homeTeam = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
            const awayTeam = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
            const isFinished = m.status === "COMPLETED";

            return (
              <div
                key={m.id}
                onClick={() => {
                  setSelectedMatch(m);
                  setIsScoreModalOpen(true);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isFinished
                    ? "border-border/50 bg-secondary/20 hover:border-primary/40"
                    : "border-primary/40 bg-primary/5 hover:border-primary"
                }`}
              >
                <div className="space-y-1 min-w-0 pr-2">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    Match #{m.matchNumber} {m.groupId ? `• Group ${m.groupId}` : ""}
                  </span>
                  <div className="text-xs font-bold text-foreground truncate">
                    {homeTeam?.name || m.homePlaceholder || "TBD"} vs{" "}
                    {awayTeam?.name || m.awayPlaceholder || "TBD"}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isFinished ? (
                    <div className="px-2.5 py-1 rounded-md bg-secondary font-black text-sm text-foreground">
                      {m.homeScore} - {m.awayScore}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-primary hover:underline">
                      Enter Score
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedMatch && (
        <ScoreEntryModal
          match={selectedMatch}
          teams={tournament.teams}
          isOpen={isScoreModalOpen}
          onClose={() => setIsScoreModalOpen(false)}
          onSubmit={handleScoreSubmit}
        />
      )}
    </div>
  );
}

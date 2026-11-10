"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BracketViewer } from "@/components/tournament/BracketViewer";
import { ScoreEntryModal } from "@/components/tournament/ScoreEntryModal";
import { StoredMatch, StoredTournament } from "@/lib/tournament-store";
import {
  CalendarDays,
  GitBranch,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { formatDate, formatTime, cn } from "@/lib/utils";

export default function TournamentFixturesPage() {
  const params = useParams();
  const id = params.id as string;
  const [tournament, setTournament] = useState<StoredTournament | null>(null);
  const [activeTab, setActiveTab] = useState<"BRACKET" | "LIST">("BRACKET");
  const [selectedMatch, setSelectedMatch] = useState<StoredMatch | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadTournament = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTournament();
  }, [id]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/tournaments/${id}/fixtures/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legs: 1, hasThirdPlace: true }),
      });
      if (res.ok) {
        await loadTournament();
      }
    } finally {
      setIsGenerating(false);
    }
  };

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
      await loadTournament();
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
  const venueMap = new Map(tournament.venues.map((v) => [v.id, v]));

  // Group matches by round for list view
  const roundMap = new Map<number, StoredMatch[]>();
  tournament.matches.forEach((m) => {
    if (!roundMap.has(m.round)) roundMap.set(m.round, []);
    roundMap.get(m.round)!.push(m);
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Fixtures & Tournament Tree
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Browse schedule brackets, list view by matchday, and click any match to record scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-secondary border border-border text-xs font-semibold">
            <button
              onClick={() => setActiveTab("BRACKET")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                activeTab === "BRACKET"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Bracket View
            </button>
            <button
              onClick={() => setActiveTab("LIST")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all",
                activeTab === "LIST"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              List View
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 border border-border transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5 text-primary", isGenerating && "animate-spin")}
            />
            Regenerate Fixtures
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {activeTab === "BRACKET" ? (
        <div className="p-6 rounded-2xl border border-border/60 bg-card shadow-sm">
          <BracketViewer
            matches={tournament.matches}
            teams={tournament.teams}
            onMatchClick={(m) => {
              setSelectedMatch(m);
              setIsScoreModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(roundMap.entries()).map(([roundNum, matches]) => (
            <div
              key={roundNum}
              className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <span className="font-extrabold text-foreground text-sm">
                  Round {roundNum}
                </span>
                <span className="text-xs text-muted-foreground">
                  {matches.length} Matches
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matches.map((m) => {
                  const homeTeam = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
                  const awayTeam = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
                  const venue = m.venueId ? venueMap.get(m.venueId) : null;

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMatch(m);
                        setIsScoreModalOpen(true);
                      }}
                      className="p-4 rounded-xl border border-border/50 bg-secondary/20 hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                    >
                      <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border/30">
                        <span>Match #{m.matchNumber}</span>
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            m.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {m.status}
                        </span>
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

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/30">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {m.scheduledAt
                              ? `${formatDate(m.scheduledAt)} • ${formatTime(m.scheduledAt)}`
                              : "Schedule TBD"}
                          </span>
                        </div>
                        <span>{venue?.name || "Main Arena"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Score Modal */}
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

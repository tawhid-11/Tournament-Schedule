"use client";

import React from "react";
import { StoredMatch } from "@/lib/tournament-store";
import { EngineTeam } from "@/lib/fixture-engine/types";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface BracketViewerProps {
  matches: StoredMatch[];
  teams: EngineTeam[];
  onMatchClick?: (match: StoredMatch) => void;
}

export function BracketViewer({
  matches,
  teams,
  onMatchClick,
}: BracketViewerProps) {
  const teamMap = new Map(teams.map((t) => [t.id, t]));

  // Filter knockout matches (excluding group stage matches)
  const knockoutMatches = matches.filter(
    (m) => !m.groupId || m.branch === "WINNERS" || m.branch === "FINAL"
  );

  // Group matches by round
  const roundsMap = new Map<number, StoredMatch[]>();
  knockoutMatches.forEach((m) => {
    if (!roundsMap.has(m.round)) roundsMap.set(m.round, []);
    roundsMap.get(m.round)!.push(m);
  });

  const roundNumbers = Array.from(roundsMap.keys()).sort((a, b) => a - b);

  function getRoundTitle(round: number, totalRounds: number): string {
    const fromFinal = totalRounds - round;
    if (fromFinal === 0) return "Final";
    if (fromFinal === 1) return "Semi-Finals";
    if (fromFinal === 2) return "Quarter-Finals";
    if (fromFinal === 3) return "Round of 16";
    return `Round ${round}`;
  }

  if (knockoutMatches.length === 0) {
    return (
      <div className="p-12 text-center border rounded-xl border-dashed border-border/60 bg-card/30">
        <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h4 className="font-semibold text-foreground">No Knockout Bracket Yet</h4>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1">
          Generate fixtures or progress from group stages to view the knockout bracket tree.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-6">
      <div className="flex gap-8 min-w-max items-center py-4">
        {roundNumbers.map((roundNum, roundIdx) => {
          const roundMatches = roundsMap.get(roundNum) || [];
          const isFinal = roundIdx === roundNumbers.length - 1;

          return (
            <div key={roundNum} className="flex flex-col gap-6 w-64 shrink-0">
              <div className="text-center pb-2 border-b border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {getRoundTitle(roundIdx + 1, roundNumbers.length)}
                </span>
                <p className="text-[11px] text-muted-foreground">
                  {roundMatches.length} {roundMatches.length === 1 ? "Match" : "Matches"}
                </p>
              </div>

              <div className="flex flex-col justify-around gap-6 h-full">
                {roundMatches.map((match) => {
                  const homeTeam = match.homeTeamId
                    ? teamMap.get(match.homeTeamId)
                    : null;
                  const awayTeam = match.awayTeamId
                    ? teamMap.get(match.awayTeamId)
                    : null;

                  const homeWinner =
                    match.status === "COMPLETED" &&
                    match.winnerTeamId === match.homeTeamId;
                  const awayWinner =
                    match.status === "COMPLETED" &&
                    match.winnerTeamId === match.awayTeamId;

                  return (
                    <div
                      key={match.id}
                      onClick={() => onMatchClick?.(match)}
                      className={cn(
                        "rounded-xl border border-border/60 bg-card hover:border-primary/60 transition-all p-3 shadow-sm cursor-pointer relative group",
                        isFinal && "border-amber-500/50 bg-amber-500/5"
                      )}
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2 pb-1 border-b border-border/30">
                        <span>Match #{match.matchNumber}</span>
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded font-semibold",
                            match.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {match.status}
                        </span>
                      </div>

                      {/* Home Team Slot */}
                      <div
                        className={cn(
                          "flex items-center justify-between p-1.5 rounded-md transition-colors",
                          homeWinner && "bg-primary/20 font-bold text-primary",
                          !homeWinner && "text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                homeTeam?.primaryColor || "#64748b",
                            }}
                          />
                          <span className="text-xs truncate">
                            {homeTeam?.name || match.homePlaceholder || "TBD"}
                          </span>
                        </div>
                        {match.homeScore !== undefined && (
                          <span className="text-xs font-bold pl-2">
                            {match.homeScore}
                          </span>
                        )}
                      </div>

                      {/* Away Team Slot */}
                      <div
                        className={cn(
                          "flex items-center justify-between p-1.5 rounded-md mt-1 transition-colors",
                          awayWinner && "bg-primary/20 font-bold text-primary",
                          !awayWinner && "text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                awayTeam?.primaryColor || "#64748b",
                            }}
                          />
                          <span className="text-xs truncate">
                            {awayTeam?.name || match.awayPlaceholder || "TBD"}
                          </span>
                        </div>
                        {match.awayScore !== undefined && (
                          <span className="text-xs font-bold pl-2">
                            {match.awayScore}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

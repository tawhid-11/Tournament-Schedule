"use client";

import React, { useState } from "react";
import { StoredMatch } from "@/lib/tournament-store";
import { EngineTeam } from "@/lib/fixture-engine/types";
import { X, Trophy, Check } from "lucide-react";

interface ScoreEntryModalProps {
  match: StoredMatch;
  teams: EngineTeam[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scoreData: {
    homeScore: number;
    awayScore: number;
    isWalkover?: boolean;
    walkoverWinnerId?: string;
    isExtraTime?: boolean;
    isPenalties?: boolean;
    homePenaltyScore?: number;
    awayPenaltyScore?: number;
    notes?: string;
  }) => Promise<void>;
}

export function ScoreEntryModal({
  match,
  teams,
  isOpen,
  onClose,
  onSubmit,
}: ScoreEntryModalProps) {
  const [homeScore, setHomeScore] = useState<number>(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(match.awayScore ?? 0);
  const [isExtraTime, setIsExtraTime] = useState<boolean>(false);
  const [isPenalties, setIsPenalties] = useState<boolean>(false);
  const [homePenalties, setHomePenalties] = useState<number>(0);
  const [awayPenalties, setAwayPenalties] = useState<number>(0);
  const [isWalkover, setIsWalkover] = useState<boolean>(false);
  const [walkoverWinnerId, setWalkoverWinnerId] = useState<string>(
    match.homeTeamId || ""
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const teamMap = new Map(teams.map((t) => [t.id, t]));
  const homeTeam = match.homeTeamId ? teamMap.get(match.homeTeamId) : null;
  const awayTeam = match.awayTeamId ? teamMap.get(match.awayTeamId) : null;

  const homeName = homeTeam?.name || match.homePlaceholder || "Home Team";
  const awayName = awayTeam?.name || match.awayPlaceholder || "Away Team";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        homeScore,
        awayScore,
        isExtraTime,
        isPenalties,
        homePenaltyScore: isPenalties ? homePenalties : undefined,
        awayPenaltyScore: isPenalties ? awayPenalties : undefined,
        isWalkover,
        walkoverWinnerId: isWalkover ? walkoverWinnerId : undefined,
        notes,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-lg bg-primary/20 text-primary">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Enter Match Result
            </h3>
            <p className="text-xs text-muted-foreground">
              Match #{match.matchNumber} • Round {match.round}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Scoreboard Inputs */}
          <div className="grid grid-cols-5 items-center gap-4 p-4 rounded-xl bg-secondary/30 border border-border/50 text-center">
            {/* Home Team */}
            <div className="col-span-2 space-y-2">
              <span className="text-sm font-bold text-foreground line-clamp-1">
                {homeName}
              </span>
              <input
                type="number"
                min={0}
                value={homeScore}
                onChange={(e) => setHomeScore(Number(e.target.value))}
                className="w-20 h-14 text-center text-3xl font-black rounded-xl bg-background border border-border text-foreground mx-auto block"
              />
            </div>

            <div className="col-span-1 text-xs font-bold text-muted-foreground uppercase tracking-widest">
              VS
            </div>

            {/* Away Team */}
            <div className="col-span-2 space-y-2">
              <span className="text-sm font-bold text-foreground line-clamp-1">
                {awayName}
              </span>
              <input
                type="number"
                min={0}
                value={awayScore}
                onChange={(e) => setAwayScore(Number(e.target.value))}
                className="w-20 h-14 text-center text-3xl font-black rounded-xl bg-background border border-border text-foreground mx-auto block"
              />
            </div>
          </div>

          {/* Special Options */}
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={isExtraTime}
                  onChange={(e) => setIsExtraTime(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Extra Time (AET)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={isPenalties}
                  onChange={(e) => setIsPenalties(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Penalties Shootout</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={isWalkover}
                  onChange={(e) => setIsWalkover(e.target.checked)}
                  className="rounded border-border text-primary"
                />
                <span>Walkover</span>
              </label>
            </div>

            {/* Penalty Shootout Inputs */}
            {isPenalties && (
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                <span className="text-xs font-medium">Penalties Score:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={homePenalties}
                    onChange={(e) => setHomePenalties(Number(e.target.value))}
                    className="w-12 h-8 text-center rounded bg-secondary text-foreground text-sm font-bold"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    min={0}
                    value={awayPenalties}
                    onChange={(e) => setAwayPenalties(Number(e.target.value))}
                    className="w-12 h-8 text-center rounded bg-secondary text-foreground text-sm font-bold"
                  />
                </div>
              </div>
            )}

            {/* Walkover Winner Selector */}
            {isWalkover && (
              <div className="p-3 rounded-lg border border-border bg-background space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Award Walkover Win to:
                </label>
                <select
                  value={walkoverWinnerId}
                  onChange={(e) => setWalkoverWinnerId(e.target.value)}
                  className="w-full h-9 px-3 rounded bg-secondary text-sm font-medium text-foreground"
                >
                  {match.homeTeamId && (
                    <option value={match.homeTeamId}>{homeName}</option>
                  )}
                  {match.awayTeamId && (
                    <option value={match.awayTeamId}>{awayName}</option>
                  )}
                </select>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Match Notes / Highlights (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Scored by #10 in 89th minute"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-9 px-3 mt-1 rounded-md bg-secondary text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Save & Advance Winner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

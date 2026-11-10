"use client";

import React, { useState } from "react";
import { StoredMatch, StoredTournament } from "@/lib/tournament-store";
import { ScheduleConflict } from "@/lib/scheduler";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  AlertTriangle,
  Play,
  CheckCircle,
  Sliders,
} from "lucide-react";
import { formatDate, formatTime, cn } from "@/lib/utils";

interface ScheduleCalendarProps {
  tournament: StoredTournament;
  onAutoSchedule: (constraints: {
    startDate: string;
    timeSlots: string[];
    minRestDays: number;
    maxMatchesPerDayPerVenue: number;
  }) => Promise<void>;
}

export function ScheduleCalendar({
  tournament,
  onAutoSchedule,
}: ScheduleCalendarProps) {
  const [startDate, setStartDate] = useState<string>(
    tournament.startDate || new Date().toISOString().split("T")[0]
  );
  const [timeSlotsInput, setTimeSlotsInput] = useState<string>(
    "14:00, 17:00, 20:00"
  );
  const [minRestDays, setMinRestDays] = useState<number>(1);
  const [maxPerVenue, setMaxPerVenue] = useState<number>(3);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<string>("ALL");

  const teamMap = new Map(tournament.teams.map((t) => [t.id, t]));
  const venueMap = new Map(tournament.venues.map((v) => [v.id, v]));

  const conflicts = tournament.conflicts || [];

  const handleRunScheduler = async () => {
    setIsRunning(true);
    try {
      const slots = timeSlotsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      await onAutoSchedule({
        startDate,
        timeSlots: slots.length > 0 ? slots : ["14:00", "17:00", "20:00"],
        minRestDays,
        maxMatchesPerDayPerVenue: maxPerVenue,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Group matches by Date
  const dateGroups = new Map<string, StoredMatch[]>();
  tournament.matches.forEach((m) => {
    const dStr = m.scheduledAt ? formatDate(m.scheduledAt) : "Unscheduled";
    if (!dateGroups.has(dStr)) dateGroups.set(dStr, []);
    dateGroups.get(dStr)!.push(m);
  });

  return (
    <div className="space-y-6">
      {/* Scheduler Configuration Toolbar */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">
              Constraint-Based Auto-Scheduler
            </h3>
          </div>
          <button
            onClick={handleRunScheduler}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Scheduling..." : "Run Auto-Scheduler"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Daily Time Slots
            </label>
            <input
              type="text"
              value={timeSlotsInput}
              onChange={(e) => setTimeSlotsInput(e.target.value)}
              placeholder="14:00, 17:00, 20:00"
              className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Min Rest Days Between Matches
            </label>
            <input
              type="number"
              min={0}
              max={7}
              value={minRestDays}
              onChange={(e) => setMinRestDays(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Max Matches / Venue / Day
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={maxPerVenue}
              onChange={(e) => setMaxPerVenue(Number(e.target.value))}
              className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border"
            />
          </div>
        </div>
      </div>

      {/* Conflicts & Alerts Banner */}
      {conflicts.length > 0 ? (
        <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-sm space-y-2">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span>{conflicts.length} Schedule Conflicts Detected:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-xs opacity-90 pl-2">
            {conflicts.map((c, idx) => (
              <li key={idx}>
                <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-destructive/20 mr-1.5">
                  {c.type}
                </span>
                {c.message}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="h-4 w-4" />
          Zero conflicts. Rest days, venue capacities, and time slots are fully balanced.
        </div>
      )}

      {/* Calendar Matches by Date */}
      <div className="space-y-6">
        {Array.from(dateGroups.entries()).map(([dateStr, matchList]) => (
          <div
            key={dateStr}
            className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span>{dateStr}</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">
                {matchList.length} {matchList.length === 1 ? "match" : "matches"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {matchList.map((m) => {
                const homeTeam = m.homeTeamId ? teamMap.get(m.homeTeamId) : null;
                const awayTeam = m.awayTeamId ? teamMap.get(m.awayTeamId) : null;
                const venue = m.venueId ? venueMap.get(m.venueId) : null;

                const hasConflict = conflicts.some(
                  (c) => c.matchId === m.id || c.conflictingMatchId === m.id
                );

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "p-3 rounded-xl border border-border/50 bg-secondary/30 flex flex-col justify-between gap-3 text-xs",
                      hasConflict && "border-destructive/60 bg-destructive/5"
                    )}
                  >
                    <div className="flex items-center justify-between text-muted-foreground pb-1.5 border-b border-border/30">
                      <span>Match #{m.matchNumber}</span>
                      <div className="flex items-center gap-1 font-semibold text-foreground">
                        <Clock className="h-3 w-3 text-primary" />
                        <span>{formatTime(m.scheduledAt) || "TBD"}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-bold text-foreground">
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          {homeTeam?.name || m.homePlaceholder || "TBD"}
                        </span>
                        {m.homeScore !== undefined && (
                          <span className="font-extrabold text-primary">
                            {m.homeScore}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="truncate">
                          {awayTeam?.name || m.awayPlaceholder || "TBD"}
                        </span>
                        {m.awayScore !== undefined && (
                          <span className="font-extrabold text-primary">
                            {m.awayScore}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">
                        {venue?.name || "Official Arena"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

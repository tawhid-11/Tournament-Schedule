"use client";

import React from "react";
import { StandingEntry } from "@/lib/fixture-engine/types";
import { cn } from "@/lib/utils";

interface StandingsTableProps {
  title: string;
  standings: StandingEntry[];
  advanceCount?: number;
}

export function StandingsTable({
  title,
  standings,
  advanceCount = 2,
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground border rounded-xl border-dashed border-border/50">
        No completed matches yet. Complete matches to populate the standings table.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between bg-muted/20">
        <h3 className="font-bold text-foreground text-base tracking-tight">
          {title}
        </h3>
        <span className="text-xs text-muted-foreground font-medium">
          Top {advanceCount} qualify
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary/40 text-muted-foreground uppercase font-bold tracking-wider text-[10px] border-b border-border/40">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">#</th>
              <th className="py-2.5 px-3">Team</th>
              <th className="py-2.5 px-2 text-center">P</th>
              <th className="py-2.5 px-2 text-center">W</th>
              <th className="py-2.5 px-2 text-center">D</th>
              <th className="py-2.5 px-2 text-center">L</th>
              <th className="py-2.5 px-2 text-center">GF</th>
              <th className="py-2.5 px-2 text-center">GA</th>
              <th className="py-2.5 px-2 text-center">GD</th>
              <th className="py-2.5 px-3 text-center font-black text-foreground">PTS</th>
              <th className="py-2.5 px-3 text-center">Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {standings.map((row) => {
              const qualifies = row.rank <= advanceCount;

              return (
                <tr
                  key={row.teamId}
                  className={cn(
                    "hover:bg-muted/30 transition-colors",
                    qualifies && "bg-primary/5 font-medium"
                  )}
                >
                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold",
                        qualifies
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {row.rank}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-foreground text-sm">
                      {row.teamName}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-muted-foreground">
                    {row.played}
                  </td>
                  <td className="py-3 px-2 text-center font-medium">{row.won}</td>
                  <td className="py-3 px-2 text-center font-medium text-muted-foreground">
                    {row.drawn}
                  </td>
                  <td className="py-3 px-2 text-center font-medium text-muted-foreground">
                    {row.lost}
                  </td>
                  <td className="py-3 px-2 text-center text-muted-foreground">
                    {row.goalsFor}
                  </td>
                  <td className="py-3 px-2 text-center text-muted-foreground">
                    {row.goalsAgainst}
                  </td>
                  <td
                    className={cn(
                      "py-3 px-2 text-center font-semibold",
                      row.goalDifference > 0
                        ? "text-emerald-400"
                        : row.goalDifference < 0
                        ? "text-rose-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-sm text-foreground">
                    {row.points}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {row.form.map((res, i) => (
                        <span
                          key={i}
                          className={cn(
                            "w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center",
                            res === "W"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : res === "L"
                              ? "bg-rose-500/20 text-rose-400"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {res}
                        </span>
                      ))}
                      {row.form.length === 0 && (
                        <span className="text-[10px] text-muted-foreground">-</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

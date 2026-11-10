import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tournamentStore } from "@/lib/tournament-store";
import {
  Trophy,
  Users,
  Grid,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function TournamentOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  const tournament = tournamentStore.getById(params.id);
  if (!tournament) notFound();

  const completedMatches = tournament.matches.filter(
    (m) => m.status === "COMPLETED"
  ).length;

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl border border-border/60 bg-gradient-to-r from-card via-card to-primary/10 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/20 text-primary">
                {tournament.sportLabel}
              </span>
              <span className="text-xs text-muted-foreground font-semibold">
                {tournament.season}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {tournament.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/t/${tournament.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-xs font-bold hover:bg-secondary/80 border border-border/50"
            >
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
              Public View
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/40">
          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
            <span className="text-xs text-muted-foreground block">Teams</span>
            <span className="text-xl font-black text-foreground">
              {tournament.teams.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
            <span className="text-xs text-muted-foreground block">Groups</span>
            <span className="text-xl font-black text-foreground">
              {tournament.groups.length || "Knockout"}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
            <span className="text-xs text-muted-foreground block">Total Matches</span>
            <span className="text-xl font-black text-foreground">
              {tournament.matches.length}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/40">
            <span className="text-xs text-muted-foreground block">Matches Completed</span>
            <span className="text-xl font-black text-emerald-400">
              {completedMatches} / {tournament.matches.length}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href={`/tournaments/${tournament.id}/groups`}
          className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Grid className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
              Group Builder (DnD)
            </h3>
            <p className="text-xs text-muted-foreground">
              Drag teams into pots, run seeded auto-draws, or customize group sizes.
            </p>
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1 mt-4">
            Manage Groups <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href={`/tournaments/${tournament.id}/schedule`}
          className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
              Auto-Scheduler
            </h3>
            <p className="text-xs text-muted-foreground">
              Run constraint-based scheduling with rest days, venue allocation & conflict checks.
            </p>
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1 mt-4">
            View Schedule <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href={`/tournaments/${tournament.id}/banners`}
          className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/50 transition-all shadow-sm flex flex-col justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">
              Match Banner Studio
            </h3>
            <p className="text-xs text-muted-foreground">
              Generate 1080p social matchday graphics across 5 themes or export bulk ZIP archives.
            </p>
          </div>
          <span className="text-xs font-bold text-primary flex items-center gap-1 mt-4">
            Open Studio <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

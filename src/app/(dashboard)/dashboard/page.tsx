import React from "react";
import Link from "next/link";
import { tournamentStore } from "@/lib/tournament-store";
import {
  Trophy,
  Plus,
  Users,
  Calendar,
  ArrowRight,
  ExternalLink,
  Shield,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const tournaments = tournamentStore.getAll();

  return (
    <div className="container px-4 sm:px-8 py-8 space-y-8">
      {/* Hero Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            My Tournaments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage brackets, stages, groups, auto-schedules, and export match banners.
          </p>
        </div>

        <Link
          href="/tournaments/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          Create Tournament
        </Link>
      </div>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/50 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {t.sportLabel}
                </span>
                <span className="text-xs text-muted-foreground">
                  {t.season || "2026"}
                </span>
              </div>

              <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-2">
                {t.name}
              </h2>

              <p className="text-xs text-muted-foreground mb-4">
                {t.stages.map((s) => s.name).join(" ➔ ")}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-border/40 mb-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span>
                    <strong className="text-foreground">{t.teams.length}</strong>{" "}
                    Teams
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>
                    <strong className="text-foreground">{t.matches.length}</strong>{" "}
                    Matches
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link
                href={`/t/${t.slug}`}
                target="_blank"
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Public Page
              </Link>

              <Link
                href={`/tournaments/${t.id}/overview`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                Open Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

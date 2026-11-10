import React from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowRight,
  Sparkles,
  GitBranch,
  Calendar,
  Grid,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Navbar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black shadow-md shadow-primary/20">
              <Trophy className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-foreground text-lg">
              TourneyPro
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              Launch Platform
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="container px-4 sm:px-8 py-20 lg:py-28 text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles className="h-4 w-4" />
            <span>Next.js 14 • PostgreSQL • Satori • Resvg</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Tournament Fixtures &{" "}
            <span className="bg-gradient-to-r from-primary via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Match Banner Studio
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Build any tournament format: Single/Double Elimination, Round Robin, Group Stage + Knockouts, or Swiss System. Auto-schedule matches with rest-day constraint checks and export 1080p social match banners.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-black text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/tournaments/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold text-sm hover:bg-secondary/80 border border-border/60 transition-all"
            >
              Tournament Wizard
            </Link>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="container px-4 sm:px-8 py-16 border-t border-border/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GitBranch className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                Pure Fixture Engine
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Circle method for round robins, power-of-2 seeded brackets with byes, double elimination reset matches, and Swiss system tie-breakers. Fully tested with Vitest.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Grid className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                Drag-and-Drop Group Builder
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Powered by <code>@dnd-kit</code>. Move teams into groups with drag-and-drop, run FIFA-style seeded pot draws, and configure advancement thresholds.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/60 bg-card space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground text-base">
                Satori + Resvg Banner Studio
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generate high-resolution PNG matchday graphics in 5 themes (Modern, Cyber Neon, Heritage, Minimalist, Broadcast) in 1080x1080, Story, and 16:9 formats.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <p>TourneyPro • Tournament Fixture & Match Banner Management System</p>
      </footer>
    </div>
  );
}

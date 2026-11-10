"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Plus, LayoutDashboard, Share2 } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black shadow-md shadow-primary/20">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-foreground text-lg leading-none">
                TourneyPro
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                Fixture & Banner Studio
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              Tournaments
            </Link>
            <Link
              href="/tournaments/new"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Create Tournament
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/tournaments/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New Tournament
          </Link>
          <div className="flex items-center gap-2 pl-2 border-l border-border/50">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              TD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black">
              <Trophy className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-foreground text-base">
              TourneyPro Live Hub
            </span>
          </Link>

          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60"
          >
            Create Your Tournament
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

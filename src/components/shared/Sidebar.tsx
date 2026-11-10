"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Grid,
  CalendarDays,
  Clock,
  TableProperties,
  Image as ImageIcon,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  tournamentId: string;
  tournamentSlug: string;
  tournamentName: string;
}

export function Sidebar({
  tournamentId,
  tournamentSlug,
  tournamentName,
}: SidebarProps) {
  const pathname = usePathname();

  const links = [
    {
      label: "Overview",
      href: `/tournaments/${tournamentId}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: "Teams & Seeds",
      href: `/tournaments/${tournamentId}/teams`,
      icon: Users,
    },
    {
      label: "Group Builder",
      href: `/tournaments/${tournamentId}/groups`,
      icon: Grid,
    },
    {
      label: "Fixtures & Bracket",
      href: `/tournaments/${tournamentId}/fixtures`,
      icon: CalendarDays,
    },
    {
      label: "Scheduler",
      href: `/tournaments/${tournamentId}/schedule`,
      icon: Clock,
    },
    {
      label: "Results & Standings",
      href: `/tournaments/${tournamentId}/standings`,
      icon: TableProperties,
    },
    {
      label: "Banner Studio",
      href: `/tournaments/${tournamentId}/banners`,
      icon: ImageIcon,
    },
  ];

  return (
    <aside className="w-64 border-r border-border/40 bg-card/40 flex flex-col justify-between p-4 shrink-0">
      <div className="space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Tournaments
          </Link>
          <h2 className="font-bold text-base tracking-tight text-foreground line-clamp-1">
            {tournamentName}
          </h2>
          <span className="text-xs text-primary font-medium">Workspace</span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-border/40">
        <Link
          href={`/t/${tournamentSlug}`}
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            Public Live Hub
          </span>
          <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
            Live
          </span>
        </Link>
      </div>
    </aside>
  );
}

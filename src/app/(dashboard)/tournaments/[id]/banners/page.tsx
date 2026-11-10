"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { BannerCanvas } from "@/components/banner-studio/BannerCanvas";
import { StoredTournament } from "@/lib/tournament-store";
import { Loader2 } from "lucide-react";

export default function TournamentBannersPage() {
  const params = useParams();
  const id = params.id as string;
  const [tournament, setTournament] = useState<StoredTournament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/tournaments/${id}`);
        if (res.ok) {
          const data = await res.json();
          setTournament(data.tournament);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading || !tournament) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Match Banner & Social Studio
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Generate pixel-perfect matchday banners using server-side Satori + Resvg engine. Download 1080p PNGs or bulk ZIP archives.
        </p>
      </div>

      <BannerCanvas tournament={tournament} />
    </div>
  );
}

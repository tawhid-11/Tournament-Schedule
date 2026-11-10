"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { TeamManager } from "@/components/tournament/TeamManager";
import { EngineTeam } from "@/lib/fixture-engine/types";
import { Loader2 } from "lucide-react";

export default function TournamentTeamsPage() {
  const params = useParams();
  const id = params.id as string;
  const [teams, setTeams] = useState<EngineTeam[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTeams = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}/teams`);
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [id]);

  const handleAddTeams = async (newTeams: any[]) => {
    const res = await fetch(`/api/tournaments/${id}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTeams),
    });
    if (res.ok) {
      await loadTeams();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Teams & Participants
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Add teams individually or paste CSV to import seeds and colors in bulk.
        </p>
      </div>

      <TeamManager
        teams={teams}
        tournamentId={id}
        onAddTeams={handleAddTeams}
      />
    </div>
  );
}

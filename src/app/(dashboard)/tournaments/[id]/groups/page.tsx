"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GroupBuilderDnd } from "@/components/tournament/GroupBuilderDnd";
import { StoredGroup } from "@/lib/tournament-store";
import { EngineTeam } from "@/lib/fixture-engine/types";
import { Loader2 } from "lucide-react";

export default function TournamentGroupsPage() {
  const params = useParams();
  const id = params.id as string;
  const [groups, setGroups] = useState<StoredGroup[]>([]);
  const [teams, setTeams] = useState<EngineTeam[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [grpRes, teamRes] = await Promise.all([
        fetch(`/api/tournaments/${id}/groups`),
        fetch(`/api/tournaments/${id}/teams`),
      ]);

      if (grpRes.ok && teamRes.ok) {
        const grpData = await grpRes.json();
        const teamData = await teamRes.json();
        setGroups(grpData.groups || []);
        setTeams(teamData.teams || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSave = async (updatedGroups: StoredGroup[]) => {
    await fetch(`/api/tournaments/${id}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groups: updatedGroups }),
    });
    setGroups(updatedGroups);
  };

  const handleAutoDraw = async (options: {
    method: "SEEDED_POTS" | "RANDOM" | "SNAKE";
    numberOfGroups: number;
    advancePerGroup: number;
  }) => {
    const res = await fetch(`/api/tournaments/${id}/groups/draw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    if (res.ok) {
      const data = await res.json();
      setGroups(data.groups);
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
          Group Builder & Draw
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Drag and drop teams between groups, or execute a FIFA-style seeded pots draw.
        </p>
      </div>

      <GroupBuilderDnd
        initialGroups={groups}
        allTeams={teams}
        tournamentId={id}
        onSave={handleSave}
        onAutoDraw={handleAutoDraw}
      />
    </div>
  );
}

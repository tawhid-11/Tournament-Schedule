"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ScheduleCalendar } from "@/components/tournament/ScheduleCalendar";
import { StoredTournament } from "@/lib/tournament-store";
import { Loader2 } from "lucide-react";

export default function TournamentSchedulePage() {
  const params = useParams();
  const id = params.id as string;
  const [tournament, setTournament] = useState<StoredTournament | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/tournaments/${id}`);
      if (res.ok) {
        const data = await res.json();
        setTournament(data.tournament);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleAutoSchedule = async (constraints: any) => {
    const res = await fetch(`/api/tournaments/${id}/schedule/auto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(constraints),
    });
    if (res.ok) {
      await loadData();
    }
  };

  if (loading || !tournament) {
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
          Constraint-Based Auto-Scheduler & Calendar
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure rest days, daily match capacities, and venue allocations with automated conflict detection.
        </p>
      </div>

      <ScheduleCalendar
        tournament={tournament}
        onAutoSchedule={handleAutoSchedule}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { EngineTeam } from "@/lib/fixture-engine/types";
import { Plus, Upload, Check, Trash2, Users } from "lucide-react";

interface TeamManagerProps {
  teams: EngineTeam[];
  tournamentId: string;
  onAddTeams: (
    newTeams: Array<{
      name: string;
      shortName: string;
      primaryColor?: string;
      seed?: number;
      pot?: number;
    }>
  ) => Promise<void>;
}

export function TeamManager({ teams, onAddTeams }: TeamManagerProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [color, setColor] = useState("#2563eb");
  const [seed, setSeed] = useState<number | "">("");
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTeams([
        {
          name: name.trim(),
          shortName:
            shortName.trim() || name.trim().slice(0, 3).toUpperCase(),
          primaryColor: color,
          seed: seed !== "" ? Number(seed) : undefined,
        },
      ]);
      setName("");
      setShortName("");
      setSeed("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkCsv = async () => {
    if (!csvText.trim()) return;
    setIsSubmitting(true);
    try {
      const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
      const parsedTeams = lines.map((line, idx) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          name: parts[0] || `Team ${idx + 1}`,
          shortName: parts[1] || parts[0]?.slice(0, 3).toUpperCase() || `T${idx + 1}`,
          seed: parts[2] ? Number(parts[2]) : idx + 1,
          primaryColor: parts[3] || "#2563eb",
        };
      });

      await onAddTeams(parsedTeams);
      setCsvText("");
      setIsCsvOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleCsv = `Thunderbolts, TBT, 1, #eab308
Emerald Knights, KNT, 2, #059669
Phoenix Blaze, BLZ, 3, #ea580c
Pacific Sharks, SHK, 4, #0891b2`;

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Single Team Input Form */}
        <form
          onSubmit={handleAddSingle}
          className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 pb-2 border-b border-border/40 font-bold text-foreground">
            <Plus className="h-4 w-4 text-primary" />
            <span>Add Single Team</span>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Team Name
              </label>
              <input
                type="text"
                placeholder="e.g. Manchester City"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground border border-border"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Short Code (3-5 chars)
                </label>
                <input
                  type="text"
                  placeholder="MCI"
                  maxLength={5}
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value.toUpperCase())}
                  className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground border border-border uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Seed
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder="1"
                  value={seed}
                  onChange={(e) =>
                    setSeed(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground border border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Primary Team Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-secondary text-foreground border border-border font-mono text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="w-full h-9 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all text-sm disabled:opacity-50"
            >
              Add Team
            </button>
          </div>
        </form>

        {/* Bulk CSV Import Panel */}
        <div className="lg:col-span-2 p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-border/40 font-bold text-foreground">
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-primary" />
                <span>Bulk Import Teams via CSV</span>
              </div>
              <button
                type="button"
                onClick={() => setCsvText(sampleCsv)}
                className="text-xs text-primary hover:underline font-medium"
              >
                Insert Sample CSV
              </button>
            </div>

            <p className="text-xs text-muted-foreground mt-2 mb-3">
              Format: <code>Team Name, Short Name, Seed (optional), Hex Color (optional)</code> (one team per line).
            </p>

            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Solaris FC, SOL, 1, #f59e0b&#10;Nordic Wolves, WLV, 2, #0284c7"
              className="w-full p-3 rounded-xl bg-secondary text-foreground font-mono text-xs border border-border resize-none"
            />
          </div>

          <button
            onClick={handleBulkCsv}
            disabled={isSubmitting || !csvText.trim()}
            className="w-full h-10 rounded-xl bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80 border border-border/60 transition-all text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Import All Teams from CSV
          </button>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">
              Participating Teams ({teams.length})
            </h3>
          </div>
          <span className="text-xs text-muted-foreground">
            Seeded & Pot assignments
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {teams.map((team, idx) => (
            <div
              key={team.id}
              className="p-3.5 rounded-xl border border-border/60 bg-secondary/30 flex items-center justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: team.primaryColor || "#3b82f6" }}
                >
                  {team.shortName || team.name.slice(0, 3).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-sm text-foreground block truncate">
                    {team.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Code: {team.shortName}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-block text-xs font-extrabold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  #{team.seed || idx + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

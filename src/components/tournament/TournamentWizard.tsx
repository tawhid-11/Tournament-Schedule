"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Users,
  Calendar,
  Sparkles,
} from "lucide-react";

export function TournamentWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState("FOOTBALL");
  const [sportLabel, setSportLabel] = useState("Football");
  const [scoreModel, setScoreModel] = useState("GOALS");
  const [format, setFormat] = useState("GROUP_AND_KNOCKOUT");
  const [season, setSeason] = useState("2026");
  const [startDate, setStartDate] = useState("2026-06-01");
  const [endDate, setEndDate] = useState("2026-06-30");

  const [teamsText, setTeamsText] = useState(
    "Atlas Eagles, EGL, 1\nSolaris FC, SOL, 2\nNordic Wolves, WLV, 3\nImperial Titans, TTN, 4\nPhoenix Blaze, BLZ, 5\nThunderbolts, TBT, 6\nEmerald Knights, KNT, 7\nPacific Sharks, SHK, 8"
  );

  const handleSportChange = (sport: string) => {
    setSportType(sport);
    if (sport === "FOOTBALL") {
      setSportLabel("Football");
      setScoreModel("GOALS");
    } else if (sport === "CRICKET") {
      setSportLabel("Cricket");
      setScoreModel("CRICKET_RUNS");
    } else if (sport === "BADMINTON" || sport === "TENNIS") {
      setSportLabel(sport === "BADMINTON" ? "Badminton" : "Tennis");
      setScoreModel("SETS_GAMES");
    } else if (sport === "ESPORTS") {
      setSportLabel("Esports");
      setScoreModel("POINTS");
    } else {
      setSportLabel("Generic Sport");
      setScoreModel("POINTS");
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create Tournament
      const res = await fetch("/api/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          sportType,
          sportLabel,
          scoreModel,
          format,
          season,
          startDate,
          endDate,
          isPublic: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to create tournament");
      const { tournament } = await res.json();

      // 2. Add Teams
      const lines = teamsText.split("\n").map((l) => l.trim()).filter(Boolean);
      const teams = lines.map((line, idx) => {
        const parts = line.split(",").map((p) => p.trim());
        return {
          name: parts[0] || `Team ${idx + 1}`,
          shortName: parts[1] || parts[0]?.slice(0, 3).toUpperCase(),
          seed: parts[2] ? Number(parts[2]) : idx + 1,
        };
      });

      if (teams.length > 0) {
        await fetch(`/api/tournaments/${tournament.id}/teams`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(teams),
        });
      }

      // 3. Auto-draw groups if Group & Knockout format
      if (format === "GROUP_AND_KNOCKOUT") {
        await fetch(`/api/tournaments/${tournament.id}/groups/draw`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "SEEDED_POTS",
            numberOfGroups: Math.max(2, Math.floor(teams.length / 4)),
            advancePerGroup: 2,
          }),
        });
      }

      // 4. Generate Fixtures
      await fetch(`/api/tournaments/${tournament.id}/fixtures/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ legs: 1, hasThirdPlace: true }),
      });

      // 5. Auto-schedule initial dates
      await fetch(`/api/tournaments/${tournament.id}/schedule/auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          timeSlots: ["14:00", "17:00", "20:00"],
          minRestDays: 1,
          maxMatchesPerDayPerVenue: 3,
        }),
      });

      // Redirect to overview
      router.push(`/tournaments/${tournament.id}/overview`);
    } catch (err) {
      console.error(err);
      alert("Error creating tournament");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-6">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        {[
          { num: 1, label: "Tournament Info" },
          { num: 2, label: "Format & Sport" },
          { num: 3, label: "Add Teams" },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s.num
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
            </div>
            <span
              className={`text-xs font-semibold ${
                step >= s.num ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="space-y-5 p-6 rounded-2xl border border-border/60 bg-card shadow-sm animate-in fade-in-50">
          <h2 className="text-xl font-black text-foreground">
            Basic Tournament Information
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Tournament Name
              </label>
              <input
                type="text"
                placeholder="e.g. Champions League 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground border border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Season / Edition
                </label>
                <input
                  type="text"
                  placeholder="2026 / 2027"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground border border-border"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground border border-border"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Format & Sport */}
      {step === 2 && (
        <div className="space-y-5 p-6 rounded-2xl border border-border/60 bg-card shadow-sm animate-in fade-in-50">
          <h2 className="text-xl font-black text-foreground">
            Sport & Tournament Structure
          </h2>

          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Sport Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "FOOTBALL", label: "Football (Soccer)" },
                  { id: "CRICKET", label: "Cricket" },
                  { id: "BADMINTON", label: "Badminton" },
                  { id: "TENNIS", label: "Tennis" },
                  { id: "BASKETBALL", label: "Basketball" },
                  { id: "ESPORTS", label: "Esports (CS/Valorant)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSportChange(s.id)}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      sportType === s.id
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Tournament Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: "GROUP_AND_KNOCKOUT",
                    name: "Group Stage + Knockout",
                    desc: "World Cup / Champions League style",
                  },
                  {
                    id: "SINGLE_ELIMINATION",
                    name: "Single Elimination",
                    desc: "Standard knockout cup with byes",
                  },
                  {
                    id: "DOUBLE_ELIMINATION",
                    name: "Double Elimination",
                    desc: "Winners + Losers bracket & reset",
                  },
                  {
                    id: "ROUND_ROBIN",
                    name: "Round Robin / League",
                    desc: "Every team plays each other (1 or 2 legs)",
                  },
                  {
                    id: "SWISS",
                    name: "Swiss System",
                    desc: "Dynamic record-based pairing rounds",
                  },
                  {
                    id: "LEAGUE_PLAYOFFS",
                    name: "League + Playoffs",
                    desc: "Top table finishers advance to bracket",
                  },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setFormat(fmt.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      format === fmt.id
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:bg-muted/30"
                    }`}
                  >
                    <span className="font-bold text-foreground block text-xs">
                      {fmt.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {fmt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground text-sm font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Add Teams */}
      {step === 3 && (
        <div className="space-y-5 p-6 rounded-2xl border border-border/60 bg-card shadow-sm animate-in fade-in-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground">
              Participating Teams
            </h2>
            <span className="text-xs font-semibold text-muted-foreground">
              CSV Format
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Paste team names below (one per line, format: <code>Team Name, Short Code, Seed</code>).
          </p>

          <textarea
            rows={8}
            value={teamsText}
            onChange={(e) => setTeamsText(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-secondary text-foreground font-mono text-xs border border-border resize-none"
          />

          <div className="pt-4 flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-muted-foreground hover:text-foreground text-sm font-semibold"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={isSubmitting || !teamsText.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {isSubmitting ? "Generating Fixtures..." : "Create & Generate Tournament"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { StoredMatch, StoredTournament } from "@/lib/tournament-store";
import { BannerSize, BANNER_SIZES } from "@/lib/banner/types";
import { BUILT_IN_TEMPLATES } from "@/lib/banner/templates";
import {
  Download,
  Share2,
  Sliders,
  Palette,
  FileArchive,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface BannerCanvasProps {
  tournament: StoredTournament;
}

export function BannerCanvas({ tournament }: BannerCanvasProps) {
  const matches = tournament.matches;
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    matches[0]?.id || ""
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("modern-bold");
  const [selectedSize, setSelectedSize] =
    useState<BannerSize>("SQUARE_1080x1080");
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);

  const selectedMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0];

  const teamMap = new Map(tournament.teams.map((t) => [t.id, t]));
  const homeTeam = selectedMatch?.homeTeamId
    ? teamMap.get(selectedMatch.homeTeamId)
    : null;
  const awayTeam = selectedMatch?.awayTeamId
    ? teamMap.get(selectedMatch.awayTeamId)
    : null;

  const homeName =
    homeTeam?.name || selectedMatch?.homePlaceholder || "Home Team";
  const awayName =
    awayTeam?.name || selectedMatch?.awayPlaceholder || "Away Team";

  const templateStyle =
    BUILT_IN_TEMPLATES[selectedTemplate] || BUILT_IN_TEMPLATES["modern-bold"];

  const handleDownloadPng = () => {
    if (!selectedMatch) return;
    const downloadUrl = `/api/banners/${selectedMatch.id}?template=${selectedTemplate}&size=${selectedSize}`;
    window.open(downloadUrl, "_blank");
  };

  const handleExportZip = async () => {
    setIsExportingZip(true);
    try {
      const res = await fetch(
        `/api/tournaments/${tournament.id}/banners/export-zip`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateId: selectedTemplate,
            size: selectedSize,
          }),
        }
      );
      if (!res.ok) throw new Error("ZIP export failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tournament.slug}-match-banners.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadReady(true);
      setTimeout(() => setDownloadReady(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExportingZip(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Controls & Configuration (Left column) */}
      <div className="space-y-6">
        {/* Match Selector */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Sliders className="h-4 w-4 text-primary" />
            Select Match
          </label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border/60"
          >
            {matches.map((m) => {
              const h = m.homeTeamId ? teamMap.get(m.homeTeamId)?.name : m.homePlaceholder;
              const a = m.awayTeamId ? teamMap.get(m.awayTeamId)?.name : m.awayPlaceholder;
              return (
                <option key={m.id} value={m.id}>
                  Match #{m.matchNumber}: {h || "TBD"} vs {a || "TBD"}
                </option>
              );
            })}
          </select>
        </div>

        {/* Template Selector */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Banner Template (5 Themes)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { id: "modern-bold", name: "Modern Bold", tag: "Contemporary" },
              { id: "cyber-neon", name: "Cyber Neon", tag: "Esports & High Contrast" },
              { id: "classic-heritage", name: "Classic Heritage", tag: "Traditional Football" },
              { id: "minimalist-dark", name: "Minimalist Dark", tag: "Clean Typography" },
              { id: "stadium-broadcast", name: "Stadium Broadcast", tag: "TV Matchday" },
            ].map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  selectedTemplate === tmpl.id
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border/60 hover:bg-muted/40"
                }`}
              >
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    {tmpl.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {tmpl.tag}
                  </span>
                </div>
                {selectedTemplate === tmpl.id && (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Output Dimensions */}
        <div className="p-5 rounded-2xl border border-border/60 bg-card shadow-sm space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Target Dimensions
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: "SQUARE_1080x1080", label: "1:1 Square", sub: "Instagram Post" },
              { id: "STORY_1080x1920", label: "9:16 Story", sub: "Reels / TikTok" },
              { id: "LANDSCAPE_1920x1080", label: "16:9 Landscape", sub: "YouTube / TV" },
              { id: "LINK_PREVIEW_1200x630", label: "1200x630", sub: "Twitter / Meta" },
            ].map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size.id as BannerSize)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedSize === size.id
                    ? "border-primary bg-primary/10 font-bold"
                    : "border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="block font-semibold text-foreground">
                  {size.label}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {size.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Export Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleDownloadPng}
            className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            <Download className="h-4 w-4" />
            Download Single Match PNG
          </button>

          <button
            onClick={handleExportZip}
            disabled={isExportingZip}
            className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm hover:bg-secondary/80 transition-all border border-border/60 disabled:opacity-50"
          >
            {isExportingZip ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating ZIP...
              </>
            ) : downloadReady ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ZIP Downloaded!
              </>
            ) : (
              <>
                <FileArchive className="h-4 w-4 text-primary" />
                Export Bulk ZIP (All Banners)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live WYSIWYG Preview Stage (Right 2 columns) */}
      <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 rounded-2xl border border-border/60 bg-card/40 backdrop-blur min-h-[500px]">
        <div className="w-full max-w-lg aspect-square rounded-2xl shadow-2xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden transition-all duration-300 border border-white/10"
             style={{ background: templateStyle.bgGradient, color: templateStyle.textColor }}>
          
          {/* Header */}
          <div className="space-y-1">
            <span
              className="text-xs uppercase tracking-widest font-extrabold block"
              style={{ color: templateStyle.primaryColor }}
            >
              {tournament.name}
            </span>
            <span
              className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-white/20"
              style={{ background: templateStyle.cardBg }}
            >
              {selectedMatch?.groupId ? `Group Match` : `Knockout Playoff`} • Round {selectedMatch?.round || 1}
            </span>
          </div>

          {/* Teams Faceoff */}
          <div className="flex items-center justify-around w-full my-6">
            <div className="flex flex-col items-center gap-3 w-40">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-lg"
                style={{
                  backgroundColor: homeTeam?.primaryColor || "#3b82f6",
                  color: "#ffffff",
                }}
              >
                {homeTeam?.shortName || homeName.slice(0, 3).toUpperCase()}
              </div>
              <span className="font-extrabold text-lg line-clamp-2 leading-tight">
                {homeName}
              </span>
            </div>

            <div className="flex flex-col items-center">
              {selectedMatch?.status === "COMPLETED" &&
              selectedMatch.homeScore !== undefined ? (
                <div
                  className="px-4 py-2 rounded-xl text-3xl font-black"
                  style={{
                    backgroundColor: templateStyle.cardBg,
                    color: templateStyle.accentColor,
                  }}
                >
                  {selectedMatch.homeScore} - {selectedMatch.awayScore}
                </div>
              ) : (
                <span
                  className="text-3xl font-black italic tracking-widest"
                  style={{ color: templateStyle.accentColor }}
                >
                  VS
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 w-40">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black shadow-lg"
                style={{
                  backgroundColor: awayTeam?.primaryColor || "#ef4444",
                  color: "#ffffff",
                }}
              >
                {awayTeam?.shortName || awayName.slice(0, 3).toUpperCase()}
              </div>
              <span className="font-extrabold text-lg line-clamp-2 leading-tight">
                {awayName}
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="w-full pt-4 border-t border-white/10 space-y-1">
            <p className="text-sm font-bold">
              {selectedMatch?.scheduledAt
                ? new Date(selectedMatch.scheduledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "Date TBD"}{" "}
              •{" "}
              {selectedMatch?.scheduledAt
                ? new Date(selectedMatch.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Time TBD"}
            </p>
            <p className="text-xs text-white/60">
              📍 {selectedMatch?.venueName || "Official Tournament Arena"}
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          ✨ Live render preview. Download high-res 1080p PNG via Satori + Resvg engine.
        </p>
      </div>
    </div>
  );
}

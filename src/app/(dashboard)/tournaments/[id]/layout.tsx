import React from "react";
import { notFound } from "next/navigation";
import { tournamentStore } from "@/lib/tournament-store";
import { Sidebar } from "@/components/shared/Sidebar";

export const dynamic = "force-dynamic";

export default function TournamentDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const tournament = tournamentStore.getById(params.id);
  if (!tournament) {
    notFound();
  }

  return (
    <div className="flex-1 flex w-full">
      <Sidebar
        tournamentId={tournament.id}
        tournamentSlug={tournament.slug}
        tournamentName={tournament.name}
      />
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">{children}</div>
    </div>
  );
}

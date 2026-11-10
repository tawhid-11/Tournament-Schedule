import React from "react";
import { TournamentWizard } from "@/components/tournament/TournamentWizard";

export default function NewTournamentPage() {
  return (
    <div className="container px-4 sm:px-8 py-8">
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Create New Tournament
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Configure rules, sports model, bracket structure, and generate fixtures in seconds.
        </p>
      </div>

      <TournamentWizard />
    </div>
  );
}

import { describe, it, expect } from "vitest";
import { generateDoubleElimination } from "@/lib/fixture-engine/double-elimination";
import { EngineTeam } from "@/lib/fixture-engine/types";

describe("Fixture Engine - Double Elimination", () => {
  const teams4: EngineTeam[] = [
    { id: "t1", name: "Team 1", seed: 1 },
    { id: "t2", name: "Team 2", seed: 2 },
    { id: "t3", name: "Team 3", seed: 3 },
    { id: "t4", name: "Team 4", seed: 4 },
  ];

  it("should generate winners bracket, losers bracket, and grand final", () => {
    const matches = generateDoubleElimination(teams4, {
      stageId: "de-stage",
      grandFinalReset: true,
    });

    const wbMatches = matches.filter((m) => m.branch === "WINNERS");
    const lbMatches = matches.filter((m) => m.branch === "LOSERS");
    const finals = matches.filter((m) => m.branch === "FINAL");

    expect(wbMatches.length).toBeGreaterThan(0);
    expect(lbMatches.length).toBeGreaterThan(0);
    // Grand Final + Grand Final Reset = 2 matches
    expect(finals.length).toBe(2);

    // Verify losers drop to losers bracket
    const lbDropMatch = lbMatches.find((m) => m.homeSourceRule === "LOSER");
    expect(lbDropMatch).toBeDefined();
  });
});

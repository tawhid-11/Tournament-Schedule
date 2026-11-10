import { describe, it, expect } from "vitest";
import { generateRoundRobin } from "@/lib/fixture-engine/round-robin";
import { EngineTeam } from "@/lib/fixture-engine/types";

describe("Fixture Engine - Round Robin", () => {
  const teams4: EngineTeam[] = [
    { id: "t1", name: "Team 1" },
    { id: "t2", name: "Team 2" },
    { id: "t3", name: "Team 3" },
    { id: "t4", name: "Team 4" },
  ];

  it("should generate 6 matches (3 rounds of 2 matches) for 4 teams in 1 leg", () => {
    const matches = generateRoundRobin(teams4, { stageId: "stage-1", legs: 1 });
    expect(matches).toHaveLength(6);

    // Verify all teams play 3 times
    const appearances: Record<string, number> = {};
    matches.forEach((m) => {
      appearances[m.homeTeamId!] = (appearances[m.homeTeamId!] || 0) + 1;
      appearances[m.awayTeamId!] = (appearances[m.awayTeamId!] || 0) + 1;
    });

    expect(appearances["t1"]).toBe(3);
    expect(appearances["t2"]).toBe(3);
    expect(appearances["t3"]).toBe(3);
    expect(appearances["t4"]).toBe(3);
  });

  it("should double match count for 2 legs and invert home/away in leg 2", () => {
    const matches = generateRoundRobin(teams4, { stageId: "stage-1", legs: 2 });
    expect(matches).toHaveLength(12);

    const leg1 = matches.filter((m) => m.leg === 1);
    const leg2 = matches.filter((m) => m.leg === 2);
    expect(leg1).toHaveLength(6);
    expect(leg2).toHaveLength(6);

    // Verify reverse pairing exists
    const firstLeg1Match = leg1[0];
    const reverseMatch = leg2.find(
      (m) =>
        m.homeTeamId === firstLeg1Match.awayTeamId &&
        m.awayTeamId === firstLeg1Match.homeTeamId
    );
    expect(reverseMatch).toBeDefined();
  });

  it("should handle odd team count by inserting byes without scheduling ghost matches", () => {
    const teams3: EngineTeam[] = [
      { id: "t1", name: "Team 1" },
      { id: "t2", name: "Team 2" },
      { id: "t3", name: "Team 3" },
    ];

    const matches = generateRoundRobin(teams3, { stageId: "stage-1", legs: 1 });
    // 3 teams = 3 rounds, 1 match per round = 3 matches
    expect(matches).toHaveLength(3);

    // Each team plays 2 matches and rests 1 round
    const appearances: Record<string, number> = {};
    matches.forEach((m) => {
      appearances[m.homeTeamId!] = (appearances[m.homeTeamId!] || 0) + 1;
      appearances[m.awayTeamId!] = (appearances[m.awayTeamId!] || 0) + 1;
    });

    expect(appearances["t1"]).toBe(2);
    expect(appearances["t2"]).toBe(2);
    expect(appearances["t3"]).toBe(2);
  });

  it("should ignore withdrawn teams", () => {
    const teamsWithWithdrawn: EngineTeam[] = [
      { id: "t1", name: "Team 1" },
      { id: "t2", name: "Team 2" },
      { id: "t3", name: "Team 3", isWithdrawn: true },
      { id: "t4", name: "Team 4" },
    ];

    const matches = generateRoundRobin(teamsWithWithdrawn, { stageId: "stage-1", legs: 1 });
    // Only 3 active teams => 3 matches
    expect(matches).toHaveLength(3);
    const hasT3 = matches.some((m) => m.homeTeamId === "t3" || m.awayTeamId === "t3");
    expect(hasT3).toBe(false);
  });
});

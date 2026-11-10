import { describe, it, expect } from "vitest";
import {
  resolveBracketProgression,
  determineMatchWinner,
} from "@/lib/fixture-engine/progression";
import { EngineMatch, EngineTeam } from "@/lib/fixture-engine/types";

describe("Fixture Engine - Bracket Progression & Results", () => {
  const teams: EngineTeam[] = [
    { id: "t1", name: "Team Alpha" },
    { id: "t2", name: "Team Beta" },
    { id: "t3", name: "Team Gamma" },
    { id: "t4", name: "Team Delta" },
  ];

  it("should determine regular score winner accurately", () => {
    const match: EngineMatch = {
      id: "m1",
      stageId: "s1",
      round: 1,
      matchNumber: 1,
      leg: 1,
      homeTeamId: "t1",
      awayTeamId: "t2",
    };

    const res = determineMatchWinner(match, { homeScore: 3, awayScore: 1 });
    expect(res.winnerId).toBe("t1");
    expect(res.loserId).toBe("t2");
  });

  it("should handle walkovers correctly", () => {
    const match: EngineMatch = {
      id: "m1",
      stageId: "s1",
      round: 1,
      matchNumber: 1,
      leg: 1,
      homeTeamId: "t1",
      awayTeamId: "t2",
    };

    const res = determineMatchWinner(match, {
      homeScore: 0,
      awayScore: 0,
      isWalkover: true,
      walkoverWinnerId: "t2",
    });
    expect(res.winnerId).toBe("t2");
    expect(res.loserId).toBe("t1");
  });

  it("should advance winner to downstream match", () => {
    const qf1: EngineMatch = {
      id: "qf1",
      stageId: "s1",
      round: 1,
      matchNumber: 1,
      leg: 1,
      homeTeamId: "t1",
      awayTeamId: "t2",
    };

    const sf1: EngineMatch = {
      id: "sf1",
      stageId: "s1",
      round: 2,
      matchNumber: 3,
      leg: 1,
      homeSourceMatchId: "qf1",
      homeSourceRule: "WINNER",
      homePlaceholder: "Winner M1",
      awayPlaceholder: "Winner M2",
    };

    const resolution = resolveBracketProgression(
      qf1,
      { homeScore: 2, awayScore: 0 },
      [sf1],
      teams
    );

    expect(resolution.completedMatch.winnerTeamId).toBe("t1");
    expect(resolution.updatedSubsequentMatches).toHaveLength(1);
    expect(resolution.updatedSubsequentMatches[0].homeTeamId).toBe("t1");
    expect(resolution.updatedSubsequentMatches[0].homePlaceholder).toBe("Team Alpha");
  });
});

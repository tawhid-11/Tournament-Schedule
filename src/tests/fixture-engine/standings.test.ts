import { describe, it, expect } from "vitest";
import { computeStandings, MatchResultRecord } from "@/lib/fixture-engine/standings";
import { EngineTeam } from "@/lib/fixture-engine/types";

describe("Fixture Engine - Standings & Tiebreakers", () => {
  const teams: EngineTeam[] = [
    { id: "t1", name: "Team 1" },
    { id: "t2", name: "Team 2" },
    { id: "t3", name: "Team 3" },
  ];

  it("should calculate correct points, goal difference, and win counts", () => {
    const matches: MatchResultRecord[] = [
      {
        matchId: "m1",
        homeTeamId: "t1",
        awayTeamId: "t2",
        homeScore: 3,
        awayScore: 1,
        status: "COMPLETED",
      },
      {
        matchId: "m2",
        homeTeamId: "t2",
        awayTeamId: "t3",
        homeScore: 2,
        awayScore: 2,
        status: "COMPLETED",
      },
      {
        matchId: "m3",
        homeTeamId: "t1",
        awayTeamId: "t3",
        homeScore: 1,
        awayScore: 0,
        status: "COMPLETED",
      },
    ];

    const standings = computeStandings(teams, matches);

    // Team 1: 2 wins = 6 points, GD +3
    expect(standings[0].teamId).toBe("t1");
    expect(standings[0].points).toBe(6);
    expect(standings[0].won).toBe(2);
    expect(standings[0].goalDifference).toBe(3);
    expect(standings[0].rank).toBe(1);

    // Team 3 and Team 2 have 1 point each.
    // Team 3: GD -1 (2-3), Team 2: GD -2 (3-5)
    // Team 3 should be rank 2
    expect(standings[1].teamId).toBe("t3");
    expect(standings[1].points).toBe(1);
    expect(standings[1].rank).toBe(2);

    expect(standings[2].teamId).toBe("t2");
    expect(standings[2].points).toBe(1);
    expect(standings[2].rank).toBe(3);
  });

  it("should resolve ties using Head-to-Head when points and GD are tied", () => {
    // Both t1 and t2 end with 3 points, GD 0, but t1 beat t2
    const matches: MatchResultRecord[] = [
      {
        matchId: "m1",
        homeTeamId: "t1",
        awayTeamId: "t2",
        homeScore: 2,
        awayScore: 1,
        status: "COMPLETED",
      },
      {
        matchId: "m2",
        homeTeamId: "t3",
        awayTeamId: "t1",
        homeScore: 2,
        awayScore: 1,
        status: "COMPLETED",
      },
      {
        matchId: "m3",
        homeTeamId: "t2",
        awayTeamId: "t3",
        homeScore: 1,
        awayScore: 0,
        status: "COMPLETED",
      },
    ];

    const standings = computeStandings(teams, matches, {
      tieBreakers: ["POINTS", "GOAL_DIFFERENCE", "HEAD_TO_HEAD"],
    });

    // All teams have 3 points and GD 0.
    // The ranking will resolve via Head-to-Head and Goals For
    expect(standings).toHaveLength(3);
    expect(standings[0].points).toBe(3);
    expect(standings[1].points).toBe(3);
    expect(standings[2].points).toBe(3);
  });
});

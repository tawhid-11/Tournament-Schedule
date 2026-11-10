import { EngineTeam, EngineMatch } from "./types";
import { generateRoundRobin } from "./round-robin";

export interface GroupDefinition {
  id: string;
  name: string; // "Group A", "Group B", etc.
  sortOrder: number;
  teams: EngineTeam[];
  advanceCount: number;
}

export interface AutoDrawOptions {
  method: "SEEDED_POTS" | "RANDOM" | "SNAKE";
  numberOfGroups: number;
  advancePerGroup?: number;
}

/**
 * Automatically distribute teams into groups using seeded pots, snake draft, or random draw.
 */
export function autoDrawGroups(
  teams: EngineTeam[],
  options: AutoDrawOptions
): GroupDefinition[] {
  const { numberOfGroups, method, advancePerGroup = 2 } = options;
  if (numberOfGroups <= 0) return [];

  const groupNames = Array.from({ length: numberOfGroups }, (_, i) => {
    // Generate 'Group A', 'Group B', ... 'Group Z', 'Group AA'
    let name = "";
    let n = i;
    while (n >= 0) {
      name = String.fromCharCode(65 + (n % 26)) + name;
      n = Math.floor(n / 26) - 1;
    }
    return `Group ${name}`;
  });

  const groups: GroupDefinition[] = groupNames.map((name, idx) => ({
    id: `grp-${idx + 1}`,
    name,
    sortOrder: idx + 1,
    teams: [],
    advanceCount: advancePerGroup,
  }));

  const activeTeams = teams.filter((t) => !t.isWithdrawn);

  if (method === "RANDOM") {
    // Shuffle teams randomly
    const shuffled = [...activeTeams].sort(() => Math.random() - 0.5);
    shuffled.forEach((team, idx) => {
      groups[idx % numberOfGroups].teams.push(team);
    });
  } else if (method === "SNAKE") {
    // Snake draft distribution (1, 2, 3, 4, then 4, 3, 2, 1)
    const sorted = [...activeTeams].sort(
      (a, b) => (a.seed ?? 999) - (b.seed ?? 999)
    );
    let currentGrp = 0;
    let direction = 1;

    sorted.forEach((team) => {
      groups[currentGrp].teams.push(team);
      currentGrp += direction;
      if (currentGrp >= numberOfGroups) {
        currentGrp = numberOfGroups - 1;
        direction = -1;
      } else if (currentGrp < 0) {
        currentGrp = 0;
        direction = 1;
      }
    });
  } else {
    // Default: SEEDED_POTS (FIFA World Cup style)
    // Pot 1 = Seeds 1..K, Pot 2 = Seeds K+1..2K, etc.
    const sorted = [...activeTeams].sort(
      (a, b) => (a.seed ?? 999) - (b.seed ?? 999)
    );

    const potSize = numberOfGroups;
    const numPots = Math.ceil(sorted.length / potSize);

    for (let p = 0; p < numPots; p++) {
      const potTeams = sorted.slice(p * potSize, (p + 1) * potSize);
      // Shuffle within the pot for a realistic draw
      const shuffledPot = [...potTeams].sort(() => Math.random() - 0.5);

      shuffledPot.forEach((team, idx) => {
        if (groups[idx]) {
          groups[idx].teams.push({ ...team, pot: p + 1 });
        }
      });
    }
  }

  return groups;
}

/**
 * Generate all round robin fixtures across all defined groups.
 */
export function generateGroupStageFixtures(
  groups: GroupDefinition[],
  stageId: string,
  legs: 1 | 2 = 1
): EngineMatch[] {
  const allMatches: EngineMatch[] = [];
  let globalMatchNum = 1;

  for (const group of groups) {
    const groupMatches = generateRoundRobin(group.teams, {
      stageId,
      groupId: group.id,
      legs,
      startRound: 1,
      startMatchNumber: globalMatchNum,
    });

    allMatches.push(...groupMatches);
    globalMatchNum += groupMatches.length;
  }

  return allMatches;
}

/**
 * Validates group sizes and returns warnings if uneven.
 */
export function validateGroupSizes(groups: GroupDefinition[]): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  if (groups.length === 0) {
    return { isValid: false, warnings: ["No groups defined."] };
  }

  const sizes = groups.map((g) => g.teams.length);
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  if (minSize < 2) {
    warnings.push("One or more groups have fewer than 2 teams.");
  }

  if (minSize !== maxSize) {
    warnings.push(
      `Groups have uneven team counts (smallest: ${minSize}, largest: ${maxSize}). Round Robin scheduling will adjust with byes.`
    );
  }

  return {
    isValid: minSize >= 2,
    warnings,
  };
}

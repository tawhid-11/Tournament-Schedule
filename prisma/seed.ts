import { PrismaClient, SportType, ScoreModel, StageType, MatchStatus, BannerType, BannerSize } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create or upsert Demo User
  const passwordHash = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@tournament.app" },
    update: {},
    create: {
      id: "demo-user-id",
      name: "Tournament Director",
      email: "demo@tournament.app",
      passwordHash,
    },
  });
  console.log(`👤 Demo user created: ${user.email}`);

  // 2. Built-in Banner Templates
  const templates = [
    {
      name: "Modern Bold",
      category: "Sports Modern",
      isBuiltIn: true,
      styles: {
        bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        accentColor: "#38bdf8",
        fontFamily: "Inter, sans-serif",
        showBadges: true,
      },
    },
    {
      name: "Cyber Neon",
      category: "Esports",
      isBuiltIn: true,
      styles: {
        bgGradient: "linear-gradient(135deg, #09090b 0%, #18181b 50%, #000000 100%)",
        accentColor: "#22c55e",
        fontFamily: "Rajdhani, sans-serif",
        showBadges: true,
      },
    },
    {
      name: "Classic Heritage",
      category: "Football Classic",
      isBuiltIn: true,
      styles: {
        bgGradient: "linear-gradient(135deg, #1e3a8a 0%, #172554 100%)",
        accentColor: "#fbbf24",
        fontFamily: "Merriweather, serif",
        showBadges: true,
      },
    },
    {
      name: "Minimalist Dark",
      category: "Minimal Clean",
      isBuiltIn: true,
      styles: {
        bgGradient: "linear-gradient(135deg, #18181b 0%, #27272a 100%)",
        accentColor: "#f43f5e",
        fontFamily: "Inter, sans-serif",
        showBadges: false,
      },
    },
    {
      name: "Stadium Broadcast",
      category: "TV Broadcast",
      isBuiltIn: true,
      styles: {
        bgGradient: "linear-gradient(135deg, #042f2e 0%, #134e4a 100%)",
        accentColor: "#f59e0b",
        fontFamily: "Impact, sans-serif",
        showBadges: true,
      },
    },
  ];

  for (const t of templates) {
    await prisma.bannerTemplate.create({
      data: t,
    });
  }
  console.log(`🎨 Created ${templates.length} banner templates.`);

  // 3. Create Sample 1: 16-Team World Cup Style Tournament (Groups + Knockout)
  const wcTournament = await prisma.tournament.create({
    data: {
      userId: user.id,
      name: "Apex Global Football Championship 2026",
      slug: "apex-football-2026",
      sportType: SportType.FOOTBALL,
      sportLabel: "Football",
      scoreModel: ScoreModel.GOALS,
      season: "2026/2027",
      startDate: new Date("2026-06-10T14:00:00Z"),
      endDate: new Date("2026-07-15T20:00:00Z"),
      isPublic: true,
      settings: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
        tieBreakers: ["POINTS", "GOAL_DIFFERENCE", "GOALS_FOR", "HEAD_TO_HEAD"],
      },
    },
  });

  // Venues for WC
  const venues = await Promise.all([
    prisma.venue.create({
      data: { tournamentId: wcTournament.id, name: "Olympic Grand Arena", city: "Metropolis" },
    }),
    prisma.venue.create({
      data: { tournamentId: wcTournament.id, name: "Centennial Park Stadium", city: "Riverdale" },
    }),
    prisma.venue.create({
      data: { tournamentId: wcTournament.id, name: "Sunset Dome", city: "West Coast" },
    }),
  ]);

  // 16 Teams
  const teamData = [
    { name: "Atlas Eagles", shortName: "EGL", primary: "#dc2626", secondary: "#ffffff", seed: 1 },
    { name: "Solaris FC", shortName: "SOL", primary: "#f59e0b", secondary: "#1e293b", seed: 2 },
    { name: "Nordic Wolves", shortName: "WLV", primary: "#0284c7", secondary: "#f8fafc", seed: 3 },
    { name: "Imperial Titans", shortName: "TTN", primary: "#7c3aed", secondary: "#f3e8ff", seed: 4 },
    { name: "Phoenix Blaze", shortName: "BLZ", primary: "#ea580c", secondary: "#ffedd5", seed: 5 },
    { name: "Thunderbolts", shortName: "TBT", primary: "#eab308", secondary: "#0f172a", seed: 6 },
    { name: "Emerald Knights", shortName: "KNT", primary: "#059669", secondary: "#ecfdf5", seed: 7 },
    { name: "Pacific Sharks", shortName: "SHK", primary: "#0891b2", secondary: "#cffafe", seed: 8 },
    { name: "Red Dragons", shortName: "RDG", primary: "#b91c1c", secondary: "#fef2f2", seed: 9 },
    { name: "Cobalt Stars", shortName: "CBT", primary: "#2563eb", secondary: "#eff6ff", seed: 10 },
    { name: "Silver Lynx", shortName: "LNX", primary: "#64748b", secondary: "#f1f5f9", seed: 11 },
    { name: "Golden Bears", shortName: "GBR", primary: "#d97706", secondary: "#451a03", seed: 12 },
    { name: "Vanguard United", shortName: "VGD", primary: "#4f46e5", secondary: "#e0e7ff", seed: 13 },
    { name: "Crimson Rangers", shortName: "CRG", primary: "#991b1b", secondary: "#fee2e2", seed: 14 },
    { name: "Cyber Strikers", shortName: "STR", primary: "#06b6d4", secondary: "#164e63", seed: 15 },
    { name: "Apex Pioneers", shortName: "PNR", primary: "#10b981", secondary: "#064e3b", seed: 16 },
  ];

  const tournamentTeams = [];
  for (const t of teamData) {
    const team = await prisma.team.create({
      data: {
        userId: user.id,
        name: t.name,
        shortName: t.shortName,
        code: t.shortName,
        primaryColor: t.primary,
        secondaryColor: t.secondary,
      },
    });
    const tt = await prisma.tournamentTeam.create({
      data: {
        tournamentId: wcTournament.id,
        teamId: team.id,
        seed: t.seed,
        pot: Math.ceil(t.seed / 4),
      },
    });
    tournamentTeams.push({ ...tt, teamName: t.name });
  }

  // Stage 1: Group Stage (4 groups of 4)
  const groupStage = await prisma.stage.create({
    data: {
      tournamentId: wcTournament.id,
      stageOrder: 1,
      name: "Group Stage",
      stageType: StageType.GROUP,
      config: { legs: 1, advancePerGroup: 2 },
    },
  });

  const groupNames = ["Group A", "Group B", "Group C", "Group D"];
  const createdGroups = [];

  for (let i = 0; i < 4; i++) {
    const grp = await prisma.group.create({
      data: {
        stageId: groupStage.id,
        name: groupNames[i],
        sortOrder: i + 1,
        advanceCount: 2,
      },
    });
    createdGroups.push(grp);

    // Assign 4 teams per group (one from each pot)
    const grpTeams = [
      tournamentTeams[i],       // Pot 1
      tournamentTeams[i + 4],   // Pot 2
      tournamentTeams[i + 8],   // Pot 3
      tournamentTeams[i + 12],  // Pot 4
    ];

    for (let j = 0; j < grpTeams.length; j++) {
      await prisma.groupTeam.create({
        data: {
          groupId: grp.id,
          tournamentTeamId: grpTeams[j].id,
          seedInGroup: j + 1,
        },
      });
      // Initial empty standing row
      await prisma.standingRow.create({
        data: {
          stageId: groupStage.id,
          groupId: grp.id,
          tournamentTeamId: grpTeams[j].id,
          rank: j + 1,
        },
      });
    }
  }

  // Stage 2: Knockout Stage (Quarter Finals -> Semi Finals -> 3rd Place -> Final)
  const knockoutStage = await prisma.stage.create({
    data: {
      tournamentId: wcTournament.id,
      stageOrder: 2,
      name: "Knockout Stage",
      stageType: StageType.SINGLE_ELIMINATION,
      config: { legs: 1, hasThirdPlace: true },
    },
  });

  console.log(`🏆 Sample 1 Created: ${wcTournament.name} with 16 teams, 4 groups, and knockout stage.`);

  // 4. Create Sample 2: 8-Team Single Elimination Esports Championship
  const esTournament = await prisma.tournament.create({
    data: {
      userId: user.id,
      name: "Cyber Masters Invitational 2026",
      slug: "cyber-masters-2026",
      sportType: SportType.ESPORTS,
      sportLabel: "Valorant / CS2",
      scoreModel: ScoreModel.POINTS,
      season: "Season 4",
      startDate: new Date("2026-08-01T10:00:00Z"),
      endDate: new Date("2026-08-04T22:00:00Z"),
      isPublic: true,
    },
  });

  const esTeamsData = [
    { name: "Team Liquid Echo", shortName: "TL", primary: "#0b2b46", seed: 1 },
    { name: "Sentinels Redux", shortName: "SEN", primary: "#ce0037", seed: 2 },
    { name: "Fnatic Rising", shortName: "FNC", primary: "#ff5900", seed: 3 },
    { name: "Paper Rex Velocity", shortName: "PRX", primary: "#00d2ff", seed: 4 },
    { name: "Cloud9 Hyper", shortName: "C9", primary: "#009fe3", seed: 5 },
    { name: "NaVi Cyber", shortName: "NAVI", primary: "#fff200", seed: 6 },
    { name: "LOUD Dynasty", shortName: "LOUD", primary: "#00ff7f", seed: 7 },
    { name: "DRX Strikers", shortName: "DRX", primary: "#0047ff", seed: 8 },
  ];

  for (const t of esTeamsData) {
    const team = await prisma.team.create({
      data: {
        userId: user.id,
        name: t.name,
        shortName: t.shortName,
        code: t.shortName,
        primaryColor: t.primary,
      },
    });
    await prisma.tournamentTeam.create({
      data: {
        tournamentId: esTournament.id,
        teamId: team.id,
        seed: t.seed,
      },
    });
  }

  await prisma.stage.create({
    data: {
      tournamentId: esTournament.id,
      stageOrder: 1,
      name: "Championship Bracket",
      stageType: StageType.SINGLE_ELIMINATION,
      config: { legs: 1, hasThirdPlace: true },
    },
  });

  console.log(`🎮 Sample 2 Created: ${esTournament.name} with 8 teams in Single Elimination.`);
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from "./prisma";

const PREDEFINED_BADGES = [
  { name: "First Submit", description: "Submit your first assignment", condition: "first_submit" },
  { name: "Perfect Score", description: "Score 100% on an assignment", condition: "perfect_score" },
  { name: "Five Perfects", description: "Score 100% on 5 assignments", condition: "five_perfect" },
  { name: "5-Week Streak", description: "Maintain a 5-week submission streak", condition: "streak_5" },
  { name: "10-Week Streak", description: "Maintain a 10-week submission streak", condition: "streak_10" },
  { name: "XP Master", description: "Reach 1000 XP", condition: "xp_1000" },
  { name: "XP Legend", description: "Reach 5000 XP", condition: "xp_5000" },
];

export async function seedBadges() {
  for (const badge of PREDEFINED_BADGES) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: { description: badge.description, condition: badge.condition },
      create: badge,
    });
  }
}

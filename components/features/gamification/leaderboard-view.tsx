"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";

interface LeaderboardEntry {
  studentId: string;
  email: string;
  totalXp: number;
  level: number;
  rank: number;
}

interface ClassLeaderboard {
  classId: string;
  className: string;
  leaderboard: LeaderboardEntry[];
  myRank: number;
  myXp: number;
}

interface BadgeInfo {
  name: string;
  description: string;
  earnedAt: string;
}

interface LeaderboardViewProps {
  classLeaderboards: ClassLeaderboard[];
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  currentStreak: number;
  badges: BadgeInfo[];
}

export function LeaderboardView({ classLeaderboards, totalXp, level, currentLevelXp, nextLevelXp, currentStreak, badges }: LeaderboardViewProps) {
  const progressPercent = nextLevelXp > 0 ? Math.round((currentLevelXp / nextLevelXp) * 100) : 100;

  return (
    <>
      <DashboardHeader title="Leaderboard & Progress" description="Track your XP, level, badges, and class rankings." />
      <main className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total XP</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{totalXp}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Level</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{level}</p>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{currentLevelXp} / {nextLevelXp} XP</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Streak</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{currentStreak} 🔥</p><p className="text-xs text-muted-foreground">weeks</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Badges</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{badges.length}</p></CardContent>
          </Card>
        </div>

        {badges.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Earned Badges</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {badges.map((b) => (
                  <div key={b.name} className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium">
                    <span>🏆</span>
                    <span>{b.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {classLeaderboards.map((cl) => (
          <Card key={cl.classId}>
            <CardHeader>
              <CardTitle>{cl.className} Leaderboard</CardTitle>
              <CardDescription>Your rank: #{cl.myRank} ({cl.myXp} XP)</CardDescription>
            </CardHeader>
            <CardContent>
              {cl.leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">No rankings yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead className="text-right">XP</TableHead>
                      <TableHead className="text-right">Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cl.leaderboard.map((entry) => (
                      <TableRow key={entry.studentId}>
                        <TableCell className="font-bold">#{entry.rank}</TableCell>
                        <TableCell>{entry.email}</TableCell>
                        <TableCell className="text-right font-semibold">{entry.totalXp}</TableCell>
                        <TableCell className="text-right">{entry.level}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ))}
      </main>
    </>
  );
}

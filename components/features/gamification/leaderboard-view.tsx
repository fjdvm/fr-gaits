"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Trophy } from "lucide-react";
import { Podium } from "./components/podium";
import { ScholarStatus } from "./components/scholar-status";
import { BadgesWidget } from "./components/badges-widget";

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

export function LeaderboardView({
  classLeaderboards,
  totalXp,
  level,
  currentLevelXp,
  nextLevelXp,
  currentStreak,
  badges,
}: LeaderboardViewProps) {
  const [selectedClassId, setSelectedClassId] = useState(
    classLeaderboards[0]?.classId || ""
  );

  const activeLeaderboard = classLeaderboards.find(
    (cl) => cl.classId === selectedClassId
  );

  const sortedLeaderboard = activeLeaderboard
    ? [...activeLeaderboard.leaderboard].sort((a, b) => a.rank - b.rank)
    : [];

  const firstPlace = sortedLeaderboard.find((entry) => entry.rank === 1);
  const secondPlace = sortedLeaderboard.find((entry) => entry.rank === 2);
  const thirdPlace = sortedLeaderboard.find((entry) => entry.rank === 3);

  const tableEntries = sortedLeaderboard.filter((entry) => entry.rank > 3);

  return (
    <>
      <DashboardHeader
        title="Hall of Scholars"
        description="Track your XP, badges, and class rankings."
      />
      <main className="flex-grow overflow-y-auto px-6 md:px-10 py-8 gap-8 flex flex-col lg:flex-row">
        {/* Left Column: Podium & Leaderboard */}
        <div className="flex-grow flex flex-col gap-8 max-w-4xl">
          {/* Class Selector Tab Buttons */}
          <div className="flex gap-4 border-b border-surface-container pb-2 flex-wrap">
            {classLeaderboards.map((cl) => (
              <button
                key={cl.classId}
                onClick={() => setSelectedClassId(cl.classId)}
                className={`font-semibold text-sm pb-2 border-b-2 transition-colors cursor-pointer ${
                  selectedClassId === cl.classId
                    ? "border-primary text-primary"
                    : "border-transparent text-secondary hover:text-on-surface"
                }`}
              >
                {cl.className}
              </button>
            ))}
          </div>

          {sortedLeaderboard.length === 0 ? (
            <div className="bg-white border border-surface-container rounded-3xl p-12 text-center flex flex-col items-center">
              <Trophy className="h-12 w-12 text-secondary/30 mb-4" />
              <h3 className="font-bold text-lg text-on-surface">No rankings yet</h3>
              <p className="text-xs text-secondary mt-1">Enrollments or student activities are pending.</p>
            </div>
          ) : (
            <>
              {/* Podium Top 3 */}
              <Podium
                firstPlace={firstPlace}
                secondPlace={secondPlace}
                thirdPlace={thirdPlace}
              />

              {/* Table Leaderboard */}
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-surface-container flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-secondary text-xs border-b border-surface-container font-semibold">
                      <th className="pb-4 pl-4 w-16">Rank</th>
                      <th className="pb-4">Scholar</th>
                      <th className="pb-4 text-right">XP</th>
                      <th className="pb-4 text-right">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableEntries.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-secondary italic">
                          No other entries in leaderboard.
                        </td>
                      </tr>
                    ) : (
                      tableEntries.map((entry) => (
                        <tr key={entry.studentId} className="border-b border-surface-container last:border-0 hover:bg-surface-container-low transition-colors">
                          <td className="py-4 pl-4 text-sm font-bold text-on-surface">#{entry.rank}</td>
                          <td className="py-4 text-sm text-on-surface font-semibold">{entry.email.split("@")[0]}</td>
                          <td className="py-4 text-sm text-right font-bold text-on-surface">{entry.totalXp}</td>
                          <td className="py-4 text-sm text-right text-secondary">{entry.level}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Personal Stats Sidebar */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-8 lg:border-l lg:border-surface-container lg:pl-10">
          <ScholarStatus
            level={level}
            currentLevelXp={currentLevelXp}
            nextLevelXp={nextLevelXp}
            currentStreak={currentStreak}
          />
          <BadgesWidget badges={badges} />
        </div>
      </main>
    </>
  );
}

"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { Trophy, Award, Flame, Shield, HelpCircle } from "lucide-react";

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
  const progressPercent = nextLevelXp > 0 ? Math.round((currentLevelXp / nextLevelXp) * 100) : 100;

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
              <div className="grid grid-cols-3 gap-4 md:gap-6 pt-12 items-end">
                {/* 2nd Place */}
                <div className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-end relative shadow-sm border border-surface-container min-h-[160px]">
                  <div className="absolute -top-8 w-16 h-16 rounded-full border-4 border-white shadow-md bg-surface-container flex items-center justify-center font-bold text-lg text-secondary">
                    {secondPlace ? secondPlace.email[0].toUpperCase() : "2"}
                  </div>
                  <div className="absolute -top-10 right-1/2 translate-x-6 bg-surface-container text-on-surface w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-white">
                    2
                  </div>
                  <h3 className="font-bold text-xs mt-6 text-center text-on-surface truncate w-full">
                    {secondPlace ? secondPlace.email.split("@")[0] : "Empty"}
                  </h3>
                  <p className="text-[10px] text-secondary mb-3">
                    {secondPlace ? `Lvl ${secondPlace.level}` : "-"}
                  </p>
                  <div className="bg-surface-container-low px-3 py-1 rounded-full flex items-center gap-1 text-secondary text-[11px] font-bold">
                    <Award className="h-3 w-3" />
                    <span>{secondPlace ? secondPlace.totalXp : 0} XP</span>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="bg-white rounded-[24px] p-6 flex flex-col items-center justify-end relative shadow-md border-2 border-primary-container min-h-[200px] z-10 scale-105">
                  <div className="absolute -top-10 w-20 h-20 rounded-full border-4 border-primary-container shadow-md bg-primary-container/20 flex items-center justify-center font-bold text-2xl text-primary">
                    {firstPlace ? firstPlace.email[0].toUpperCase() : "1"}
                  </div>
                  <div className="absolute -top-12 right-1/2 translate-x-8 bg-primary-container text-on-primary-container w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm border border-white">
                    <Trophy className="h-4 w-4 fill-on-primary-container" />
                  </div>
                  <h3 className="font-bold text-sm mt-8 text-center text-primary truncate w-full">
                    {firstPlace ? firstPlace.email.split("@")[0] : "Empty"}
                  </h3>
                  <p className="text-[10px] text-secondary mb-3">
                    {firstPlace ? `Lvl ${firstPlace.level}` : "-"}
                  </p>
                  <div className="bg-primary-container px-3 py-1 rounded-full flex items-center gap-1 text-on-primary-container text-xs font-bold">
                    <Award className="h-3 w-3 fill-on-primary-container" />
                    <span>{firstPlace ? firstPlace.totalXp : 0} XP</span>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-white rounded-[24px] p-4 flex flex-col items-center justify-end relative shadow-sm border border-surface-container min-h-[140px]">
                  <div className="absolute -top-8 w-14 h-14 rounded-full border-4 border-white shadow-md bg-surface-container flex items-center justify-center font-bold text-base text-secondary">
                    {thirdPlace ? thirdPlace.email[0].toUpperCase() : "3"}
                  </div>
                  <div className="absolute -top-10 right-1/2 translate-x-5 bg-surface-container text-on-surface w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border border-white">
                    3
                  </div>
                  <h3 className="font-bold text-xs mt-6 text-center text-on-surface truncate w-full">
                    {thirdPlace ? thirdPlace.email.split("@")[0] : "Empty"}
                  </h3>
                  <p className="text-[10px] text-secondary mb-3">
                    {thirdPlace ? `Lvl ${thirdPlace.level}` : "-"}
                  </p>
                  <div className="bg-surface-container-low px-3 py-1 rounded-full flex items-center gap-1 text-secondary text-[11px] font-bold">
                    <Award className="h-3 w-3" />
                    <span>{thirdPlace ? thirdPlace.totalXp : 0} XP</span>
                  </div>
                </div>
              </div>

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
          {/* Progress Card */}
          <div className="bg-white border border-surface-container rounded-3xl p-6 flex flex-col gap-4 shadow-sm">
            <h2 className="font-bold text-lg text-on-surface">Scholar Status</h2>
            <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-2xl">
              <div>
                <p className="text-xs text-secondary font-medium">Current Level</p>
                <h3 className="text-3xl font-extrabold text-on-surface mt-1">Level {level}</h3>
              </div>
              <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center font-extrabold text-lg shadow-sm">
                {level}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-secondary">
                <span>XP Progress</span>
                <span>{currentLevelXp} / {nextLevelXp} XP</span>
              </div>
              <div className="h-3 w-full rounded-full bg-surface-container overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-container transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 bg-surface-container-low p-4 rounded-2xl border border-surface-container">
              <Flame className="h-8 w-8 text-primary fill-primary-container" />
              <div>
                <p className="text-[10px] text-secondary font-bold uppercase tracking-wider">Weekly Streak</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{currentStreak} Weeks Active</p>
              </div>
            </div>
          </div>

          {/* Badges Widget */}
          <div className="bg-white border border-surface-container rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="font-bold text-lg text-on-surface">Earned Badges</h2>
            {badges.length === 0 ? (
              <p className="text-xs text-secondary italic text-center py-6">No badges earned yet. Solve assignments to earn them!</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((b) => (
                  <div
                    key={b.name}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-surface-container-low border border-surface-container text-center group hover:border-primary-container transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Shield className="h-5 w-5 text-primary fill-primary-container" />
                    </div>
                    <span className="text-xs font-bold text-on-surface mt-2 truncate w-full">{b.name}</span>
                    <span className="text-[9px] text-secondary mt-0.5 leading-tight line-clamp-1">{b.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

import { Trophy } from "lucide-react";
import { Podium } from "@/components/features/gamification/components/podium";

interface LeaderboardEntry {
  studentId: string;
  email: string;
  totalXp: number;
  level: number;
  rank: number;
}

interface ClassLeaderboardTabProps {
  leaderboard: LeaderboardEntry[];
  myRank?: number;
}

export function ClassLeaderboardTab({ leaderboard, myRank }: ClassLeaderboardTabProps) {
  const firstPlace = leaderboard.find((e) => e.rank === 1);
  const secondPlace = leaderboard.find((e) => e.rank === 2);
  const thirdPlace = leaderboard.find((e) => e.rank === 3);
  const tableEntries = leaderboard.filter((e) => e.rank > 3);

  if (leaderboard.length === 0) {
    return (
      <div className="max-w-3xl w-full bg-white border border-surface-container rounded-3xl p-12 text-center flex flex-col items-center">
        <Trophy className="h-12 w-12 text-secondary/30 mb-4" />
        <h3 className="font-bold text-lg text-on-surface">No rankings yet</h3>
        <p className="text-xs text-secondary mt-1">Once students earn XP, rankings will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full space-y-6">
      {myRank ? (
        <p className="text-xs text-secondary">
          Your rank in this class: <span className="font-bold text-on-surface">#{myRank}</span>
        </p>
      ) : null}

      <Podium firstPlace={firstPlace} secondPlace={secondPlace} thirdPlace={thirdPlace} />

      <div className="bg-white rounded-[24px] p-6 shadow-sm border border-surface-container">
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
    </div>
  );
}

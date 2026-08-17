import { Flame } from "lucide-react";

interface ScholarStatusProps {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  currentStreak: number;
}

export function ScholarStatus({
  level,
  currentLevelXp,
  nextLevelXp,
  currentStreak,
}: ScholarStatusProps) {
  const progressPercent = nextLevelXp > 0 ? Math.round((currentLevelXp / nextLevelXp) * 100) : 100;

  return (
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
  );
}

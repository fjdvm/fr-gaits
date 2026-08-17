import { Trophy, Award } from "lucide-react";

interface LeaderboardEntry {
  studentId: string;
  email: string;
  totalXp: number;
  level: number;
  rank: number;
}

interface PodiumProps {
  firstPlace?: LeaderboardEntry;
  secondPlace?: LeaderboardEntry;
  thirdPlace?: LeaderboardEntry;
}

export function Podium({ firstPlace, secondPlace, thirdPlace }: PodiumProps) {
  return (
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
  );
}

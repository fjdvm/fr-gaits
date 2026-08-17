import { Shield } from "lucide-react";

interface BadgeInfo {
  name: string;
  description: string;
  earnedAt: string;
}

export function BadgesWidget({ badges }: { badges: BadgeInfo[] }) {
  return (
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
  );
}

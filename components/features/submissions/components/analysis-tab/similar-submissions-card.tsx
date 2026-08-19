import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import type { SimilarSubmission } from "@/app/actions/submission-analysis";

interface SimilarSubmissionsCardProps {
  assignmentId: string;
  similarSubmissions: SimilarSubmission[];
}

function barColor(similarity: number): string {
  if (similarity >= 0.75) return "bg-destructive";
  if (similarity >= 0.55) return "bg-orange-500";
  return "bg-yellow-500";
}

function badgeStyle(similarity: number): string {
  if (similarity >= 0.75) return "bg-destructive/10 text-destructive";
  if (similarity >= 0.55) return "bg-orange-100 text-orange-700";
  return "bg-yellow-100 text-yellow-700";
}

export function SimilarSubmissionsCard({ assignmentId, similarSubmissions }: SimilarSubmissionsCardProps) {
  return (
    <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container">
      <div className="flex items-center gap-2.5 mb-3">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <div>
          <h5 className="font-bold text-xs text-on-surface">Similar Submissions</h5>
          <p className="text-[10px] text-secondary mt-0.5">Code overlap with other students on this assignment</p>
        </div>
      </div>

      {similarSubmissions.length === 0 ? (
        <p className="text-xs text-secondary">No similar submission pairs found above the threshold.</p>
      ) : (
        <div className="space-y-3">
          {similarSubmissions.map((s) => {
            const percent = Math.round(s.similarity * 100);
            return (
              <div
                key={s.studentId}
                className="p-3 rounded-2xl bg-white border border-surface-container"
              >
                <div className="flex items-center justify-between mb-2">
                  <Link
                    href={`/dashboard/instructor/submissions/${assignmentId}/${s.studentId}`}
                    className="text-xs font-semibold text-on-surface hover:text-primary"
                  >
                    {s.displayName}
                  </Link>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeStyle(s.similarity)}`}>
                    {percent}% similar
                  </span>
                </div>
                <div
                  className="h-2 w-full rounded-full bg-surface-container-low overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${s.displayName} code similarity`}
                >
                  <div
                    className={`h-full rounded-full ${barColor(s.similarity)}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

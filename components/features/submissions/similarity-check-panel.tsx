"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldAlert, Loader2 } from "lucide-react";
import { checkSimilarity } from "@/app/actions/check-similarity";
import { getDisplayName } from "@/lib/display-name";

interface StudentInfo {
  studentId: string;
  email: string;
  name: string | null;
}

interface SimilarityCheckPanelProps {
  assignmentId: string;
  students: StudentInfo[];
}

interface SimilarityPair {
  studentAId: string;
  studentBId: string;
  similarity: number;
}

export function SimilarityCheckPanel({ assignmentId, students }: SimilarityCheckPanelProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [pairs, setPairs] = useState<SimilarityPair[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const studentById = new Map(students.map((s) => [s.studentId, s]));

  const handleCheck = async () => {
    setIsChecking(true);
    setError(null);
    const result = await checkSimilarity(assignmentId);
    if (result.success) {
      setPairs(result.pairs || []);
    } else {
      setError(result.error || "Failed to check similarity");
    }
    setIsChecking(false);
  };

  return (
    <div className="bg-white rounded-[24px] border border-surface-container shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-bold text-sm text-on-surface">Code Similarity Check</h3>
            <p className="text-[10px] text-secondary mt-0.5">Compare submissions within this assignment for matching code</p>
          </div>
        </div>
        <button
          onClick={handleCheck}
          disabled={isChecking}
          className="px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary hover:text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {isChecking && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {isChecking ? "Checking..." : "Check for Similar Submissions"}
        </button>
      </div>

      {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

      {pairs !== null && pairs.length === 0 && !error && (
        <p className="text-xs text-secondary">No similar submission pairs found above the threshold.</p>
      )}

      {pairs !== null && pairs.length > 0 && (
        <div className="space-y-2">
          {pairs.map((pair, index) => {
            const studentA = studentById.get(pair.studentAId);
            const studentB = studentById.get(pair.studentBId);
            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-surface-container"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <Link href={`/dashboard/instructor/submissions/${assignmentId}/${pair.studentAId}`} className="hover:text-primary">
                    {studentA ? getDisplayName(studentA) : pair.studentAId}
                  </Link>
                  <span className="text-secondary">↔</span>
                  <Link href={`/dashboard/instructor/submissions/${assignmentId}/${pair.studentBId}`} className="hover:text-primary">
                    {studentB ? getDisplayName(studentB) : pair.studentBId}
                  </Link>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                  {Math.round(pair.similarity * 100)}% similar
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

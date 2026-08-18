"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinClass } from "@/app/actions/join-class";
import { toast } from "sonner";
import { DashboardHeader } from "./dashboard-header";
import { StudentScheduleSidebar } from "./student-schedule-sidebar";
import { StudentClassCard, type EnrolledClass } from "./student-class-card";
import { School } from "lucide-react";

interface StudentViewProps {
  initialClasses: EnrolledClass[];
}

export function StudentView({ initialClasses }: StudentViewProps) {
  const router = useRouter();
  const [classes] = useState<EnrolledClass[]>(initialClasses);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeClasses = classes.filter((c) => !c.archived);
  const archivedClasses = classes.filter((c) => c.archived);
  const visibleClasses = showArchived ? archivedClasses : activeClasses;

  const allAssignments = activeClasses
    .flatMap((c) => c.assignments.map((a) => ({ ...a, className: c.name })))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.trim() === "") {
      toast.error("Please enter a join code");
      return;
    }

    setIsJoining(true);
    try {
      const result = await joinClass(joinCode);
      if (result.success) {
        toast.success(`Successfully joined class: ${result.className}!`);
        setJoinCode("");
        router.refresh();
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error(result.error || "Failed to join class");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <DashboardHeader
        title="Student Courses"
        description="Solve assignments, earn experience points, and level up."
      />
      <main className="flex-grow overflow-y-auto px-6 md:px-10 pb-10 pt-6 flex flex-col items-center">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-10">
        <div className="flex-grow flex flex-col gap-6 max-w-4xl">
          <div className="bg-surface-container-low border border-surface-container rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg text-on-surface">Enroll in a Class</h3>
              <p className="text-xs text-secondary mt-1">Enter the 6-character code provided by your instructor to join.</p>
            </div>
            <form onSubmit={handleJoinClass} className="flex gap-2 w-full sm:w-auto shrink-0">
              <input
                placeholder="CODE12"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                maxLength={6}
                disabled={isJoining}
                className="w-28 bg-white border border-surface-container rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-container text-sm font-bold uppercase tracking-wider text-center"
              />
              <button
                type="submit"
                disabled={isJoining}
                className="px-6 py-2.5 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                {isJoining ? "Joining..." : "Enroll"}
              </button>
            </form>
          </div>

          <div className="flex bg-surface-container-low p-1 rounded-xl border border-surface-container w-max">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                !showArchived ? "bg-white text-on-surface shadow-sm" : "text-secondary hover:text-on-surface"
              }`}
            >
              Active ({activeClasses.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-1.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                showArchived ? "bg-white text-on-surface shadow-sm" : "text-secondary hover:text-on-surface"
              }`}
            >
              Archived ({archivedClasses.length})
            </button>
          </div>

          {visibleClasses.length === 0 ? (
            <div className="bg-white border border-surface-container rounded-3xl p-12 text-center flex flex-col items-center">
              <School className="h-12 w-12 text-secondary/30 mb-4" />
              <h3 className="font-bold text-lg">{showArchived ? "No archived classes" : "Not enrolled in any classes"}</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm">
                {showArchived
                  ? "Classes you archive will show up here."
                  : "Join a class using the code above to start solving assignments."}
              </p>
            </div>
          ) : (
            visibleClasses.map((cls) => (
              <StudentClassCard key={cls.id} cls={cls} />
            ))
          )}
        </div>

        <StudentScheduleSidebar upcomingAssignments={allAssignments} />
        </div>
      </main>
    </>
  );
}

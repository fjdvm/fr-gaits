"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinClass } from "@/app/actions/join-class";
import { toast } from "sonner";
import { DashboardHeader } from "./dashboard-header";
import { StudentScheduleSidebar } from "./student-schedule-sidebar";
import { School, BookOpen, ChevronRight } from "lucide-react";

interface AssignmentInfo {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  status: string;
}

interface EnrolledClass {
  id: string;
  name: string;
  joinCode: string;
  instructorEmail: string;
  enrolledAt: string;
  assignments: AssignmentInfo[];
}

interface StudentViewProps {
  initialClasses: EnrolledClass[];
}

export function StudentView({ initialClasses }: StudentViewProps) {
  const router = useRouter();
  const [classes] = useState<EnrolledClass[]>(initialClasses);
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Extract all assignments for the schedule sidebar
  const allAssignments = classes
    .flatMap((c) =>
      c.assignments.map((a) => ({
        ...a,
        className: c.name,
      }))
    )
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
      <main className="flex-grow overflow-y-auto px-6 md:px-10 pb-10 pt-6 flex flex-col lg:flex-row gap-10">
        {/* Left Column: Course Cards */}
        <div className="flex-grow flex flex-col gap-6 max-w-4xl">
          {/* Join Class Banner/Card */}
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

          {classes.length === 0 ? (
            <div className="bg-white border border-surface-container rounded-3xl p-12 text-center flex flex-col items-center">
              <School className="h-12 w-12 text-secondary/30 mb-4" />
              <h3 className="font-bold text-lg">Not enrolled in any classes</h3>
              <p className="text-xs text-secondary mt-1 max-w-sm">
                Join a class using the code above to start solving assignments.
              </p>
            </div>
          ) : (
            classes.map((cls) => (
              <Link
                key={cls.id}
                href={`/dashboard/student/classes/${cls.id}`}
                className="bg-white border border-surface-container rounded-3xl p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow group relative overflow-hidden"
              >
                {/* Visual Thumbnail */}
                <div className="w-full sm:w-48 h-32 bg-surface-container-low rounded-2xl flex items-center justify-center shrink-0 overflow-hidden relative">
                  <div className="absolute inset-0 bg-primary-container/5" />
                  <School className="h-12 w-12 text-primary" />
                </div>
                {/* Content */}
                <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-on-surface group-hover:text-primary transition-colors">{cls.name}</h3>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-surface-container rounded text-secondary">
                        Code: {cls.joinCode}
                      </span>
                    </div>
                    <p className="text-xs text-secondary">
                      Instructor: <span className="font-semibold">{cls.instructorEmail}</span>
                    </p>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary">
                    <BookOpen className="h-4 w-4" />
                    {cls.assignments.length === 0 ? "No assignments yet" : `${cls.assignments.length} assignment${cls.assignments.length === 1 ? "" : "s"}`}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <StudentScheduleSidebar upcomingAssignments={allAssignments} />
      </main>
    </>
  );
}

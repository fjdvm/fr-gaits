"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinClass } from "@/app/actions/join-class";
import { toast } from "sonner";
import { DashboardHeader } from "./dashboard-header";
import { Calendar, ChevronRight, School, BookOpen, Clock, CalendarDays } from "lucide-react";

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
              <div
                key={cls.id}
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
                  {/* Assignments sub-list */}
                  <div className="mt-4 space-y-2">
                    {cls.assignments.length === 0 ? (
                      <p className="text-xs text-secondary italic">No assignments posted yet.</p>
                    ) :
                      cls.assignments.map((asm) => (
                        <Link
                          key={asm.id}
                          href={`/dashboard/student/assignments/${asm.id}`}
                          className="flex items-center justify-between p-2.5 rounded-xl border border-surface-container hover:bg-surface-container-low transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <BookOpen className="h-4 w-4 text-primary shrink-0" />
                            <span className="font-semibold text-on-surface truncate">{asm.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="bg-surface-container text-[10px] px-2 py-0.5 rounded font-mono text-secondary">
                              {asm.language}
                            </span>
                            <span className="bg-primary-container text-[10px] px-2 py-0.5 rounded font-bold text-on-primary-container uppercase">
                              {asm.status}
                            </span>
                          </div>
                        </Link>
                      ))
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Sidebar: Calendar & Schedule */}
        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-10 border-t lg:border-t-0 lg:border-l border-surface-container pt-10 lg:pt-0 lg:pl-10">
          {/* Calendar Widget */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg text-on-surface">Academy Calendar</h2>
              <Calendar className="h-5 w-5 text-secondary" />
            </div>
            <div className="bg-surface-container-low rounded-3xl p-5 border border-surface-container">
              <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center text-xs">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                  <div key={day} className="text-secondary font-semibold">{day}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isCurrent = day === new Date().getDate();
                  return (
                    <div
                      key={day}
                      className={`py-1.5 rounded-lg text-xs font-semibold ${
                        isCurrent
                          ? "bg-primary-container text-on-primary-container font-bold shadow-sm"
                          : "text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Schedule List */}
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-on-surface mb-6">Upcoming Deadlines</h2>
            <div className="flex flex-col gap-4">
              {allAssignments.length === 0 ? (
                <p className="text-xs text-secondary italic">No upcoming deadlines.</p>
              ) : (
                allAssignments.map((asm) => (
                  <Link
                    key={asm.id}
                    href={`/dashboard/student/assignments/${asm.id}`}
                    className="flex items-center gap-4 group cursor-pointer border-b border-surface-container pb-4 last:border-0"
                  >
                    <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                      <Clock className="h-5 w-5 text-on-primary-container" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate">
                        {asm.title}
                      </div>
                      <div className="text-xs text-secondary flex items-center gap-1.5 mt-0.5">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span>Due: {new Date(asm.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-secondary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

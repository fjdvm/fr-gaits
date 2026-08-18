"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { ClassTabs, type ClassTab } from "./class-tabs";
import { StreamTab } from "./stream-tab";
import { StudentClassworkTab } from "./student-classwork-tab";
import { PeopleTab } from "./people-tab";
import { ClassLeaderboardTab } from "./class-leaderboard-tab";
import type { StreamPostData, RosterStudent, RosterInstructor } from "./types";

interface StudentAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
}

interface LeaderboardEntry {
  studentId: string;
  email: string;
  totalXp: number;
  level: number;
  rank: number;
}

interface StudentClassViewProps {
  classId: string;
  className: string;
  initialPosts: StreamPostData[];
  currentUserId: string;
  assignments: StudentAssignment[];
  roster: RosterStudent[];
  instructor: RosterInstructor;
  leaderboard: LeaderboardEntry[];
  myRank?: number;
}

export function StudentClassView({
  classId,
  className,
  initialPosts,
  currentUserId,
  assignments,
  roster,
  instructor,
  leaderboard,
  myRank,
}: StudentClassViewProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>("stream");

  return (
    <>
      <DashboardHeader title={className} description="Class activity, assignments, and classmates" />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6 flex flex-col items-center">
        <ClassTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "stream" && (
          <StreamTab
            classId={classId}
            initialPosts={initialPosts}
            isInstructor={false}
            currentUserId={currentUserId}
            roster={roster}
            instructor={instructor}
          />
        )}
        {activeTab === "classwork" && <StudentClassworkTab assignments={assignments} />}
        {activeTab === "people" && <PeopleTab instructor={instructor} roster={roster} />}
        {activeTab === "leaderboard" && <ClassLeaderboardTab leaderboard={leaderboard} myRank={myRank} />}
      </main>
    </>
  );
}

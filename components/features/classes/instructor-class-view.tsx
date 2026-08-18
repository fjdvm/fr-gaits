"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { ClassTabs, type ClassTab } from "./class-tabs";
import { StreamTab } from "./stream-tab";
import { ClassworkTab } from "./classwork-tab";
import { PeopleTab } from "./people-tab";
import { ClassLeaderboardTab } from "./class-leaderboard-tab";
import type { StreamPostData, RosterStudent, RosterInstructor } from "./types";

interface ClassworkAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  testCaseCount: number;
  isSharedWithOtherClasses: boolean;
}

interface LeaderboardEntry {
  studentId: string;
  email: string;
  totalXp: number;
  level: number;
  rank: number;
}

interface InstructorClassViewProps {
  classId: string;
  className: string;
  joinCode: string;
  initialPosts: StreamPostData[];
  currentUserId: string;
  assignments: ClassworkAssignment[];
  roster: RosterStudent[];
  instructor: RosterInstructor;
  leaderboard: LeaderboardEntry[];
  myRank?: number;
}

export function InstructorClassView({
  classId,
  className,
  joinCode,
  initialPosts,
  currentUserId,
  assignments,
  roster,
  instructor,
  leaderboard,
  myRank,
}: InstructorClassViewProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>("stream");

  return (
    <>
      <DashboardHeader title={className} description={`Join code: ${joinCode}`} />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6 flex flex-col items-center">
        <ClassTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "stream" && (
          <StreamTab
            classId={classId}
            initialPosts={initialPosts}
            isInstructor
            currentUserId={currentUserId}
            roster={roster}
            instructor={instructor}
          />
        )}
        {activeTab === "classwork" && (
          <ClassworkTab classId={classId} className={className} assignments={assignments} />
        )}
        {activeTab === "people" && <PeopleTab instructor={instructor} roster={roster} />}
        {activeTab === "leaderboard" && <ClassLeaderboardTab leaderboard={leaderboard} myRank={myRank} />}
      </main>
    </>
  );
}

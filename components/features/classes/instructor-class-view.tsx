"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { ClassTabs, type ClassTab } from "./class-tabs";
import { StreamTab } from "./stream-tab";
import { ClassworkTab } from "./classwork-tab";
import { PeopleTab } from "./people-tab";
import type { StreamPostData, RosterStudent } from "./types";

interface ClassworkAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  testCaseCount: number;
  isSharedWithOtherClasses: boolean;
}

interface InstructorClassViewProps {
  classId: string;
  className: string;
  joinCode: string;
  initialPosts: StreamPostData[];
  currentUserId: string;
  assignments: ClassworkAssignment[];
  roster: RosterStudent[];
}

export function InstructorClassView({
  classId,
  className,
  joinCode,
  initialPosts,
  currentUserId,
  assignments,
  roster,
}: InstructorClassViewProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>("stream");

  return (
    <>
      <DashboardHeader title={className} description={`Join code: ${joinCode}`} />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6">
        <ClassTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "stream" && (
          <StreamTab classId={classId} initialPosts={initialPosts} isInstructor currentUserId={currentUserId} roster={roster} />
        )}
        {activeTab === "classwork" && (
          <ClassworkTab classId={classId} className={className} assignments={assignments} />
        )}
        {activeTab === "people" && <PeopleTab roster={roster} />}
      </main>
    </>
  );
}

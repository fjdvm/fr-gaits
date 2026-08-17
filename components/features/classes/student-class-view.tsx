"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/features/dashboard/dashboard-header";
import { ClassTabs, type ClassTab } from "./class-tabs";
import { StreamTab } from "./stream-tab";
import { StudentClassworkTab } from "./student-classwork-tab";
import { PeopleTab } from "./people-tab";
import type { StreamPostData, RosterStudent } from "./types";

interface StudentAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
}

interface StudentClassViewProps {
  classId: string;
  className: string;
  initialPosts: StreamPostData[];
  currentUserId: string;
  assignments: StudentAssignment[];
  roster: RosterStudent[];
}

export function StudentClassView({
  classId,
  className,
  initialPosts,
  currentUserId,
  assignments,
  roster,
}: StudentClassViewProps) {
  const [activeTab, setActiveTab] = useState<ClassTab>("stream");

  return (
    <>
      <DashboardHeader title={className} description="Class activity, assignments, and classmates" />
      <main className="flex-grow overflow-y-auto p-6 md:p-10 space-y-6">
        <ClassTabs activeTab={activeTab} onChange={setActiveTab} />

        {activeTab === "stream" && (
          <StreamTab classId={classId} initialPosts={initialPosts} isInstructor={false} currentUserId={currentUserId} roster={roster} />
        )}
        {activeTab === "classwork" && <StudentClassworkTab assignments={assignments} />}
        {activeTab === "people" && <PeopleTab roster={roster} />}
      </main>
    </>
  );
}

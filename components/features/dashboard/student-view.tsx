"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { joinClass } from "@/app/actions/join-class";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "./dashboard-header";

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
        title="Student Dashboard"
        description="Access your classes, complete assignments, and track progress."
      />
      <main className="p-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">My Classes</h2>
          <Card className="w-full md:w-auto shadow-sm">
            <CardContent className="p-4">
              <form onSubmit={handleJoinClass} className="flex gap-2">
                <Input
                  placeholder="CODE12"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-32 uppercase"
                  disabled={isJoining}
                  maxLength={6}
                />
                <Button type="submit" size="sm" disabled={isJoining}>
                  {isJoining ? "Joining..." : "Join"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <h3 className="font-semibold">Not enrolled in any classes</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Enter a 6-character join code provided by your instructor to enroll.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((cls) => (
              <Card key={cls.id} className="shadow-sm hover:shadow-md transition-all flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold">{cls.name}</CardTitle>
                  <CardDescription>Instructor: {cls.instructorEmail}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Assignments ({cls.assignments.length})
                    </h4>
                    {cls.assignments.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No assignments posted yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {cls.assignments.map((asm) => (
                          <Link
                            href={`/dashboard/student/assignments/${asm.id}`}
                            key={asm.id}
                            className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors text-xs cursor-pointer block min-w-0"
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="space-y-0.5 min-w-0 pr-2">
                                <p className="font-semibold truncate">{asm.title}</p>
                                <p className="text-[10px] text-muted-foreground">
                                  Due: {new Date(asm.dueDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="bg-muted text-[9px] px-1.5 py-0.5 rounded font-mono">
                                  {asm.language}
                                </span>
                                <span className="bg-muted text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase">
                                  {asm.status}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="p-4 border-t text-[10px] text-muted-foreground font-mono flex justify-between items-center">
                  <span>Enrolled: {new Date(cls.enrolledAt).toLocaleDateString()}</span>
                  <span>Code: {cls.joinCode}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

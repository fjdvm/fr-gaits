"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { approveInstructor } from "@/app/actions/approve-instructor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PendingInstructor {
  id: string;
  email: string;
  createdAt: Date | string;
}

interface AdminViewProps {
  initialPendingInstructors: PendingInstructor[];
}

export function AdminView({ initialPendingInstructors }: AdminViewProps) {
  const router = useRouter();
  const [instructors, setInstructors] = useState<PendingInstructor[]>(initialPendingInstructors);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch (err) {
      toast.error("Failed to log out");
      console.error(err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      const result = await approveInstructor(id);
      if (result.success) {
        toast.success("Instructor approved successfully!");
        setInstructors((prev) => prev.filter((inst) => inst.id !== id));
        router.refresh();
      } else {
        toast.error(result.error || "Failed to approve instructor");
      }
    } catch (err) {
      toast.error("An error occurred while approving the instructor");
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">GAIT</span>
            <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">Admin</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 disabled:opacity-50"
          >
            {isLoggingOut ? "Logging out..." : "Log out"}
          </button>
        </div>
      </header>

      <main className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Verify instructor registrations to grant them class management permissions.
          </p>
        </div>

        <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Pending Instructor Approvals</CardTitle>
            <CardDescription>
              Review and approve instructors before they can access their dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instructors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 text-zinc-300 mb-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">All caught up!</h3>
                <p className="text-sm text-zinc-500 mt-1">There are no pending instructor registrations.</p>
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Registered At</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors.map((inst) => (
                      <TableRow key={inst.id}>
                        <TableCell className="font-medium">{inst.email}</TableCell>
                        <TableCell>
                          {new Date(inst.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            disabled={processingId !== null}
                            onClick={() => handleApprove(inst.id)}
                          >
                            {processingId === inst.id ? "Approving..." : "Approve"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

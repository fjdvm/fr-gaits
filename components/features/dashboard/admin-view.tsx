"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveInstructor } from "@/app/actions/approve-instructor";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DashboardHeader } from "./dashboard-header";

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
  const [processingId, setProcessingId] = useState<string | null>(null);

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
    <>
      <DashboardHeader
        title="Admin Dashboard"
        description="Verify instructor registrations and manage platform settings."
      />
      <main className="p-6 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pending Instructor Approvals</CardTitle>
            <CardDescription>
              Review and approve instructors before they can access their dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instructors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <h3 className="font-semibold">All caught up!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  There are no pending instructor registrations.
                </p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
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
                          {new Date(inst.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
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
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveInstructor } from "@/app/actions/approve-instructor";
import { toast } from "sonner";
import { DashboardHeader } from "./dashboard-header";
import { Users, BookOpen, ClipboardCheck, ArrowRight, UserPlus, Check, Calendar } from "lucide-react";

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
      <main className="flex-grow overflow-y-auto p-6 md:p-10 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-8">
        {/* Bento Grid Metrics */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-surface-container rounded-xl text-primary">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center">
                +12%
              </span>
            </div>
            <h3 className="text-secondary text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">Total Users</h3>
            <p className="text-3xl font-extrabold text-on-surface relative z-10">14,205</p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-surface-container rounded-xl text-primary">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center">
                +5%
              </span>
            </div>
            <h3 className="text-secondary text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">Active Classes</h3>
            <p className="text-3xl font-extrabold text-on-surface relative z-10">342</p>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-surface-container rounded-xl text-primary">
                <ClipboardCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="bg-surface-container-high text-on-surface px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center">
                +28%
              </span>
            </div>
            <h3 className="text-secondary text-xs font-bold mb-1 relative z-10 uppercase tracking-wider">Total Submissions</h3>
            <p className="text-3xl font-extrabold text-on-surface relative z-10">89k</p>
          </div>
        </section>

        {/* Dynamic List & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-on-surface">Pending Instructor Approvals</h2>
            </div>

            {instructors.length === 0 ? (
              <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
                <Check className="h-12 w-12 text-secondary/30 mb-4" />
                <h3 className="font-bold text-lg">All caught up!</h3>
                <p className="text-xs text-secondary mt-1">There are no pending instructor registrations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {instructors.map((inst) => (
                  <div
                    key={inst.id}
                    className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 duration-200"
                  >
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                        <UserPlus className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">{inst.email}</h4>
                        <p className="text-xs text-secondary mt-1">
                          Registered: {new Date(inst.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={processingId !== null}
                      onClick={() => handleApprove(inst.id)}
                      className="bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white px-6 py-2.5 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                    >
                      {processingId === inst.id ? "Approving..." : "Approve"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white rounded-[24px] p-6 border border-surface-container shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-on-surface">Calendar</h3>
                <Calendar className="h-5 w-5 text-secondary" />
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-secondary mb-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                  <div key={d} className="font-semibold">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-on-surface font-semibold">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const isCurrent = day === new Date().getDate();
                  return (
                    <div
                      key={day}
                      className={`py-2 rounded-lg ${
                        isCurrent ? "bg-primary-container text-on-primary-container font-bold" : "hover:bg-surface-container-low"
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
        </div>
      </main>
    </>
  );
}

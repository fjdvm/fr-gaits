import Link from "next/link";
import { Calendar, ChevronRight, Clock, CalendarDays } from "lucide-react";

interface UpcomingAssignment {
  id: string;
  title: string;
  dueDate: string;
}

interface StudentScheduleSidebarProps {
  upcomingAssignments: UpcomingAssignment[];
}

export function StudentScheduleSidebar({ upcomingAssignments }: StudentScheduleSidebarProps) {
  return (
    <div className="w-full lg:w-80 shrink-0 flex flex-col gap-10 border-t lg:border-t-0 lg:border-l border-surface-container pt-10 lg:pt-0 lg:pl-10">
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

      <div className="flex flex-col">
        <h2 className="font-bold text-lg text-on-surface mb-6">Upcoming Deadlines</h2>
        <div className="flex flex-col gap-4">
          {upcomingAssignments.length === 0 ? (
            <p className="text-xs text-secondary italic">No upcoming deadlines.</p>
          ) : (
            upcomingAssignments.map((asm) => (
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
  );
}

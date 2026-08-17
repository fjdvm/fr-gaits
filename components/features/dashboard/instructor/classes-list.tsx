"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/app/actions/create-class";
import { toast } from "sonner";
import { School, Copy, Users, Calendar, Plus } from "lucide-react";

interface InstructorClass {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
  createdAt: string;
}

interface ClassesListProps {
  initialClasses: InstructorClass[];
}

export function ClassesList({ initialClasses }: ClassesListProps) {
  const router = useRouter();
  const [classes] = useState<InstructorClass[]>(initialClasses);
  const [className, setClassName] = useState("");
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || className.trim() === "") {
      toast.error("Please enter a class name");
      return;
    }

    setIsCreatingClass(true);
    try {
      const result = await createClass(className);
      if (result.success && result.class) {
        toast.success(`Class "${className}" created successfully!`);
        setClassName("");
        router.refresh();
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error(result.error || "Failed to create class");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsCreatingClass(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Join code copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Classes List</h2>
        <form onSubmit={handleCreateClass} className="flex gap-2 w-full sm:w-auto shrink-0 bg-white p-3 rounded-2xl border border-surface-container shadow-sm">
          <input
            placeholder="Class name (e.g. CS101)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={isCreatingClass}
            className="w-full sm:w-48 bg-surface-container-low rounded-xl px-4 py-2 text-sm border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow"
          />
          <button
            type="submit"
            disabled={isCreatingClass}
            className="px-5 py-2 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            {isCreatingClass ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      {classes.length === 0 ? (
        <div className="bg-white border border-surface-container rounded-[24px] p-12 text-center flex flex-col items-center">
          <School className="h-12 w-12 text-secondary/30 mb-4" />
          <h3 className="font-bold text-lg">No classes created</h3>
          <p className="text-xs text-secondary mt-1 max-w-sm">
            Use the form to create your first class and get a join code for students.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-surface-container flex flex-col relative overflow-hidden group hover:border-outline-variant transition-colors"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="bg-primary-container/10 p-3 rounded-xl">
                  <School className="h-6 w-6 text-primary" />
                </div>
                <span className="bg-surface-container-low text-secondary px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-surface-container">
                  Active
                </span>
              </div>
              <div className="mb-4 relative z-10">
                <h4 className="font-bold text-base text-on-surface mb-1 group-hover:text-primary transition-colors">{cls.name}</h4>
                <p className="text-[10px] text-secondary flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {new Date(cls.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="mt-auto pt-4 border-t border-surface-container flex justify-between items-center relative z-10">
                <div className="flex items-center gap-1.5 text-secondary text-xs">
                  <Users className="h-4 w-4" />
                  <span>{cls.studentCount} students</span>
                </div>
                <button
                  onClick={() => copyToClipboard(cls.joinCode)}
                  className="bg-surface-container-low hover:bg-surface-container text-on-surface px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-surface-container"
                >
                  Code: {cls.joinCode}
                  <Copy className="h-3 w-3 text-secondary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

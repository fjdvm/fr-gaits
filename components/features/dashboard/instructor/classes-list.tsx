"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClass } from "@/app/actions/create-class";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold tracking-tight">Classes List</h2>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <form onSubmit={handleCreateClass} className="flex gap-2">
              <Input
                placeholder="Class name (e.g. CS101)"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-48"
                disabled={isCreatingClass}
              />
              <Button type="submit" size="sm" disabled={isCreatingClass}>
                {isCreatingClass ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <h3 className="font-semibold">No classes created</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Use the form to create your first class and get a join code for students.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg font-bold">{cls.name}</CardTitle>
                <CardDescription>Created: {new Date(cls.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Students enrolled:</span>
                  <span className="font-semibold">{cls.studentCount}</span>
                </div>
                <div className="flex items-center justify-between bg-muted p-2 rounded text-xs font-mono">
                  <span>Code: <span className="font-bold tracking-wider">{cls.joinCode}</span></span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px]"
                    onClick={() => copyToClipboard(cls.joinCode)}
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

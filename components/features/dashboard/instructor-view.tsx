"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createClass } from "@/app/actions/create-class";
import { createAssignment } from "@/app/actions/create-assignment";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface InstructorClass {
  id: string;
  name: string;
  joinCode: string;
  studentCount: number;
  createdAt: string;
}

interface InstructorAssignment {
  id: string;
  title: string;
  language: string;
  dueDate: string;
  heartsCount: number;
  heartsRegenMinutes: number;
  classNames: string[];
  testCaseCount: number;
}

interface InstructorViewProps {
  initialClasses: InstructorClass[];
  initialAssignments: InstructorAssignment[];
}

interface TestCaseForm {
  input: string;
  expectedOutput: string;
  visible: boolean;
}

export function InstructorView({ initialClasses, initialAssignments }: InstructorViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"classes" | "assignments">("classes");

  // State for Classes
  const [classes, setClasses] = useState<InstructorClass[]>(initialClasses);
  const [className, setClassName] = useState("");
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // State for Assignments
  const [assignments, setAssignments] = useState<InstructorAssignment[]>(initialAssignments);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false);

  // Assignment Form State
  const [asmTitle, setAsmTitle] = useState("");
  const [asmInstructions, setAsmInstructions] = useState("");
  const [asmLanguage, setAsmLanguage] = useState("Python");
  const [asmDueDate, setAsmDueDate] = useState("");
  const [asmHeartsCount, setAsmHeartsCount] = useState(5);
  const [asmHeartsRegen, setAsmHeartsRegen] = useState(30);
  const [asmSelectedClasses, setAsmSelectedClasses] = useState<string[]>([]);
  const [asmTestCases, setAsmTestCases] = useState<TestCaseForm[]>([
    { input: "", expectedOutput: "", visible: true },
  ]);

  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asmTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!asmInstructions.trim()) {
      toast.error("Please enter instructions");
      return;
    }
    if (!asmDueDate) {
      toast.error("Please set a due date");
      return;
    }
    if (asmSelectedClasses.length === 0) {
      toast.error("Please assign this to at least one class");
      return;
    }

    // Validate test cases
    const invalidTestCase = asmTestCases.some(tc => !tc.expectedOutput.trim());
    if (invalidTestCase) {
      toast.error("All test cases must have an expected output");
      return;
    }

    setIsCreatingAssignment(true);
    try {
      const result = await createAssignment({
        title: asmTitle,
        instructions: asmInstructions,
        language: asmLanguage,
        dueDate: asmDueDate,
        heartsCount: asmHeartsCount,
        heartsRegenMinutes: asmHeartsRegen,
        classIds: asmSelectedClasses,
        testCases: asmTestCases,
      });

      if (result.success) {
        toast.success("Assignment created successfully!");
        setShowCreateAssignment(false);
        // Reset form
        setAsmTitle("");
        setAsmInstructions("");
        setAsmLanguage("Python");
        setAsmDueDate("");
        setAsmHeartsCount(5);
        setAsmHeartsRegen(30);
        setAsmSelectedClasses([]);
        setAsmTestCases([{ input: "", expectedOutput: "", visible: true }]);
        
        router.refresh();
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error(result.error || "Failed to create assignment");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsCreatingAssignment(false);
    }
  };

  const handleClassCheckboxChange = (classId: string) => {
    setAsmSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleAddTestCase = () => {
    setAsmTestCases((prev) => [
      ...prev,
      { input: "", expectedOutput: "", visible: true },
    ]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (asmTestCases.length === 1) {
      toast.error("At least one test case is required");
      return;
    }
    setAsmTestCases((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTestCaseChange = (index: number, field: keyof TestCaseForm, value: any) => {
    setAsmTestCases((prev) =>
      prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc))
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Join code copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">GAIT</span>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Instructor</span>
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

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Instructor Panel</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Create and manage classes, set coding assignments, and configure AI tutor parameters.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "classes"
                ? "border-primary text-zinc-950 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            Classes ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab("assignments")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "assignments"
                ? "border-primary text-zinc-950 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            Assignments ({assignments.length})
          </button>
        </div>

        {activeTab === "classes" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight">Classes List</h2>
              
              <Card className="shadow-sm border border-zinc-200 dark:border-zinc-800">
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
              <Card className="border border-zinc-200 dark:border-zinc-800">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 text-zinc-300 mb-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.33l-7.5-5-7.5 5V21m-2.25 0h20.25"
                    />
                  </svg>
                  <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">No classes created</h3>
                  <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                    Use the form on the right to create your first class and get a join code for students.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((cls) => (
                  <Card key={cls.id} className="shadow-sm hover:shadow-md transition-shadow border border-zinc-200 dark:border-zinc-800">
                    <CardHeader>
                      <CardTitle className="text-lg font-bold">{cls.name}</CardTitle>
                      <CardDescription>Created: {new Date(cls.createdAt).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">Students enrolled:</span>
                        <span className="font-semibold">{cls.studentCount}</span>
                      </div>
                      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded text-xs font-mono">
                        <span>Code: <span className="font-bold tracking-wider">{cls.joinCode}</span></span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] text-zinc-500"
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
        )}

        {activeTab === "assignments" && (
          <div className="space-y-6">
            {!showCreateAssignment ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold tracking-tight">Assignments List</h2>
                  <Button onClick={() => setShowCreateAssignment(true)}>
                    Create Assignment
                  </Button>
                </div>

                {assignments.length === 0 ? (
                  <Card className="border border-zinc-200 dark:border-zinc-800">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-12 h-12 text-zinc-300 mb-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                      <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">No assignments created</h3>
                      <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                        Create coding assignments with custom test cases for your classes.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2">
                    {assignments.map((asm) => (
                      <Card key={asm.id} className="shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start gap-2">
                            <CardTitle className="text-lg font-bold">{asm.title}</CardTitle>
                            <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold">
                              {asm.language}
                            </span>
                          </div>
                          <CardDescription>
                            Due: {new Date(asm.dueDate).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Assigned Classes:</span>
                            <span className="font-semibold">{asm.classNames.join(", ") || "None"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Test Cases:</span>
                            <span className="font-semibold">{asm.testCaseCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">AI Tutor Config:</span>
                            <span className="font-semibold">
                              {asm.heartsCount} Hearts • {asm.heartsRegenMinutes}m Cooldown
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Card className="border border-zinc-200 dark:border-zinc-800 max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Create Assignment</CardTitle>
                  <CardDescription>
                    Configure instructions, programming language, classes, and test cases.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleCreateAssignment}>
                  <CardContent className="space-y-6">
                    {/* General info */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Title</label>
                        <Input
                          placeholder="Assignment Title (e.g. Invert String)"
                          value={asmTitle}
                          onChange={(e) => setAsmTitle(e.target.value)}
                          required
                          disabled={isCreatingAssignment}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold">Instructions</label>
                        <textarea
                          placeholder="Describe the programming problem in Markdown or text..."
                          value={asmInstructions}
                          onChange={(e) => setAsmInstructions(e.target.value)}
                          required
                          disabled={isCreatingAssignment}
                          className="flex min-h-[120px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:focus-visible:ring-zinc-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Language</label>
                          <select
                            value={asmLanguage}
                            onChange={(e) => setAsmLanguage(e.target.value)}
                            disabled={isCreatingAssignment}
                            className="flex h-9 w-full rounded-md border border-zinc-200 bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-zinc-950 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-300"
                          >
                            <option value="Python">Python</option>
                            <option value="C">C</option>
                            <option value="JavaScript">JavaScript</option>
                            <option value="C#">C#</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Due Date</label>
                          <Input
                            type="datetime-local"
                            value={asmDueDate}
                            onChange={(e) => setAsmDueDate(e.target.value)}
                            required
                            disabled={isCreatingAssignment}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Hearts Limit</label>
                          <Input
                            type="number"
                            min={1}
                            value={asmHeartsCount}
                            onChange={(e) => setAsmHeartsCount(parseInt(e.target.value) || 5)}
                            required
                            disabled={isCreatingAssignment}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-semibold">Hearts Cooldown (minutes)</label>
                          <Input
                            type="number"
                            min={1}
                            value={asmHeartsRegen}
                            onChange={(e) => setAsmHeartsRegen(parseInt(e.target.value) || 30)}
                            required
                            disabled={isCreatingAssignment}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Classes Checkbox */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold block">Assign to Classes</label>
                      {classes.length === 0 ? (
                        <p className="text-xs text-rose-500">You must create a class first!</p>
                      ) : (
                        <div className="flex flex-wrap gap-4 pt-1">
                          {classes.map((cls) => (
                            <label key={cls.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={asmSelectedClasses.includes(cls.id)}
                                onChange={() => handleClassCheckboxChange(cls.id)}
                                disabled={isCreatingAssignment}
                                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                              />
                              {cls.name}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Test Cases */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-semibold">Test Cases</label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAddTestCase}
                          disabled={isCreatingAssignment}
                        >
                          Add Test Case
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {asmTestCases.map((tc, index) => (
                          <div key={index} className="grid grid-cols-12 gap-3 items-end bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="col-span-4 space-y-1">
                              <label className="text-[10px] text-zinc-500 font-semibold block">Input</label>
                              <Input
                                placeholder="stdin (optional)"
                                value={tc.input}
                                onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                                disabled={isCreatingAssignment}
                              />
                            </div>
                            <div className="col-span-5 space-y-1">
                              <label className="text-[10px] text-zinc-500 font-semibold block">Expected Output</label>
                              <Input
                                placeholder="stdout"
                                value={tc.expectedOutput}
                                onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
                                required
                                disabled={isCreatingAssignment}
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-center h-9">
                              <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={tc.visible}
                                  onChange={(e) => handleTestCaseChange(index, "visible", e.target.checked)}
                                  disabled={isCreatingAssignment}
                                  className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Visible
                              </label>
                            </div>
                            <div className="col-span-1 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveTestCase(index)}
                                disabled={isCreatingAssignment}
                                className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                              >
                                &times;
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-end gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowCreateAssignment(false)}
                      disabled={isCreatingAssignment}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isCreatingAssignment}>
                      {isCreatingAssignment ? "Creating..." : "Save Assignment"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

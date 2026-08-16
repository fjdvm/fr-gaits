"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/app/actions/create-assignment";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface TestCaseForm {
  input: string;
  expectedOutput: string;
  visible: boolean;
}

interface ClassOption {
  id: string;
  name: string;
}

interface CreateAssignmentFormProps {
  classes: ClassOption[];
  onCancel: () => void;
}

export function CreateAssignmentForm({ classes, onCancel }: CreateAssignmentFormProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [language, setLanguage] = useState("Python");
  const [dueDate, setDueDate] = useState("");
  const [heartsCount, setHeartsCount] = useState(5);
  const [heartsRegen, setHeartsRegen] = useState(30);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [testCases, setTestCases] = useState<TestCaseForm[]>([
    { input: "", expectedOutput: "", visible: true },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Please enter a title"); return; }
    if (!instructions.trim()) { toast.error("Please enter instructions"); return; }
    if (!dueDate) { toast.error("Please set a due date"); return; }
    if (selectedClasses.length === 0) { toast.error("Please assign to at least one class"); return; }
    if (testCases.some(tc => !tc.expectedOutput.trim())) {
      toast.error("All test cases must have an expected output"); return;
    }

    setIsCreating(true);
    try {
      const result = await createAssignment({
        title, instructions, language, dueDate,
        heartsCount, heartsRegenMinutes: heartsRegen,
        classIds: selectedClasses, testCases,
      });
      if (result.success) {
        toast.success("Assignment created successfully!");
        onCancel();
        router.refresh();
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error(result.error || "Failed to create assignment");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]
    );
  };

  const addTestCase = () => setTestCases((prev) => [...prev, { input: "", expectedOutput: "", visible: true }]);
  const removeTestCase = (index: number) => {
    if (testCases.length === 1) { toast.error("At least one test case is required"); return; }
    setTestCases((prev) => prev.filter((_, i) => i !== index));
  };
  const updateTestCase = (index: number, field: keyof TestCaseForm, value: string | boolean) => {
    setTestCases((prev) => prev.map((tc, i) => (i === index ? { ...tc, [field]: value } : tc)));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create Assignment</CardTitle>
        <CardDescription>Configure instructions, programming language, classes, and test cases.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Title</label>
              <Input placeholder="Assignment Title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isCreating} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Instructions</label>
              <textarea placeholder="Describe the problem..." value={instructions} onChange={(e) => setInstructions(e.target.value)} required disabled={isCreating}
                className="flex min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} disabled={isCreating}
                  className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  <option value="Python">Python</option>
                  <option value="C">C</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="C#">C#</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Due Date</label>
                <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required disabled={isCreating} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Hearts Limit</label>
                <Input type="number" min={1} value={heartsCount} onChange={(e) => setHeartsCount(parseInt(e.target.value) || 5)} required disabled={isCreating} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Hearts Cooldown (min)</label>
                <Input type="number" min={1} value={heartsRegen} onChange={(e) => setHeartsRegen(parseInt(e.target.value) || 30)} required disabled={isCreating} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold block">Assign to Classes</label>
            {classes.length === 0 ? (
              <p className="text-xs text-destructive">You must create a class first!</p>
            ) : (
              <div className="flex flex-wrap gap-4 pt-1">
                {classes.map((cls) => (
                  <label key={cls.id} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                    <input type="checkbox" checked={selectedClasses.includes(cls.id)} onChange={() => handleClassToggle(cls.id)} disabled={isCreating}
                      className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
                    {cls.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold">Test Cases</label>
              <Button type="button" variant="outline" size="sm" onClick={addTestCase} disabled={isCreating}>Add Test Case</Button>
            </div>
            <div className="space-y-3">
              {testCases.map((tc, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-end bg-muted/50 p-3 rounded-lg border">
                  <div className="col-span-4 space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold block">Input</label>
                    <Input placeholder="stdin (optional)" value={tc.input} onChange={(e) => updateTestCase(index, "input", e.target.value)} disabled={isCreating} />
                  </div>
                  <div className="col-span-5 space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold block">Expected Output</label>
                    <Input placeholder="stdout" value={tc.expectedOutput} onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)} required disabled={isCreating} />
                  </div>
                  <div className="col-span-2 flex items-center justify-center h-9">
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <input type="checkbox" checked={tc.visible} onChange={(e) => updateTestCase(index, "visible", e.target.checked)} disabled={isCreating}
                        className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" />
                      Visible
                    </label>
                  </div>
                  <div className="col-span-1 text-right">
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTestCase(index)} disabled={isCreating} className="text-destructive hover:text-destructive">&times;</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isCreating}>Cancel</Button>
          <Button type="submit" disabled={isCreating}>{isCreating ? "Creating..." : "Save Assignment"}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

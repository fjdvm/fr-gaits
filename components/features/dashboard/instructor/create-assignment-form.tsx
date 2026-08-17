"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/app/actions/create-assignment";
import { toast } from "sonner";
import { Calendar, Heart, Shield, Plus, Trash2 } from "lucide-react";

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
    <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-surface-container p-6 shadow-sm flex flex-col">
      <div className="mb-6">
        <h3 className="font-bold text-lg text-on-surface">Create Assignment</h3>
        <p className="text-xs text-secondary mt-1">Configure instructions, programming language, classes, and test cases.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface pl-1">Title</label>
            <input
              placeholder="Assignment Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isCreating}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface pl-1">Instructions</label>
            <textarea
              placeholder="Describe the problem..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              disabled={isCreating}
              className="w-full min-h-[120px] bg-surface-container-low rounded-xl px-4 py-3 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow resize-y"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface pl-1">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isCreating}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container font-semibold transition-shadow"
              >
                <option value="Python">Python</option>
                <option value="C">C</option>
                <option value="JavaScript">JavaScript</option>
                <option value="C#">C#</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface pl-1">Due Date</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                disabled={isCreating}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface pl-1">Hearts Limit</label>
              <input
                type="number"
                min={1}
                value={heartsCount}
                onChange={(e) => setHeartsCount(parseInt(e.target.value) || 5)}
                required
                disabled={isCreating}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface pl-1">Hearts Cooldown (min)</label>
              <input
                type="number"
                min={1}
                value={heartsRegen}
                onChange={(e) => setHeartsRegen(parseInt(e.target.value) || 30)}
                required
                disabled={isCreating}
                className="w-full bg-surface-container-low rounded-xl px-4 py-2 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container transition-shadow"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-on-surface pl-1 block">Assign to Classes</label>
          {classes.length === 0 ? (
            <p className="text-xs text-destructive pl-1">You must create a class first!</p>
          ) : (
            <div className="flex flex-wrap gap-4 pt-1 pl-1">
              {classes.map((cls) => (
                <label key={cls.id} className="flex items-center gap-2 text-sm font-semibold cursor-pointer text-on-surface">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(cls.id)}
                    onChange={() => handleClassToggle(cls.id)}
                    disabled={isCreating}
                    className="rounded border-surface-container text-primary focus:ring-primary-container"
                  />
                  {cls.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center pl-1">
            <label className="text-xs font-bold text-on-surface">Test Cases</label>
            <button
              type="button"
              onClick={addTestCase}
              disabled={isCreating}
              className="px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add Case
            </button>
          </div>
          <div className="space-y-3">
            {testCases.map((tc, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-end bg-surface-container-low p-4 rounded-2xl border border-surface-container">
                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block pl-1">Input</label>
                  <input
                    placeholder="stdin (optional)"
                    value={tc.input}
                    onChange={(e) => updateTestCase(index, "input", e.target.value)}
                    disabled={isCreating}
                    className="w-full bg-white rounded-lg px-3 py-1.5 text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="col-span-5 space-y-1">
                  <label className="text-[10px] text-secondary font-bold uppercase tracking-wider block pl-1">Expected Output</label>
                  <input
                    placeholder="stdout"
                    value={tc.expectedOutput}
                    onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                    required
                    disabled={isCreating}
                    className="w-full bg-white rounded-lg px-3 py-1.5 text-xs text-on-surface border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between h-8 mt-auto pl-2">
                  <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer select-none text-on-surface">
                    <input
                      type="checkbox"
                      checked={tc.visible}
                      onChange={(e) => updateTestCase(index, "visible", e.target.checked)}
                      disabled={isCreating}
                      className="rounded border-surface-container text-primary focus:ring-primary-container"
                    />
                    Vis
                  </label>
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    disabled={isCreating}
                    className="text-secondary hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-surface-container">
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="px-6 py-2.5 bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2.5 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            {isCreating ? "Creating..." : "Save Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}

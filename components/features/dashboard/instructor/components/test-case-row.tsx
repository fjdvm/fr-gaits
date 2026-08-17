import { Trash2 } from "lucide-react";

interface TestCaseForm {
  input: string;
  expectedOutput: string;
  visible: boolean;
}

interface TestCaseRowProps {
  index: number;
  tc: TestCaseForm;
  isCreating: boolean;
  updateTestCase: (index: number, field: keyof TestCaseForm, value: string | boolean) => void;
  removeTestCase: (index: number) => void;
}

export function TestCaseRow({
  index,
  tc,
  isCreating,
  updateTestCase,
  removeTestCase,
}: TestCaseRowProps) {
  return (
    <div className="grid grid-cols-12 gap-3 items-end bg-surface-container-low p-4 rounded-2xl border border-surface-container">
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
  );
}

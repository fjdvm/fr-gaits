interface AssignmentFormFieldsProps {
  title: string;
  setTitle: (val: string) => void;
  instructions: string;
  setInstructions: (val: string) => void;
  language: string;
  setLanguage: (val: string) => void;
  dueDate: string;
  setDueDate: (val: string) => void;
  heartsCount: number;
  setHeartsCount: (val: number) => void;
  heartsRegen: number;
  setHeartsRegen: (val: number) => void;
  isCreating: boolean;
}

export function AssignmentFormFields({
  title,
  setTitle,
  instructions,
  setInstructions,
  language,
  setLanguage,
  dueDate,
  setDueDate,
  heartsCount,
  setHeartsCount,
  heartsRegen,
  setHeartsRegen,
  isCreating,
}: AssignmentFormFieldsProps) {
  return (
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
  );
}

"use client";

interface ClassOption {
  id: string;
  name: string;
}

interface ClassFilterProps {
  classes: ClassOption[];
  selectedClassId: string;
  onChange: (classId: string) => void;
}

export function ClassFilter({ classes, selectedClassId, onChange }: ClassFilterProps) {
  return (
    <select
      value={selectedClassId}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-container-low border border-surface-container rounded-xl px-4 py-2 text-sm font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container cursor-pointer"
      aria-label="Filter submissions by class"
    >
      <option value="all">All classes</option>
      {classes.map((cls) => (
        <option key={cls.id} value={cls.id}>
          {cls.name}
        </option>
      ))}
    </select>
  );
}

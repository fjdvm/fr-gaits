"use client";

import { useState } from "react";
import { toast } from "sonner";
import { saveAdminApiKey, removeAdminApiKey } from "@/app/actions/admin-api-keys";
import { Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";

interface ApiKeyEntry {
  key: string;
  label: string;
  hasValue: boolean;
  updatedAt: string | null;
}

interface ApiKeyFormRowProps {
  entry: ApiKeyEntry;
  onUpdate: () => void;
}

export function ApiKeyFormRow({ entry, onUpdate }: ApiKeyFormRowProps) {
  const [value, setValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSave() {
    if (!value.trim()) {
      toast.error("API key cannot be empty");
      return;
    }
    setIsSaving(true);
    const result = await saveAdminApiKey(entry.key, value);
    setIsSaving(false);

    if (result.success) {
      toast.success(`${entry.label} saved successfully`);
      setValue("");
      setIsEditing(false);
      onUpdate();
    } else {
      toast.error(result.error || "Failed to save");
    }
  }

  async function handleRemove() {
    setIsSaving(true);
    const result = await removeAdminApiKey(entry.key);
    setIsSaving(false);

    if (result.success) {
      toast.success(`${entry.label} removed`);
      onUpdate();
    } else {
      toast.error(result.error || "Failed to remove");
    }
  }

  return (
    <div className="flex flex-col gap-3 border-b border-surface-container pb-5 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-bold text-on-surface block pl-1">{entry.label}</label>
          <span className="text-[10px] text-secondary font-mono block pl-1 mt-0.5">{entry.key}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${entry.hasValue ? "bg-primary-container text-on-primary-container" : "bg-surface-container text-secondary"}`}>
          {entry.hasValue ? "Configured ✓" : "Not Set"}
        </span>
      </div>

      {isEditing ? (
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter API key..."
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-container font-mono transition-shadow pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2.5 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setValue("");
            }}
            className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-secondary rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <KeyRound className="h-3.5 w-3.5" />
            {entry.hasValue ? "Update" : "Set Key"}
          </button>
          {entry.hasValue && (
            <button
              onClick={handleRemove}
              disabled={isSaving}
              className="px-4 py-2 bg-transparent hover:bg-destructive/10 text-destructive rounded-xl font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      )}

      {entry.updatedAt && (
        <p className="text-[10px] text-secondary pl-1">
          Last updated: {new Date(entry.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

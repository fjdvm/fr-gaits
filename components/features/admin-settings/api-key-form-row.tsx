"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { saveAdminApiKey, removeAdminApiKey } from "@/app/actions/admin-api-keys";

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
    <div className="flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div>
          <Label className="font-medium">{entry.label}</Label>
          <p className="text-xs text-muted-foreground font-mono">{entry.key}</p>
        </div>
        <Badge variant={entry.hasValue ? "default" : "secondary"}>
          {entry.hasValue ? "Configured ✓" : "Not Set"}
        </Badge>
      </div>

      {isEditing ? (
        <div className="flex gap-2 items-end">
          <Input
            type="password"
            placeholder="Enter API key..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 font-mono text-sm"
          />
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setValue("");
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            {entry.hasValue ? "Update" : "Set Key"}
          </Button>
          {entry.hasValue && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              disabled={isSaving}
            >
              Remove
            </Button>
          )}
        </div>
      )}

      {entry.updatedAt && (
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date(entry.updatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

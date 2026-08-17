"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { getAdminApiKeyStatus } from "@/app/actions/admin-api-keys";
import { ApiKeyFormRow } from "./api-key-form-row";
import { Key } from "lucide-react";

interface ApiKeyEntry {
  key: string;
  label: string;
  hasValue: boolean;
  updatedAt: string | null;
}

interface ApiKeyManagementCardProps {
  initialKeys: ApiKeyEntry[];
}

export function ApiKeyManagementCard({ initialKeys }: ApiKeyManagementCardProps) {
  const [keys, setKeys] = useState<ApiKeyEntry[]>(initialKeys);
  const [, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(async () => {
      const updated = await getAdminApiKeyStatus();
      setKeys(updated);
    });
  }, [startTransition]);

  useEffect(() => {
    setKeys(initialKeys);
  }, [initialKeys]);

  return (
    <div className="bg-white p-6 rounded-[24px] border border-surface-container shadow-sm flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface">
          <Key className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-bold text-base text-on-surface">AI Provider API Keys</h3>
          <p className="text-xs text-secondary">Configure platform-wide provider keys.</p>
        </div>
      </div>
      <div className="space-y-5 flex-1">
        {keys.map((entry) => (
          <ApiKeyFormRow key={entry.key} entry={entry} onUpdate={refresh} />
        ))}
      </div>
    </div>
  );
}

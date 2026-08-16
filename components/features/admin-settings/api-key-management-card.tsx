"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminApiKeyStatus } from "@/app/actions/admin-api-keys";
import { ApiKeyFormRow } from "./api-key-form-row";

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
    <Card>
      <CardHeader>
        <CardTitle>AI Provider API Keys</CardTitle>
        <CardDescription>
          Set platform-wide API keys for AI providers. These are used when no
          instructor-level key is configured for a class.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {keys.map((entry) => (
          <ApiKeyFormRow key={entry.key} entry={entry} onUpdate={refresh} />
        ))}
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { HeartsStateData } from "./types";

interface UseHeartsTimerProps {
  initialHearts: HeartsStateData;
  maxHearts: number;
  regenMinutes: number;
}

export function useHeartsTimer({ initialHearts, maxHearts, regenMinutes }: UseHeartsTimerProps) {
  const router = useRouter();
  const [hearts, setHearts] = useState(initialHearts);
  const [timeToRegen, setTimeToRegen] = useState("");

  useEffect(() => {
    if (hearts.currentCount >= maxHearts) {
      setTimeToRegen("");
      return;
    }

    const interval = setInterval(() => {
      const cooldownMs = regenMinutes * 60 * 1000;
      const nextRegen = new Date(hearts.lastRegenAt).getTime() + cooldownMs;
      const remainingMs = nextRegen - Date.now();

      if (remainingMs <= 0) {
        setHearts((prev) => ({
          ...prev,
          currentCount: Math.min(maxHearts, prev.currentCount + 1),
          lastRegenAt: new Date().toISOString(),
        }));
        toast.success("💚 Heart regenerated!");
        router.refresh();
      } else {
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setTimeToRegen(`${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hearts, maxHearts, regenMinutes, router]);

  const spendHeart = useCallback((isFullHearts: boolean) => {
    setHearts((prev) => ({
      ...prev,
      currentCount: Math.max(0, prev.currentCount - 1),
      totalSpent: prev.totalSpent + 1,
      lastRegenAt: isFullHearts ? new Date().toISOString() : prev.lastRegenAt,
    }));
  }, []);

  return { hearts, timeToRegen, spendHeart };
}

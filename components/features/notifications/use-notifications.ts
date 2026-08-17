"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "@/app/actions/notifications";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function loadInitial() {
      const result = await getNotifications();
      if (cancelled) return;
      if (result.success) {
        setNotifications(result.notifications as unknown as NotificationItem[]);
      }
      setIsLoading(false);
    }

    async function subscribeToRealtime() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user) return;

      channel = supabase
        .channel(`notifications:${user.id}:${Math.random().toString(36).slice(2)}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          (payload) => {
            const row = payload.new as Record<string, unknown>;
            setNotifications((prev) => [
              {
                id: row.id as string,
                type: row.type as string,
                title: row.title as string,
                message: row.message as string,
                link: (row.link as string) ?? null,
                read: row.read as boolean,
                createdAt: row.created_at as string,
              },
              ...prev,
            ]);
          }
        );

      if (cancelled) return;
      channel.subscribe();
    }

    loadInitial();
    subscribeToRealtime();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await markNotificationRead(id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead();
  }, []);

  return { notifications, unreadCount, isLoading, markRead, markAllRead };
}

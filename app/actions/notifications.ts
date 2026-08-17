"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getNotifications() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return { success: true, notifications };
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error", notifications: [] };
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.notification.update({
      where: { id: notificationId, userId: user.id },
      data: { read: true },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to mark notification read:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function markAllNotificationsRead() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return { success: true };
  } catch (err) {
    console.error("Failed to mark all notifications read:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

"use client";

import Link from "next/link";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, type NotificationItem } from "./use-notifications";

export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markRead, markAllRead } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger className="size-7 rounded-[min(var(--radius-md),12px)] text-secondary hover:text-on-surface transition-colors relative cursor-pointer inline-flex items-center justify-center shrink-0">
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-destructive rounded-full border border-white text-[9px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 gap-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-surface-container">
          <h4 className="text-xs font-bold text-on-surface">Notifications</h4>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors cursor-pointer flex items-center gap-1"
            >
              <CheckCheck className="h-3 w-3" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-[11px] text-secondary text-center py-8">Loading...</p>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <BellOff className="h-8 w-8 text-secondary/30 mx-auto mb-2" />
              <p className="text-[11px] text-secondary font-semibold">No notifications yet.</p>
            </div>
          ) : (
            notifications.map((n) => <NotificationRow key={n.id} notification={n} onRead={markRead} />)
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NotificationRow({ notification, onRead }: { notification: NotificationItem; onRead: (id: string) => void }) {
  const body = (
    <div
      onClick={() => !notification.read && onRead(notification.id)}
      className={`px-4 py-3 border-b border-surface-container last:border-b-0 cursor-pointer transition-colors ${
        notification.read ? "bg-white" : "bg-primary-container/10 hover:bg-primary-container/20"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold text-on-surface leading-snug">{notification.title}</p>
        {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1" />}
      </div>
      <p className="text-[10px] text-secondary mt-0.5 leading-snug">{notification.message}</p>
      <p className="text-[9px] text-secondary/60 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
    </div>
  );

  return notification.link ? <Link href={notification.link}>{body}</Link> : body;
}

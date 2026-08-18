"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StreamPostData } from "./types";

export function useClassStreamRealtime(
  classId: string,
  onPostInserted: (post: StreamPostData) => void,
  onPostDeleted: (postId: string) => void
) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`class-stream:${classId}:${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts", filter: `class_id=eq.${classId}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          onPostInserted({
            id: row.id as string,
            type: row.type as string,
            body: (row.body as string) ?? null,
            linkUrl: (row.link_url as string) ?? null,
            assignmentId: (row.assignment_id as string) ?? null,
            authorId: row.author_id as string,
            createdAt: row.created_at as string,
            classComments: [],
            privateThread: [],
            privateThreadsByStudent: {},
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "posts", filter: `class_id=eq.${classId}` },
        (payload) => {
          const row = payload.old as Record<string, unknown>;
          onPostDeleted(row.id as string);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [classId, onPostInserted, onPostDeleted]);
}

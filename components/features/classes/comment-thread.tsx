"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createComment, deleteComment } from "@/app/actions/comments";
import { CommentFeed } from "./comment-feed";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommentData, RosterStudent, RosterInstructor, StreamPostData } from "./types";

function toCommentData(comment: { id: string; authorId: string; body: string; createdAt: Date }): CommentData {
  return { id: comment.id, authorId: comment.authorId, body: comment.body, createdAt: comment.createdAt.toISOString() };
}

interface Thread {
  key: string;
  label: string;
  visibility: "class" | "private";
  targetStudentId?: string;
}

interface CommentThreadProps {
  post: StreamPostData;
  isInstructor: boolean;
  currentUserId?: string;
  roster?: RosterStudent[];
  instructor?: RosterInstructor;
}

export function CommentThread({ post, isInstructor, currentUserId, roster, instructor }: CommentThreadProps) {
  const [classComments, setClassComments] = useState(post.classComments);
  const [privateThread, setPrivateThread] = useState(post.privateThread ?? []);
  const [privateThreadsByStudent, setPrivateThreadsByStudent] = useState(post.privateThreadsByStudent ?? {});

  const threads: Thread[] = useMemo(() => {
    if (!isInstructor) {
      return [
        { key: "class", label: "Class comment", visibility: "class" },
        { key: "private", label: "Private to instructor", visibility: "private" },
      ];
    }
    const studentThreads = (roster ?? []).map((s) => ({
      key: `private:${s.id}`,
      label: `Private · ${s.email}`,
      visibility: "private" as const,
      targetStudentId: s.id,
    }));
    return [{ key: "class", label: "Class comment", visibility: "class" as const }, ...studentThreads];
  }, [isInstructor, roster]);

  const [selectedKey, setSelectedKey] = useState(threads[0]?.key ?? "class");
  const selected = threads.find((t) => t.key === selectedKey) ?? threads[0];

  const activeComments = !selected
    ? []
    : selected.visibility === "class"
      ? classComments
      : isInstructor
        ? privateThreadsByStudent[selected.targetStudentId!] ?? []
        : privateThread;

  const handleDelete = async (commentId: string, remove: () => void) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      remove();
    } else {
      toast.error(result.error || "Failed to delete comment");
    }
  };

  const handleDeleteActive = (commentId: string) => {
    if (!selected) return;
    if (selected.visibility === "class") {
      handleDelete(commentId, () => setClassComments((prev) => prev.filter((c) => c.id !== commentId)));
    } else if (isInstructor) {
      const studentId = selected.targetStudentId!;
      handleDelete(commentId, () =>
        setPrivateThreadsByStudent((prev) => ({
          ...prev,
          [studentId]: (prev[studentId] ?? []).filter((c) => c.id !== commentId),
        }))
      );
    } else {
      handleDelete(commentId, () => setPrivateThread((prev) => prev.filter((c) => c.id !== commentId)));
    }
  };

  const handleSubmit = async (body: string) => {
    if (!selected) return;
    const result = await createComment(post.id, body, selected.visibility, selected.targetStudentId);
    if (!result.success || !result.comment) {
      toast.error(result.error || "Failed to post comment");
      return;
    }
    const mapped = toCommentData(result.comment);
    if (selected.visibility === "class") {
      setClassComments((prev) => [...prev, mapped]);
    } else if (isInstructor) {
      const studentId = selected.targetStudentId!;
      setPrivateThreadsByStudent((prev) => ({ ...prev, [studentId]: [...(prev[studentId] ?? []), mapped] }));
    } else {
      setPrivateThread((prev) => [...prev, mapped]);
    }
  };

  return (
    <div>
      <Select value={selectedKey} onValueChange={(value) => value && setSelectedKey(value)}>
        <SelectTrigger className="w-full mb-3">
          <SelectValue placeholder="Choose audience" />
        </SelectTrigger>
        <SelectContent>
          {threads.map((t) => (
            <SelectItem key={t.key} value={t.key}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <CommentFeed
        comments={activeComments}
        currentUserId={currentUserId}
        isInstructor={isInstructor}
        roster={roster}
        instructor={instructor}
        onDelete={handleDeleteActive}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createComment, deleteComment } from "@/app/actions/comments";
import type { CommentData, RosterStudent, StreamPostData } from "./types";

function toCommentData(comment: { id: string; authorId: string; body: string; createdAt: Date }): CommentData {
  return { id: comment.id, authorId: comment.authorId, body: comment.body, createdAt: comment.createdAt.toISOString() };
}

interface CommentThreadProps {
  post: StreamPostData;
  isInstructor: boolean;
  currentUserId?: string;
  roster?: RosterStudent[];
}

export function CommentThread({ post, isInstructor, currentUserId, roster }: CommentThreadProps) {
  const [classComments, setClassComments] = useState(post.classComments);
  const [privateThread, setPrivateThread] = useState(post.privateThread ?? []);
  const [privateThreadsByStudent, setPrivateThreadsByStudent] = useState(post.privateThreadsByStudent ?? {});

  const handleDelete = async (commentId: string, remove: () => void) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      remove();
    } else {
      toast.error(result.error || "Failed to delete comment");
    }
  };

  return (
    <div className="space-y-4">
      <CommentSection
        title="Class comments"
        comments={classComments}
        currentUserId={currentUserId}
        isInstructor={isInstructor}
        onDelete={(id) => handleDelete(id, () => setClassComments((prev) => prev.filter((c) => c.id !== id)))}
        onSubmit={async (body) => {
          const result = await createComment(post.id, body, "class");
          if (result.success && result.comment) {
            setClassComments((prev) => [...prev, toCommentData(result.comment!)]);
          } else {
            toast.error(result.error || "Failed to post comment");
          }
        }}
      />

      {isInstructor ? (
        Object.entries(privateThreadsByStudent).map(([studentId, comments]) => {
          const studentEmail = roster?.find((s) => s.id === studentId)?.email;
          return (
            <CommentSection
              key={studentId}
              title={studentEmail ? `Private thread with ${studentEmail}` : "Private thread"}
              comments={comments}
              currentUserId={currentUserId}
              isInstructor={isInstructor}
              onDelete={(id) =>
                handleDelete(id, () =>
                  setPrivateThreadsByStudent((prev) => ({
                    ...prev,
                    [studentId]: prev[studentId].filter((c) => c.id !== id),
                  }))
                )
              }
              onSubmit={async (body) => {
                const result = await createComment(post.id, body, "private", studentId);
                if (result.success && result.comment) {
                  const mapped = toCommentData(result.comment);
                  setPrivateThreadsByStudent((prev) => ({
                    ...prev,
                    [studentId]: [...(prev[studentId] || []), mapped],
                  }));
                } else {
                  toast.error(result.error || "Failed to post reply");
                }
              }}
            />
          );
        })
      ) : (
        <CommentSection
          title="Private comment to instructor"
          comments={privateThread}
          currentUserId={currentUserId}
          isInstructor={isInstructor}
          onDelete={(id) => handleDelete(id, () => setPrivateThread((prev) => prev.filter((c) => c.id !== id)))}
          onSubmit={async (body) => {
            const result = await createComment(post.id, body, "private");
            if (result.success && result.comment) {
              setPrivateThread((prev) => [...prev, toCommentData(result.comment!)]);
            } else {
              toast.error(result.error || "Failed to post comment");
            }
          }}
        />
      )}
    </div>
  );
}

function CommentSection({
  title,
  comments,
  currentUserId,
  isInstructor,
  onDelete,
  onSubmit,
}: {
  title: string;
  comments: CommentData[];
  currentUserId?: string;
  isInstructor: boolean;
  onDelete: (commentId: string) => void;
  onSubmit: (body: string) => Promise<void>;
}) {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsSubmitting(true);
    await onSubmit(input.trim());
    setInput("");
    setIsSubmitting(false);
  };

  return (
    <div className="bg-surface-container-low rounded-xl p-3 space-y-2">
      <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">{title}</p>
      {comments.map((c) => (
        <div key={c.id} className="flex items-start justify-between gap-2 text-xs bg-white rounded-lg p-2 border border-surface-container">
          <p className="text-on-surface">{c.body}</p>
          {(c.authorId === currentUserId || isInstructor) && (
            <button onClick={() => onDelete(c.id)} className="text-secondary hover:text-destructive transition-colors text-[10px] shrink-0 cursor-pointer">
              delete
            </button>
          )}
        </div>
      ))}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          placeholder="Write a comment..."
          className="flex-1 bg-white border border-surface-container rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary-container"
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          className="px-3 py-1.5 bg-primary-container text-on-primary-container rounded-lg text-[10px] font-bold cursor-pointer disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}

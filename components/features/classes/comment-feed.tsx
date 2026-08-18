"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { resolveAuthorDisplay, initialsFor, relativeTime } from "./comment-utils";
import type { CommentData, RosterStudent, RosterInstructor } from "./types";

interface CommentFeedProps {
  comments: CommentData[];
  currentUserId?: string;
  isInstructor: boolean;
  roster?: RosterStudent[];
  instructor?: RosterInstructor;
  onDelete: (commentId: string) => void;
  onSubmit: (body: string) => Promise<void>;
}

export function CommentFeed({
  comments,
  currentUserId,
  isInstructor,
  roster,
  instructor,
  onDelete,
  onSubmit,
}: CommentFeedProps) {
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
    <div>
      {comments.length > 0 && (
        <div className="divide-y divide-surface-container mb-2.5">
          {comments.map((c) => {
            const display = resolveAuthorDisplay(c.authorId, currentUserId, instructor, roster);
            return (
              <div key={c.id} className="flex items-start gap-3 py-2.5 group">
                <div className="w-7 h-7 rounded-full bg-primary-container/30 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {initialsFor(display)}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-bold text-on-surface block">{display.name}</span>
                  <span className="text-[10px] text-secondary block">
                    {display.email ? `${display.email} · ` : ""}{relativeTime(c.createdAt)}
                  </span>
                  <p className="text-sm text-on-surface mt-1 break-words">{c.body}</p>
                </div>
                {(c.authorId === currentUserId || isInstructor) && (
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-[10px] text-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-surface-container-low text-secondary text-xs font-bold flex items-center justify-center shrink-0">
          {initialsFor(resolveAuthorDisplay(currentUserId ?? "", currentUserId, instructor, roster))}
        </div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          placeholder="Add a comment..."
          className="flex-1 bg-surface-container-low rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
        />
        <button
          type="submit"
          disabled={isSubmitting || !input.trim()}
          className="w-8 h-8 rounded-full flex items-center justify-center text-primary hover:bg-primary-container/20 transition-colors disabled:opacity-30 cursor-pointer shrink-0"
          aria-label="Send comment"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Megaphone, BookOpen, Trash2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { CommentThread } from "./comment-thread";
import type { RosterStudent, StreamPostData } from "./types";

interface PostCardProps {
  post: StreamPostData;
  isInstructor: boolean;
  currentUserId?: string;
  roster?: RosterStudent[];
  onDeletePost: (postId: string) => void;
}

export function PostCard({ post, isInstructor, currentUserId, roster, onDeletePost }: PostCardProps) {
  const [showThreads, setShowThreads] = useState(false);
  const isAssignmentPost = post.type === "assignment_created";
  const canDelete = isInstructor && post.authorId === currentUserId;

  const handleDelete = () => {
    if (!window.confirm("Delete this post?")) return;
    onDeletePost(post.id);
  };

  return (
    <div className="bg-white border border-surface-container rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
          isAssignmentPost ? "bg-primary-container/20 text-primary" : "bg-surface-container-low text-secondary"
        }`}>
          {isAssignmentPost ? <BookOpen className="h-4 w-4" /> : <Megaphone className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm text-on-surface font-semibold whitespace-pre-wrap">{post.body}</p>
            {canDelete && (
              <button onClick={handleDelete} className="text-secondary hover:text-destructive transition-colors cursor-pointer shrink-0">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {post.linkUrl && (
            <a
              href={post.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!/^https?:\/\//i.test(post.linkUrl || "")) {
                  e.preventDefault();
                  toast.error("Invalid link");
                }
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
            >
              <LinkIcon className="h-3 w-3" /> {post.linkUrl}
            </a>
          )}
          <p className="text-[10px] text-secondary mt-2">{new Date(post.createdAt).toLocaleString()}</p>

          <button
            onClick={() => setShowThreads((v) => !v)}
            className="text-[10px] font-bold text-secondary hover:text-primary transition-colors mt-3 cursor-pointer"
          >
            {showThreads ? "Hide comments" : "View comments"}
          </button>

          {showThreads && (
            <div className="mt-3 pt-3 border-t border-surface-container">
              <CommentThread post={post} isInstructor={isInstructor} currentUserId={currentUserId} roster={roster} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

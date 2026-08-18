"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { createPost, deletePost } from "@/app/actions/posts";
import { PostCard } from "./post-card";
import { useClassStreamRealtime } from "./use-class-stream-realtime";
import type { RosterStudent, RosterInstructor, StreamPostData } from "./types";

interface StreamTabProps {
  classId: string;
  initialPosts: StreamPostData[];
  isInstructor: boolean;
  currentUserId?: string;
  roster?: RosterStudent[];
  instructor?: RosterInstructor;
}

export function StreamTab({ classId, initialPosts, isInstructor, currentUserId, roster, instructor }: StreamTabProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [body, setBody] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePostInserted = useCallback((post: StreamPostData) => {
    setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [post, ...prev]));
  }, []);

  const handlePostDeleted = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  useClassStreamRealtime(classId, handlePostInserted, handlePostDeleted);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    setIsPosting(true);
    try {
      const result = await createPost(classId, body, linkUrl || undefined);
      if (result.success) {
        setBody("");
        setLinkUrl("");
        toast.success("Announcement posted");
      } else {
        toast.error(result.error || "Failed to post announcement");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const result = await deletePost(postId);
    if (result.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success("Post deleted");
    } else {
      toast.error(result.error || "Failed to delete post");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl w-full">
      {isInstructor && (
        <form onSubmit={handlePost} className="bg-white border border-surface-container rounded-2xl p-5 space-y-3 shadow-sm">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isPosting}
            placeholder="Share an announcement with your class..."
            rows={3}
            className="w-full bg-surface-container-low rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-container resize-none"
          />
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={isPosting}
            placeholder="Optional link (https://...)"
            className="w-full bg-surface-container-low rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPosting || !body.trim()}
              className="px-5 py-2 bg-primary-container hover:bg-surface-tint text-on-primary-container hover:text-white rounded-xl font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="h-3.5 w-3.5" />
              {isPosting ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <p className="text-xs text-secondary italic text-center py-10">No activity yet.</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isInstructor={isInstructor}
              currentUserId={currentUserId}
              roster={roster}
              instructor={instructor}
              onDeletePost={handleDeletePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}

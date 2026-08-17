"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

function ChatBubbleComponent({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex gap-3 max-w-[90%] ${isAssistant ? "self-start" : "self-end flex-row-reverse"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isAssistant
            ? "bg-primary-container/20 text-primary"
            : "bg-surface-container text-secondary"
        }`}
      >
        {isAssistant ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div
        className={`px-4 py-2.5 rounded-2xl shadow-sm ${
          isAssistant
            ? "bg-surface-container-low text-on-surface rounded-tl-sm border border-surface-container"
            : "bg-primary text-white rounded-tr-sm"
        }`}
      >
        {isAssistant ? (
          <div className="prose prose-sm max-w-none text-xs leading-relaxed overflow-hidden break-words text-on-surface font-semibold [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:bg-surface-container [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_pre]:bg-surface-container [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_table]:text-[10px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_td]:border [&_th]:border-surface-container [&_td]:border-surface-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-xs leading-relaxed font-semibold">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}

export const ChatBubble = memo(ChatBubbleComponent, (prev, next) =>
  prev.message.id === next.message.id &&
  prev.message.content === next.message.content
);

"use client";

import { useRef, useEffect, useMemo } from "react";
import { Bot, Send, MessageSquare, Heart, Clock } from "lucide-react";
import { ChatBubble, type ChatMessage } from "./workspace-chat/chat-bubble";

interface WorkspaceChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isStreaming: boolean;
  isSubmitted: boolean;
  heartsCount: number;
  timeToRegen: string;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}

export function WorkspaceChat({
  messages,
  isLoading,
  isStreaming,
  isSubmitted,
  heartsCount,
  timeToRegen,
  chatInput,
  onChatInputChange,
  onSendMessage,
}: WorkspaceChatProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const visibleMessages = useMemo(
    () => messages.filter((msg) => msg.content.trim() !== "" || !isLoading),
    [messages, isLoading]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  return (
    <div className="h-full w-full flex flex-col bg-white min-w-0 overflow-hidden border-l border-surface-container shadow-sm">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-surface-container flex items-center gap-3 bg-white shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-xs text-on-surface">gAIts</h3>
          <p className="text-[9px] text-secondary font-bold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>{" "}
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-5 space-y-4 select-text bg-surface-container-low/10"
      >
        {visibleMessages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          visibleMessages.map((msg, index) => (
            <ChatBubble key={msg.id || index} message={msg} />
          ))
        )}
        {isLoading && !isStreaming && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-surface-container p-3 rounded-2xl rounded-tl-sm border border-surface-container shadow-sm">
              <p className="text-xs text-on-surface animate-pulse font-medium">
                Thinking...
              </p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        isSubmitted={isSubmitted}
        heartsCount={heartsCount}
        timeToRegen={timeToRegen}
        isLoading={isLoading}
        chatInput={chatInput}
        onChatInputChange={onChatInputChange}
        onSendMessage={onSendMessage}
      />
    </div>
  );
}

function ChatEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <div className="w-9 h-9 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mb-3">
        <MessageSquare className="h-4 w-4" />
      </div>
      <h5 className="text-xs font-bold text-on-surface">Ask for coding help</h5>
      <p className="text-[10px] text-secondary mt-1.5 max-w-[180px] leading-normal font-semibold">
        Stuck? Chat with the AI tutor. Tiered hints will adapt to your needs!
      </p>
    </div>
  );
}

function ChatInput({
  isSubmitted,
  heartsCount,
  timeToRegen,
  isLoading,
  chatInput,
  onChatInputChange,
  onSendMessage,
}: {
  isSubmitted: boolean;
  heartsCount: number;
  timeToRegen: string;
  isLoading: boolean;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSendMessage: (e: React.FormEvent) => void;
}) {
  if (isSubmitted) {
    return (
      <div className="p-4 border-t border-surface-container bg-white shrink-0 text-center">
        <p className="text-[10px] text-secondary italic font-semibold">
          Chat is disabled after submission.
        </p>
      </div>
    );
  }

  if (heartsCount <= 0) {
    return (
      <div className="p-4 border-t border-surface-container bg-white shrink-0 text-center space-y-1">
        <p className="text-[10px] text-secondary italic font-bold">
          0 Hearts left. Ask Tutor disabled.
        </p>
        {timeToRegen && (
          <p className="text-[9px] font-bold text-rose-500 flex items-center justify-center gap-1">
            <Clock className="h-3 w-3" /> Next heart in: {timeToRegen}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-surface-container bg-white shrink-0">
      <form onSubmit={onSendMessage} className="relative flex items-center">
        <input
          placeholder="Ask gAIts..."
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          disabled={isLoading}
          className="w-full bg-surface-container-low border border-surface-container rounded-full py-3.5 pl-4 pr-12 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-secondary font-semibold transition-shadow shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !chatInput.trim()}
          suppressHydrationWarning
          className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-primary hover:bg-surface-tint text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

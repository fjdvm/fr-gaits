"use client";

import { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface WorkspaceChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
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
  isSubmitted,
  heartsCount,
  timeToRegen,
  chatInput,
  onChatInputChange,
  onSendMessage,
}: WorkspaceChatProps) {
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);

  const handleScroll = () => {
    if (!chatScrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.current;
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 80;
  };

  useEffect(() => {
    if (!isNearBottomRef.current) return;
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);
  }, [messages]);

  return (
    <div className="w-[25%] flex flex-col h-full bg-card shrink-0 min-w-0 overflow-hidden">
      <div className="flex h-11 items-center px-4 border-b border-border bg-muted/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">AI Tutor</span>
          <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[8px] font-semibold text-primary uppercase tracking-wide">
            Help
          </span>
        </div>
      </div>

      <div ref={chatScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {messages.length === 0 ? (
          <ChatEmptyState />
        ) : (
          messages.map((msg, index) => (
            <ChatBubble key={msg.id || index} message={msg} />
          ))
        )}
        {isLoading && (!messages.length || messages[messages.length - 1]?.role !== "assistant" || !messages[messages.length - 1]?.content) && (
          <div className="flex flex-col max-w-[85%] rounded-lg p-2.5 text-xs bg-muted border border-border text-foreground self-start">
            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">AI Tutor</span>
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
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
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">?</div>
      <h5 className="text-xs font-semibold">Ask for coding help</h5>
      <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px] leading-normal">
        Stuck? Chat with the AI tutor. Tiered hints will adapt to your needs!
      </p>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={`flex flex-col max-w-[85%] rounded-lg p-2.5 text-xs overflow-hidden break-words ${
        isAssistant
          ? "bg-muted border border-border text-foreground self-start"
          : "bg-primary text-primary-foreground self-end"
      }`}
    >
      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider mb-1 block">
        {isAssistant ? "AI Tutor" : "Me"}
      </span>
      {isAssistant ? (
        <div className="prose prose-sm max-w-none text-xs leading-normal overflow-hidden break-words [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[10px] [&_pre]:overflow-x-auto">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      ) : (
        <div className="whitespace-pre-wrap leading-normal break-words">{message.content}</div>
      )}
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
      <div className="p-3 border-t border-border bg-muted/30 shrink-0">
        <p className="text-[10px] text-muted-foreground text-center italic py-2">Chat is disabled after submission.</p>
      </div>
    );
  }

  if (heartsCount <= 0) {
    return (
      <div className="p-3 border-t border-border bg-muted/30 shrink-0">
        <div className="text-center py-2 space-y-1.5">
          <p className="text-[10px] text-muted-foreground italic">0 Hearts left. Send disabled.</p>
          {timeToRegen && <p className="text-[9px] font-bold text-destructive">Next heart in: {timeToRegen}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-border bg-muted/30 shrink-0">
      <form onSubmit={onSendMessage} className="flex gap-1.5">
        <input
          placeholder="Ask a question..."
          value={chatInput}
          onChange={(e) => onChatInputChange(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-background border border-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
        />
        <Button type="submit" size="sm" disabled={isLoading || !chatInput.trim()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 shrink-0 text-xs px-2.5">
          Send
        </Button>
      </form>
    </div>
  );
}

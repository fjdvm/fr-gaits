"use client";

import { useRef, useEffect } from "react";
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

  useEffect(() => {
    setTimeout(() => {
      if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
    }, 50);
  }, [messages]);

  return (
    <div className="w-[25%] flex flex-col h-full bg-zinc-900/20 shrink-0">
      <div className="flex h-11 items-center px-4 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">AI Tutor</span>
          <span className="rounded bg-indigo-900/30 border border-indigo-800/40 px-1.5 py-0.5 text-[8px] font-semibold text-indigo-400 uppercase tracking-wide">
            Help
          </span>
        </div>
      </div>

      <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <div className="w-8 h-8 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center mb-2">?</div>
            <h5 className="text-xs font-semibold">Ask for coding help</h5>
            <p className="text-[10px] text-zinc-500 mt-1 max-w-[180px] leading-normal">
              Stuck? Chat with the AI tutor. Tiered hints will adapt to your needs!
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAssistant = msg.role === "assistant";
            return (
              <div key={msg.id || index}
                className={`flex flex-col max-w-[85%] rounded-lg p-2.5 text-xs ${
                  isAssistant ? "bg-zinc-800/50 border border-zinc-800 text-zinc-250 self-start" : "bg-indigo-600 text-white self-end"
                }`}>
                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">
                  {isAssistant ? "AI Tutor" : "Me"}
                </span>
                <div className="whitespace-pre-wrap leading-normal font-sans prose prose-invert max-w-none text-xs">
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex flex-col max-w-[85%] rounded-lg p-2.5 text-xs bg-zinc-800/50 border border-zinc-800 text-zinc-300 self-start">
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block">AI Tutor</span>
            <span className="animate-pulse">Thinking...</span>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 shrink-0">
        {isSubmitted ? (
          <p className="text-[10px] text-zinc-500 text-center italic py-2">Chat is disabled after submission.</p>
        ) : heartsCount <= 0 ? (
          <div className="text-center py-2 space-y-1.5">
            <p className="text-[10px] text-zinc-500 italic">0 Hearts left. Send disabled.</p>
            {timeToRegen && <p className="text-[9px] font-bold text-rose-500">Next heart in: {timeToRegen}</p>}
          </div>
        ) : (
          <form onSubmit={onSendMessage} className="flex gap-1.5">
            <input
              placeholder="Ask a question..."
              value={chatInput}
              onChange={(e) => onChatInputChange(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder:text-zinc-600"
            />
            <Button type="submit" size="sm" disabled={isLoading || !chatInput.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 h-8 shrink-0 text-xs px-2.5">
              Send
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

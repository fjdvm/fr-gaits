import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageSquare } from "lucide-react";

interface ChatMsg {
  role: string;
  content: string;
  createdAt: string;
}

interface TutorLogTabProps {
  chatMessages: ChatMsg[];
}

export function TutorLogTab({ chatMessages }: TutorLogTabProps) {
  if (chatMessages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-10 w-10 text-secondary/30 mx-auto mb-2" />
        <p className="text-xs text-secondary font-semibold">No tutor conversations logged.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {chatMessages.map((msg, i) => (
        <div
          key={i}
          className={`p-4 rounded-2xl text-xs border ${
            msg.role === "assistant"
              ? "bg-surface-container-low border-surface-container text-on-surface"
              : "bg-primary-container/10 border-primary-container/20 text-on-surface"
          }`}
        >
          <div className="flex justify-between items-center mb-2 font-bold text-[9px] uppercase tracking-wider text-secondary">
            <span>{msg.role === "assistant" ? "AI Tutor" : "Student"}</span>
            <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
          </div>
          <div className="prose prose-sm max-w-none leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_code]:bg-surface-container [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[10px] [&_pre]:bg-surface-container [&_pre]:p-2 [&_pre]:rounded [&_pre]:text-[10px] [&_pre]:overflow-x-auto [&_table]:block [&_table]:overflow-x-auto [&_table]:text-[10px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_td]:border [&_th]:border-surface-container [&_td]:border-surface-container">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  );
}

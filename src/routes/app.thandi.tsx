import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AppLayout, ResponsibleAiNote } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatExact, relativeTime, useAppStore } from "@/lib/app-store";
import { useAi } from "@/lib/use-ai";

export const Route = createFileRoute("/app/thandi")({
  head: () => ({
    meta: [
      { title: "THANDI · AI Workplace Assistant" },
      {
        name: "description",
        content: "Chat with THANDI, your AI workplace assistant, for quick help with work tasks.",
      },
      { property: "og:title", content: "THANDI · AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Chat with THANDI, your AI workplace assistant, for quick help with work tasks.",
      },
    ],
  }),
  component: ThandiPage,
});

const SUGGESTIONS = [
  "Help me prepare an agenda for tomorrow's team meeting.",
  "How do I politely decline a meeting invitation?",
  "Give me three ways to prioritise a busy workday.",
  "Draft a short update for my manager on a delayed project.",
];

function ThandiPage() {
  const { chat, addChat, clearChat, logActivity, user } = useAppStore();
  const { generate, loading } = useAi();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const now = Date.now();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.length, loading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;
    addChat({ role: "user", content: message });
    setInput("");
    const history = chat.slice(-10).map((m) => ({ role: m.role, content: m.content }));
    const reply = await generate({
      system: `You are THANDI, a friendly and practical AI workplace assistant used inside a company productivity app. The user is ${user?.name ?? "a colleague"}. Give concise, actionable workplace guidance. Ask a clarifying question when the request is vague. Remind the user to review AI output before using it when the answer will be sent to others.`,
      prompt: message,
      history,
    });
    if (reply) {
      addChat({ role: "assistant", content: reply });
      logActivity("THANDI", "Asked THANDI a question");
    }
    inputRef.current?.focus();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <AppLayout title="THANDI — Your AI Workplace Assistant">
      <div className="surface-panel flex h-[70vh] min-h-[520px] flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <p className="font-semibold text-foreground">THANDI</p>
            <p className="text-xs text-muted-foreground">
              {chat.length} message{chat.length === 1 ? "" : "s"} in this conversation
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearChat}
            disabled={chat.length === 0 || loading}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Clear conversation
          </Button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4" aria-live="polite">
          {chat.length === 0 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Hi{user ? `, ${user.name.split(" ")[0]}` : ""}! I'm THANDI. Ask me anything about
                your work day, or start with a suggestion:
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="rounded-md border border-border bg-card px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {chat.map((m) => (
            <div
              key={m.id}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "max-w-[85%] rounded-lg bg-secondary px-3 py-2 text-sm whitespace-pre-wrap text-secondary-foreground"
                }
              >
                {m.content}
                <div
                  className="mt-1 text-[10px] opacity-70"
                  title={formatExact(m.at)}
                >
                  {relativeTime(m.at, now)}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> THANDI is thinking…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={onSubmit} className="space-y-2 border-t border-border p-3">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Ask THANDI…"
              aria-label="Message THANDI"
              className="min-h-0 resize-none"
            />
            <Button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </div>
          <ResponsibleAiNote />
        </form>
      </div>
    </AppLayout>
  );
}

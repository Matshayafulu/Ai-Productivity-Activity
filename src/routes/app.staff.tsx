import { createFileRoute } from "@tanstack/react-router";
import { Search, Send } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AppLayout } from "@/components/AppLayout";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatExact, relativeTime, useAppStore, type Staff } from "@/lib/app-store";

export const Route = createFileRoute("/app/staff")({
  head: () => ({
    meta: [
      { title: "Staff Directory · AI Workplace Assistant" },
      {
        name: "description",
        content: "Search colleagues, check their availability and send them a message.",
      },
      { property: "og:title", content: "Staff Directory · AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Search colleagues, check their availability and send them a message.",
      },
    ],
  }),
  component: StaffPage,
});

function StaffPage() {
  const { staff, messages, sendMessage } = useAppStore();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<Staff | null>(null);
  const [draft, setDraft] = useState("");
  const now = Date.now();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staff;
    return staff.filter((s) =>
      [s.name, s.role, s.department, s.email].some((f) => f.toLowerCase().includes(q)),
    );
  }, [staff, query]);

  const thread = active ? messages.filter((m) => m.staffId === active.id) : [];

  function onSend(e: FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    sendMessage(active.id, draft.trim());
    setDraft("");
    toast.success(`Message sent to ${active.name}`);
  }

  return (
    <AppLayout title="Staff Directory">
      <div className="space-y-5">
        <div className="surface-panel flex items-center gap-2 p-3">
          <Search className="size-4 text-muted-foreground" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, department or email"
            aria-label="Search staff"
            className="border-0 shadow-none focus-visible:ring-0"
          />
        </div>

        <p className="text-sm text-muted-foreground" aria-live="polite">
          {results.length} of {staff.length} colleagues
        </p>

        {results.length === 0 ? (
          <div className="surface-panel p-8 text-center text-sm text-muted-foreground">
            No colleagues match “{query}”. Try a different name or department.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((s) => {
              const count = messages.filter((m) => m.staffId === s.id).length;
              return (
                <div key={s.id} className="surface-panel flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                      {s.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{s.name}</p>
                      <p className="truncate text-sm text-muted-foreground">{s.role}</p>
                      <p className="truncate text-xs text-muted-foreground">{s.department}</p>
                    </div>
                  </div>
                  <AvailabilityBadge status={s.availability} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActive(s);
                      setDraft("");
                    }}
                  >
                    <Send className="size-4" aria-hidden="true" /> Message
                    {count > 0 ? ` (${count})` : ""}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{active?.name}</DialogTitle>
            <DialogDescription>
              {active?.role} · {active?.department} · {active && (
                <span className="capitalize">{active.availability}</span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-64 space-y-2 overflow-y-auto rounded-md bg-secondary/50 p-3">
            {thread.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No messages yet. Say hello — messages are stored on this device.
              </p>
            ) : (
              thread.map((m) => (
                <div key={m.id} className="rounded-md bg-card px-3 py-2 text-sm">
                  <p className="whitespace-pre-wrap text-foreground">{m.text}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground" title={formatExact(m.at)}>
                    {relativeTime(m.at, now)} · {formatExact(m.at)}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={onSend} className="space-y-2">
            <Textarea
              rows={3}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${active?.name.split(" ")[0] ?? ""}…`}
              aria-label="Message text"
            />
            <Button type="submit" disabled={!draft.trim()} className="w-full">
              <Send className="size-4" aria-hidden="true" /> Send message
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

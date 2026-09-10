import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { AppLayout } from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { formatExact, relativeTime, useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/app/activity")({
  head: () => ({
    meta: [
      { title: "Activity Tracker · AI Workplace Assistant" },
      {
        name: "description",
        content: "A timestamped log of every meaningful action you take in the workspace.",
      },
      { property: "og:title", content: "Activity Tracker · AI Workplace Assistant" },
      {
        property: "og:description",
        content: "A timestamped log of every meaningful action you take in the workspace.",
      },
    ],
  }),
  component: ActivityPage,
});

function ActivityPage() {
  const { activities } = useAppStore();
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) =>
      [a.type, a.description].some((f) => f.toLowerCase().includes(q)),
    );
  }, [activities, query]);

  return (
    <AppLayout title="Activity Tracker">
      <div className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Every action below was recorded with your device's local time when it happened.
        </p>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by activity type or description"
          aria-label="Filter activity"
        />

        {filtered.length === 0 ? (
          <div className="surface-panel p-8 text-center text-sm text-muted-foreground">
            {activities.length === 0
              ? "No activity recorded yet. Use the AI tools or message a colleague to get started."
              : `No activity matches “${query}”.`}
          </div>
        ) : (
          <ul className="surface-panel divide-y divide-border">
            {filtered.map((a) => (
              <li key={a.id} className="flex flex-wrap items-start justify-between gap-2 p-4">
                <div className="min-w-0">
                  <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {a.type}
                  </span>
                  <p className="mt-1 text-sm text-foreground">{a.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{relativeTime(a.at, now)}</p>
                  <p className="text-xs text-muted-foreground">{formatExact(a.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}

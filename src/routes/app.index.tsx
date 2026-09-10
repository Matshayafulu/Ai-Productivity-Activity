import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity as ActivityIcon,
  BotMessageSquare,
  CalendarCheck,
  Mail,
  NotebookPen,
  Search,
  Users,
} from "lucide-react";

import { AppLayout, ResponsibleAiNote } from "@/components/AppLayout";
import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { formatExact, relativeTime, useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content: "Your workplace dashboard: AI tools, team availability and recent activity.",
      },
      { property: "og:title", content: "Dashboard · AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Your workplace dashboard: AI tools, team availability and recent activity.",
      },
    ],
  }),
  component: Dashboard,
});

const TOOLS = [
  {
    to: "/app/email",
    label: "Smart Email Generator",
    icon: Mail,
    desc: "Draft email in a formal, friendly or persuasive tone.",
  },
  {
    to: "/app/notes",
    label: "Meeting Notes Summarizer",
    icon: NotebookPen,
    desc: "Turn notes into summary, action items, decisions and deadlines.",
  },
  {
    to: "/app/planner",
    label: "AI Task Planner",
    icon: CalendarCheck,
    desc: "Build a prioritised daily or weekly schedule.",
  },
  {
    to: "/app/research",
    label: "AI Research Assistant",
    icon: Search,
    desc: "Summaries, insights and recommendations on any topic.",
  },
  {
    to: "/app/thandi",
    label: "THANDI Assistant",
    icon: BotMessageSquare,
    desc: "Chat with your AI workplace assistant.",
  },
  {
    to: "/app/staff",
    label: "Staff Directory",
    icon: Users,
    desc: "Search colleagues, see availability and send messages.",
  },
] as const;

function Dashboard() {
  const { user, availability, staff, activities, chat } = useAppStore();
  const now = Date.now();
  const availableCount = staff.filter((s) => s.availability === "available").length;

  return (
    <AppLayout title="Dashboard">
      <div className="space-y-6">
        <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-5">
          <div>
            <p className="text-lg font-semibold text-foreground">Welcome back, {user?.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <AvailabilityBadge status={availability} className="text-sm" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Colleagues available", value: `${availableCount}/${staff.length}` },
            { label: "Activities logged", value: activities.length },
            { label: "THANDI messages", value: chat.length },
            { label: "AI tools", value: 5 },
          ].map((stat) => (
            <div key={stat.label} className="surface-panel p-4">
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link
              key={tool.to}
              to={tool.to}
              className="surface-panel group p-5 transition-colors hover:border-primary"
            >
              <tool.icon className="size-5 text-primary" aria-hidden="true" />
              <p className="mt-3 font-semibold text-foreground group-hover:text-primary">
                {tool.label}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{tool.desc}</p>
            </Link>
          ))}
        </div>

        <div className="surface-panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-foreground">
              <ActivityIcon className="size-4 text-primary" aria-hidden="true" /> Recent activity
            </h3>
            <Link to="/app/activity" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {activities.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No activity yet. Actions you take are recorded here automatically.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {activities.slice(0, 5).map((a) => (
                <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span>
                    <span className="font-medium text-foreground">{a.type}</span>
                    <span className="text-muted-foreground"> — {a.description}</span>
                  </span>
                  <span className="text-xs text-muted-foreground" title={formatExact(a.at)}>
                    {relativeTime(a.at, now)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <ResponsibleAiNote />
      </div>
    </AppLayout>
  );
}

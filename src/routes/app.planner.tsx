import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Wand2 } from "lucide-react";
import { useState } from "react";

import { AiOutput } from "@/components/AiOutput";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/app-store";
import { useAi } from "@/lib/use-ai";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner · AI Workplace Assistant" },
      {
        name: "description",
        content: "Turn your task list into a prioritised daily or weekly work schedule.",
      },
      { property: "og:title", content: "AI Task Planner · AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Turn your task list into a prioritised daily or weekly work schedule.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  const { logActivity } = useAppStore();
  const { generate, loading, error } = useAi();
  const [tasks, setTasks] = useState("");
  const [hours, setHours] = useState("8");
  const [mode, setMode] = useState<"Daily" | "Weekly">("Daily");
  const [output, setOutput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function onGenerate() {
    if (tasks.trim().length < 5) {
      setFormError("List at least one task.");
      return;
    }
    setFormError(null);
    const now = new Date();
    const text = await generate({
      system:
        "You are a workplace planning assistant. Produce a realistic, time-blocked schedule in plain text. Start with PRIORITISED TASKS (ranked high/medium/low with a one-line reason), then SCHEDULE with time blocks, then RISKS & TIPS. Respect the available working hours and include short breaks.",
      prompt: `Planning mode: ${mode}\nStarting: ${now.toLocaleString()}\nAvailable working hours per day: ${hours}\nTasks:\n${tasks}`,
    });
    if (text) {
      setOutput(text);
      logActivity("Task Planner", `Generated a ${mode.toLowerCase()} plan`);
    }
  }

  return (
    <AppLayout title="AI Task Planner">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-4">
          <h3 className="text-sm font-semibold text-foreground">Your input</h3>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Schedule type</legend>
            <div className="flex gap-2">
              {(["Daily", "Weekly"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={mode === m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    mode === m
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Working hours per day</Label>
            <Input
              id="hours"
              type="number"
              min={1}
              max={16}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tasks">Tasks (one per line)</Label>
            <Textarea
              id="tasks"
              rows={10}
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              aria-invalid={!!formError}
              placeholder={"Finish Q3 report (due Friday)\nReview two pull requests\nPrepare client demo"}
            />
            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}
          </div>
          <Button onClick={onGenerate} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 className="size-4" aria-hidden="true" />
            )}
            Build my {mode.toLowerCase()} plan
          </Button>
        </div>

        <AiOutput
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          label="Plan (editable)"
          emptyHint="Your prioritised schedule will appear here."
        />
      </div>
    </AppLayout>
  );
}

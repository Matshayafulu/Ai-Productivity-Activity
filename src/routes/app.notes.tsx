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

export const Route = createFileRoute("/app/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer · AI Workplace Assistant" },
      {
        name: "description",
        content:
          "Turn raw meeting notes into a summary with action items, decisions and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer · AI Workplace Assistant" },
      {
        property: "og:description",
        content:
          "Turn raw meeting notes into a summary with action items, decisions and deadlines.",
      },
    ],
  }),
  component: NotesPage,
});

function NotesPage() {
  const { logActivity } = useAppStore();
  const { generate, loading, error } = useAi();
  const [meeting, setMeeting] = useState("");
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function onGenerate() {
    if (notes.trim().length < 20) {
      setFormError("Paste at least a few lines of meeting notes (20+ characters).");
      return;
    }
    setFormError(null);
    const text = await generate({
      system:
        "You summarize workplace meetings. Always reply in plain text with exactly these sections in this order: SUMMARY, ACTION ITEMS, DECISIONS, DEADLINES. Under ACTION ITEMS list owner and task. Under DEADLINES list the item and its due date as stated. If a section has nothing, write 'None recorded.'",
      prompt: `Meeting: ${meeting || "(untitled meeting)"}\nToday's date: ${new Date().toLocaleDateString()}\n\nRaw notes:\n${notes}`,
    });
    if (text) {
      setOutput(text);
      logActivity("Meeting Notes", `Summarized notes for "${meeting || "untitled meeting"}"`);
    }
  }

  return (
    <AppLayout title="Meeting Notes Summarizer">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-4">
          <h3 className="text-sm font-semibold text-foreground">Your input</h3>
          <div className="space-y-1.5">
            <Label htmlFor="meeting">Meeting title (optional)</Label>
            <Input
              id="meeting"
              value={meeting}
              onChange={(e) => setMeeting(e.target.value)}
              placeholder="Weekly product sync"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Meeting notes or transcript</Label>
            <Textarea
              id="notes"
              rows={14}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-invalid={!!formError}
              placeholder="Paste your raw notes here…"
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
            Summarize notes
          </Button>
        </div>

        <AiOutput
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          label="Summary, action items, decisions & deadlines (editable)"
          emptyHint="Your structured meeting summary will appear here."
        />
      </div>
    </AppLayout>
  );
}

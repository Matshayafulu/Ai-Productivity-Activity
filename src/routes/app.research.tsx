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

export const Route = createFileRoute("/app/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant · AI Workplace Assistant" },
      {
        name: "description",
        content: "Get structured topic summaries, key insights and recommendations.",
      },
      { property: "og:title", content: "AI Research Assistant · AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Get structured topic summaries, key insights and recommendations.",
      },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const { logActivity } = useAppStore();
  const { generate, loading, error } = useAi();
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function onGenerate() {
    if (topic.trim().length < 3) {
      setFormError("Enter a topic to research.");
      return;
    }
    setFormError(null);
    const text = await generate({
      system:
        "You are a workplace research assistant. Reply in plain text with sections: SUMMARY, KEY INSIGHTS, RECOMMENDATIONS, OPEN QUESTIONS TO VERIFY. Be factual and concise, flag uncertainty explicitly, and never invent statistics or sources.",
      prompt: `Topic: ${topic}\nWorkplace context: ${context || "(none provided)"}`,
    });
    if (text) {
      setOutput(text);
      logActivity("Research", `Researched "${topic}"`);
    }
  }

  return (
    <AppLayout title="AI Research Assistant">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-4">
          <h3 className="text-sm font-semibold text-foreground">Your input</h3>
          <div className="space-y-1.5">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              aria-invalid={!!formError}
              placeholder="Hybrid work policies in South African companies"
            />
            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="context">Why do you need it? (optional)</Label>
            <Textarea
              id="context"
              rows={8}
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Preparing a proposal for the leadership team next week."
            />
          </div>
          <Button onClick={onGenerate} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 className="size-4" aria-hidden="true" />
            )}
            Research topic
          </Button>
        </div>

        <AiOutput
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          label="Research brief (editable)"
          emptyHint="Your summary, insights and recommendations will appear here."
        />
      </div>
    </AppLayout>
  );
}

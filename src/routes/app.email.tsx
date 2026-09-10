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

export const Route = createFileRoute("/app/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator · AI Workplace Assistant" },
      {
        name: "description",
        content: "Generate workplace email drafts in formal, friendly or persuasive tones.",
      },
      { property: "og:title", content: "Smart Email Generator · AI Workplace Assistant" },
      {
        property: "og:description",
        content: "Generate workplace email drafts in formal, friendly or persuasive tones.",
      },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Formal", "Friendly", "Persuasive"] as const;
type Tone = (typeof TONES)[number];

function EmailPage() {
  const { logActivity, user } = useAppStore();
  const { generate, loading, error } = useAi();
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<Tone>("Formal");
  const [output, setOutput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function onGenerate() {
    if (brief.trim().length < 10) {
      setFormError("Describe what the email should say (at least 10 characters).");
      return;
    }
    setFormError(null);
    const text = await generate({
      system:
        "You are a professional workplace email writer. Produce a complete, ready-to-send email with a subject line and sign-off. Keep it clear, concise and appropriate for a corporate environment. Return plain text only.",
      prompt: `Tone: ${tone}\nSender: ${user?.name ?? "the sender"}\nRecipient: ${recipient || "the recipient"}\nSubject hint: ${subject || "(none given)"}\nWhat the email must communicate:\n${brief}`,
    });
    if (text) {
      setOutput(text);
      logActivity("Email Generator", `Generated a ${tone.toLowerCase()} email draft`);
    }
  }

  return (
    <AppLayout title="Smart Email Generator">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="surface-panel space-y-4 p-4">
          <h3 className="text-sm font-semibold text-foreground">Your input</h3>
          <div className="space-y-1.5">
            <Label htmlFor="recipient">Recipient (optional)</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Team lead, client, whole team…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject hint (optional)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Project update, leave request…"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brief">What should the email say?</Label>
            <Textarea
              id="brief"
              rows={7}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              aria-invalid={!!formError}
              placeholder="Ask the team for status updates before Friday's review and remind them to attach their reports."
            />
            {formError && (
              <p role="alert" className="text-xs text-destructive">
                {formError}
              </p>
            )}
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Tone</legend>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tone === t}
                  onClick={() => setTone(t)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                    tone === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>
          <Button onClick={onGenerate} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Wand2 className="size-4" aria-hidden="true" />
            )}
            Generate email
          </Button>
        </div>

        <AiOutput
          value={output}
          onChange={setOutput}
          loading={loading}
          error={error}
          label="Email draft (editable)"
          emptyHint="Your generated email will appear here, ready to edit."
        />
      </div>
    </AppLayout>
  );
}

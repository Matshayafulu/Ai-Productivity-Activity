import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ResponsibleAiNote } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AiOutput({
  value,
  onChange,
  loading,
  error,
  emptyHint,
  label = "AI output (editable)",
  rows = 16,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
  error?: string | null;
  emptyHint: string;
  label?: string;
  rows?: number;
}) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Your browser blocked clipboard access. Select the text and copy manually.");
    }
  }

  return (
    <div className="surface-panel flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <Button variant="outline" size="sm" onClick={copy} disabled={!value.trim()}>
          <Copy className="size-4" aria-hidden="true" /> Copy
        </Button>
      </div>

      {loading ? (
        <div
          role="status"
          className="flex flex-1 flex-col items-center justify-center gap-2 py-12 text-sm text-muted-foreground"
        >
          <Loader2 className="size-6 animate-spin" aria-hidden="true" />
          Generating with AI…
        </div>
      ) : error && !value ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : value ? (
        <Textarea
          aria-label={label}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-64 flex-1 font-medium"
        />
      ) : (
        <p className="flex-1 py-12 text-center text-sm text-muted-foreground">{emptyHint}</p>
      )}

      <ResponsibleAiNote />
    </div>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const SECTIONS: Array<{ title: string; body: string }> = [
  {
    title: "About this application",
    body: "AI Workplace Productivity Assistant helps teams draft communication, capture meeting outcomes, plan work, research topics and stay connected with colleagues — all from one dashboard.",
  },
  {
    title: "Smart Email Generator",
    body: "Describe what you need to say, pick a Formal, Friendly or Persuasive tone, and edit the generated draft directly before copying it into your mail client.",
  },
  {
    title: "Meeting Notes Summarizer",
    body: "Paste raw meeting notes or a transcript to get a concise summary plus Action Items, Decisions and Deadlines you can edit.",
  },
  {
    title: "AI Task Planner",
    body: "List your tasks and choose a daily or weekly view to receive a prioritised, time-blocked schedule.",
  },
  {
    title: "AI Research Assistant",
    body: "Enter a topic to get a structured summary, key insights and practical recommendations.",
  },
  {
    title: "THANDI",
    body: "Your workplace assistant chatbot. Use suggested prompts to get started, keep the running conversation for context, and clear it whenever you want a fresh start.",
  },
  {
    title: "Availability",
    body: "Set yourself to Available, Away or Busy from the header. Colleagues see your status in the staff directory, and each change is recorded in the Activity Tracker.",
  },
  {
    title: "Activity Tracker",
    body: "Every meaningful action — sign-ins, AI generations, messages and status changes — is logged with its type, description, exact date and time, and a relative time such as “Just now” or “5 minutes ago”. Timestamps come from your device clock.",
  },
  {
    title: "Responsible AI",
    body: "AI-generated content may be inaccurate or incomplete. Always review, verify and edit AI output before using it for workplace communication or decisions. Never enter confidential personal data you are not permitted to share.",
  },
];

export function HelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Help &amp; guidance</DialogTitle>
          <DialogDescription>
            How the AI Workplace Productivity Assistant works.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </section>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

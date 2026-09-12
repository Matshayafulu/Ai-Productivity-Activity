import { Link, createFileRoute } from "@tanstack/react-router";

import { AppFooter, ResponsibleAiNote } from "@/components/AppLayout";

export const Route = createFileRoute("/responsible-ai")({
  head: () => ({
    meta: [
      { title: "Responsible AI · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "How the AI Workplace Productivity Assistant uses AI responsibly: human review, accuracy limits, fairness and safe workplace use.",
      },
      { property: "og:title", content: "Responsible AI · AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Our Responsible AI principles: review AI output before workplace use.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResponsibleAiPage,
});

function ResponsibleAiPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to the app
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">
          Responsible AI
        </h1>
        <ResponsibleAiNote className="mt-4" />

        <section className="mt-8 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Human review comes first</h2>
            <p className="mt-2">
              Every email draft, meeting summary, plan and research brief produced here is a
              starting point. Read it, correct it and take responsibility for it before you send or
              share it with colleagues, customers or leadership.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Accuracy and limitations</h2>
            <p className="mt-2">
              AI models can be confidently wrong. They may invent names, dates, figures or sources.
              Never treat generated content as a factual record, legal advice or an official
              decision.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Fairness and respect</h2>
            <p className="mt-2">
              Outputs can reflect bias present in training data. Check that language about people,
              teams and candidates is fair, inclusive and appropriate for your workplace.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">What you share matters</h2>
            <p className="mt-2">
              Avoid pasting confidential, personal or regulated information into AI tools unless
              your organisation allows it. Text you submit is sent to an AI provider to generate a
              response.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Accountability</h2>
            <p className="mt-2">
              The assistant supports your judgement — it does not replace it. Meaningful actions you
              take in the app are recorded in the Activity Tracker with the exact time they
              happened.
            </p>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}

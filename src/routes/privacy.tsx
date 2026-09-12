import { Link, createFileRoute } from "@tanstack/react-router";

import { AppFooter } from "@/components/AppLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "What the AI Workplace Productivity Assistant stores, where your account and workspace data live, and how to remove it.",
      },
      { property: "og:title", content: "Privacy · AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "How your account details, workspace activity and AI prompts are handled.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to the app
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">Privacy</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          A plain-language summary of what this application keeps and why.
        </p>

        <section className="mt-8 space-y-6 text-sm text-muted-foreground">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your account</h2>
            <p className="mt-2">
              When you register we store your name and email address so you can sign in and so
              colleagues can recognise you. Passwords are never stored in readable form.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Workspace data on this device</h2>
            <p className="mt-2">
              Your availability status, messages, THANDI conversation and Activity Tracker entries
              are saved in this browser so they survive a refresh. Signing out on a shared computer
              and clearing your browser data removes them.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">AI prompts</h2>
            <p className="mt-2">
              Text you submit to the email generator, notes summarizer, planner, research assistant
              or THANDI is sent to an AI provider to produce a response. Please do not include
              confidential or personal information you are not permitted to share.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">No advertising or tracking</h2>
            <p className="mt-2">
              We do not sell your information and we do not run advertising trackers in this
              application.
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Removing your data</h2>
            <p className="mt-2">
              You can clear your conversation from the THANDI page and reset the stored workspace
              data from Settings. To delete your account, contact your workspace administrator.
            </p>
          </div>
        </section>
      </main>
      <AppFooter />
    </div>
  );
}

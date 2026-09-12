import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";

import { AppFooter, ResponsibleAiNote } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AVAILABILITY_LABEL, useAppStore, type Availability } from "@/lib/app-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Manage your availability, clear your THANDI conversation, reset stored workspace data and sign out.",
      },
      { property: "og:title", content: "Settings · AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Availability, conversation and account settings for your workspace assistant.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SettingsPage,
});

const OPTIONS: Availability[] = ["available", "away", "busy"];

function SettingsPage() {
  const { user, availability, setAvailability, clearChat, logout } = useAppStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to the app
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">Settings</h1>

        {user ? (
          <div className="mt-8 space-y-6">
            <section className="surface-panel p-5">
              <h2 className="text-lg font-semibold text-foreground">Account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{user.name}</span> ·{" "}
                {user.email}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={async () => {
                  await logout();
                  toast.success("Signed out");
                  navigate({ to: "/", replace: true });
                }}
              >
                Sign out
              </Button>
            </section>

            <section className="surface-panel p-5">
              <h2 className="text-lg font-semibold text-foreground">Availability</h2>
              <Label className="mt-2 block text-sm font-normal text-muted-foreground">
                Let colleagues know whether you can be reached right now.
              </Label>
              <div className="mt-4 flex flex-wrap gap-2">
                {OPTIONS.map((option) => (
                  <Button
                    key={option}
                    variant={availability === option ? "default" : "outline"}
                    aria-pressed={availability === option}
                    onClick={() => {
                      setAvailability(option);
                      toast.success(`Status set to ${AVAILABILITY_LABEL[option]}`);
                    }}
                  >
                    {AVAILABILITY_LABEL[option]}
                  </Button>
                ))}
              </div>
            </section>

            <section className="surface-panel p-5">
              <h2 className="text-lg font-semibold text-foreground">THANDI conversation</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Remove every message in your assistant conversation on this device.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  clearChat();
                  toast.success("Conversation cleared");
                }}
              >
                Clear conversation
              </Button>
            </section>

            <ResponsibleAiNote />
          </div>
        ) : (
          <div className="surface-panel mt-8 p-5">
            <p className="text-sm text-muted-foreground">
              Sign in to manage your availability and conversation settings.
            </p>
            <Button className="mt-4" onClick={() => navigate({ to: "/" })}>
              Go to sign in
            </Button>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}

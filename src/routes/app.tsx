import { Outlet, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/app")({
  component: AppGuard,
});

function AppGuard() {
  const { user, hydrated } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/", replace: true });
  }, [hydrated, user, navigate]);

  if (!hydrated || !user) {
    return (
      <div
        role="status"
        className="flex min-h-screen items-center justify-center text-muted-foreground"
      >
        <Loader2 className="size-6 animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading your workspace…</span>
      </div>
    );
  }

  return <Outlet />;
}

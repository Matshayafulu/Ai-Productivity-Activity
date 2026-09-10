import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AppFooter, ResponsibleAiNote } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Sign in to the AI Workplace Productivity Assistant to draft emails, summarize meetings, plan tasks and chat with THANDI.",
      },
      { property: "og:title", content: "Sign in · AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Secure demo sign-in for the AI Workplace Productivity Assistant.",
      },
    ],
  }),
  component: LoginPage,
});

const REMEMBER_KEY = "awpa.remember.email";

function LoginPage() {
  const { user, hydrated, login } = useAppStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated && user) navigate({ to: "/app", replace: true });
  }, [hydrated, user, navigate]);

  function validate() {
    const next: { email?: string; password?: string } = {};
    const value = email.trim();
    if (!value) next.email = "Enter your work email or username.";
    else if (value.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
      next.email = "Enter a valid email address.";
    else if (!value.includes("@") && value.length < 3)
      next.email = "Usernames must be at least 3 characters.";
    if (!password) next.password = "Enter your password.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const identifier = email.trim();
    if (remember) window.localStorage.setItem(REMEMBER_KEY, identifier);
    else window.localStorage.removeItem(REMEMBER_KEY);
    login(identifier.includes("@") ? identifier : `${identifier}@company.com`);
    toast.success("Signed in");
    navigate({ to: "/app", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-center">
          <section className="hidden lg:block">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              <Sparkles className="size-3.5" aria-hidden="true" /> Powered by AI
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
              AI Workplace Productivity Assistant
            </h1>
            <p className="mt-3 text-muted-foreground">
              Draft better email, summarize meetings into action items, plan your week, research
              topics and stay connected with your team — with THANDI at your side.
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              <li>• Smart Email Generator with Formal, Friendly and Persuasive tones</li>
              <li>• Meeting summaries with Action Items, Decisions and Deadlines</li>
              <li>• Staff directory, messaging, availability and activity tracking</li>
            </ul>
            <ResponsibleAiNote className="mt-6" />
          </section>

          <section className="surface-panel p-6 sm:p-8">
            <h2 className="text-xl font-bold text-foreground">Sign in</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Demo access: use any work email and a password of at least 6 characters.
            </p>
            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email or username</Label>
                <Input
                  id="email"
                  name="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  placeholder="you@company.com"
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-xs text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="text-xs text-destructive">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(v) => setRemember(v === true)}
                />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me on this device
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                Sign in
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground lg:hidden">
              AI-generated content must be reviewed before workplace use.
            </p>
          </section>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}

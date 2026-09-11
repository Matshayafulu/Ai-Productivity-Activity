import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AppFooter, ResponsibleAiNote } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAppStore } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sign in · AI Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Sign in or create an account for the AI Workplace Productivity Assistant to draft emails, summarize meetings, plan tasks and chat with THANDI.",
      },
      { property: "og:title", content: "Sign in · AI Workplace Productivity Assistant" },
      {
        property: "og:description",
        content: "Secure sign-in and registration for the AI Workplace Productivity Assistant.",
      },
    ],
  }),
  component: LoginPage,
});

const REMEMBER_KEY = "awpa.remember.email";

type Mode = "signin" | "signup";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
};

function LoginPage() {
  const { user, hydrated, logActivity } = useAppStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
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
    const next: FieldErrors = {};
    const value = email.trim();
    if (!value) next.email = "Enter your work email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Enter your password.";
    else if (password.length < 8 && mode === "signup")
      next.password = "Password must be at least 8 characters.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    if (mode === "signup") {
      if (!name.trim()) next.name = "Enter your full name.";
      if (confirm !== password) next.confirm = "Passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setFormError(null);
    setNotice(null);
    setConfirm("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setNotice(null);
    if (!validate()) return;
    const identifier = email.trim().toLowerCase();
    setSubmitting(true);
    try {
      if (remember) window.localStorage.setItem(REMEMBER_KEY, identifier);
      else window.localStorage.removeItem(REMEMBER_KEY);

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() },
          },
        });
        if (error) {
          setFormError(
            /already registered|already exists/i.test(error.message)
              ? "An account with this email already exists. Try signing in instead."
              : error.message,
          );
          return;
        }
        if (!data.session) {
          setNotice("Account created. Check your inbox to confirm your email, then sign in.");
          toast.success("Account created — confirm your email to continue");
          setMode("signin");
          setPassword("");
          setConfirm("");
          return;
        }
        logActivity("Authentication", `Account created for ${identifier}`);
        toast.success("Welcome aboard");
        navigate({ to: "/app", replace: true });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      if (error) {
        setFormError(
          /invalid login credentials/i.test(error.message)
            ? "Incorrect email or password."
            : /email not confirmed/i.test(error.message)
              ? "Please confirm your email address first — check your inbox."
              : error.message,
        );
        return;
      }
      logActivity("Authentication", `Signed in as ${identifier}`);
      toast.success("Signed in");
      navigate({ to: "/app", replace: true });
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
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
            <div
              role="tablist"
              aria-label="Authentication"
              className="mb-6 grid grid-cols-2 gap-1 rounded-md bg-secondary p-1"
            >
              {(["signin", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={
                    "rounded-sm px-3 py-2 text-sm font-medium transition-colors " +
                    (mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {m === "signin" ? "Sign in" : "Create account"}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-bold text-foreground">
              {mode === "signin" ? "Sign in" : "Create your account"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Use your work email and password to continue."
                : "Register with your work email. Passwords need at least 8 characters."}
            </p>

            {formError && (
              <p
                role="alert"
                className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {formError}
              </p>
            )}
            {notice && (
              <p
                role="status"
                className="mt-4 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              >
                {notice}
              </p>
            )}

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    placeholder="Thandeka Mokoena"
                  />
                  {errors.name && (
                    <p id="name-error" role="alert" className="text-xs text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
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

              {mode === "signup" && (
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={!!errors.confirm}
                    aria-describedby={errors.confirm ? "confirm-error" : undefined}
                  />
                  {errors.confirm && (
                    <p id="confirm-error" role="alert" className="text-xs text-destructive">
                      {errors.confirm}
                    </p>
                  )}
                </div>
              )}

              {mode === "signin" && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="remember"
                    checked={remember}
                    onCheckedChange={(v) => setRemember(v === true)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember my email on this device
                  </Label>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
                {mode === "signin" ? "Sign in" : "Create account"}
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

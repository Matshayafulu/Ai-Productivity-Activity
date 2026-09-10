import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BotMessageSquare,
  CalendarCheck,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  NotebookPen,
  Search,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { AvailabilityBadge } from "@/components/AvailabilityBadge";
import { HelpDialog } from "@/components/HelpDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AVAILABILITY_LABEL, useAppStore, type Availability } from "@/lib/app-store";
import { cn } from "@/lib/utils";

export const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/email", label: "Email Generator", icon: Mail },
  { to: "/app/notes", label: "Meeting Notes", icon: NotebookPen },
  { to: "/app/planner", label: "Task Planner", icon: CalendarCheck },
  { to: "/app/research", label: "Research Assistant", icon: Search },
  { to: "/app/thandi", label: "THANDI Assistant", icon: BotMessageSquare },
  { to: "/app/staff", label: "Staff Directory", icon: Users },
  { to: "/app/activity", label: "Activity Tracker", icon: Activity },
] as const;

const STATUSES: Availability[] = ["available", "away", "busy"];

export function AppLayout({ title, children }: { title: string; children: ReactNode }) {
  const { user, availability, setAvailability, logout } = useAppStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const initials =
    user?.name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "?";

  function handleLogout() {
    logout();
    navigate({ to: "/", replace: true });
  }

  const sidebar = (
    <nav aria-label="Main navigation" className="flex h-full flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <item.icon className="size-4 shrink-0" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <Menu className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              AI Workplace Productivity Assistant
            </p>
            <h1 className="truncate text-xs text-muted-foreground">{title}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setHelpOpen(true)}>
              <CircleHelp className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Help</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" aria-label="Set availability">
                  <AvailabilityBadge status={availability} showLabel={false} />
                  <span className="hidden sm:inline">{AVAILABILITY_LABEL[availability]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Availability</DropdownMenuLabel>
                {STATUSES.map((s) => (
                  <DropdownMenuItem key={s} onSelect={() => setAvailability(s)}>
                    <AvailabilityBadge status={s} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Profile menu">
                  <span className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <span className="block truncate">{user?.name}</span>
                  <span className="block truncate text-xs font-normal text-muted-foreground">
                    {user?.email}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setHelpOpen(true)}>
                  <CircleHelp className="size-4" aria-hidden="true" /> Help
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="size-4" aria-hidden="true" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
          <div className="sticky top-16">{sidebar}</div>
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation overlay"
              className="absolute inset-0 bg-foreground/40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card shadow-lg">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close navigation"
                  onClick={() => setMenuOpen(false)}
                >
                  <X className="size-5" />
                </Button>
              </div>
              {sidebar}
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1 px-4 py-6 md:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-6xl">
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            {children}
          </div>
        </main>
      </div>

      <AppFooter onHelp={() => setHelpOpen(true)} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}

export function AppFooter({ onHelp }: { onHelp?: () => void }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-card px-4 py-6 md:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p>
          AI Workplace Productivity Assistant · © {year} Fulufhelo Matshaya. All rights reserved.
        </p>
        <nav aria-label="Footer" className="flex flex-wrap gap-4">
          <Link to="/responsible-ai" className="hover:text-foreground">
            Responsible AI
          </Link>
          <button
            type="button"
            className="hover:text-foreground"
            onClick={() => (onHelp ? onHelp() : setHelpOpen(true))}
          >
            Help
          </button>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/settings" className="hover:text-foreground">
            Settings
          </Link>
        </nav>
      </div>
      {!onHelp && <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />}
    </footer>
  );
}

export function ResponsibleAiNote({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "rounded-md border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
    >
      <strong className="font-semibold text-foreground">Responsible AI:</strong> AI-generated
      content must be reviewed by users before workplace use.
    </p>
  );
}

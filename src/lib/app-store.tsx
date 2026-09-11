import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Availability = "available" | "away" | "busy";

export type Staff = {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  availability: Availability;
};

export type Activity = {
  id: string;
  type: string;
  description: string;
  at: string; // ISO timestamp, always generated at runtime
};

export type DirectMessage = {
  id: string;
  staffId: string;
  from: "me" | "them";
  text: string;
  at: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: string;
};

export type SessionUser = {
  name: string;
  email: string;
  role: string;
};

const SEED_STAFF: Staff[] = [
  {
    id: "s1",
    name: "Thandeka Mokoena",
    role: "Product Manager",
    department: "Product",
    email: "thandeka.mokoena@company.com",
    availability: "available",
  },
  {
    id: "s2",
    name: "Sipho Ndlovu",
    role: "Software Engineer",
    department: "Engineering",
    email: "sipho.ndlovu@company.com",
    availability: "busy",
  },
  {
    id: "s3",
    name: "Amara Okafor",
    role: "HR Business Partner",
    department: "People",
    email: "amara.okafor@company.com",
    availability: "available",
  },
  {
    id: "s4",
    name: "Daniel Peters",
    role: "Finance Analyst",
    department: "Finance",
    email: "daniel.peters@company.com",
    availability: "away",
  },
  {
    id: "s5",
    name: "Lerato Dube",
    role: "UX Designer",
    department: "Design",
    email: "lerato.dube@company.com",
    availability: "available",
  },
  {
    id: "s6",
    name: "Michael Chen",
    role: "Data Scientist",
    department: "Data",
    email: "michael.chen@company.com",
    availability: "busy",
  },
  {
    id: "s7",
    name: "Nomsa Khumalo",
    role: "Operations Lead",
    department: "Operations",
    email: "nomsa.khumalo@company.com",
    availability: "available",
  },
  {
    id: "s8",
    name: "James Botha",
    role: "Sales Executive",
    department: "Sales",
    email: "james.botha@company.com",
    availability: "away",
  },
];

const KEY = "awpa.state.v1";

type PersistedState = {
  availability: Availability;
  staff: Staff[];
  activities: Activity[];
  messages: DirectMessage[];
  chat: ChatMessage[];
};

const initialState: PersistedState = {
  availability: "available",
  staff: SEED_STAFF,
  activities: [],
  messages: [],
  chat: [],
};

type Store = PersistedState & {
  hydrated: boolean;
  user: SessionUser | null;
  logout: () => Promise<void>;
  setAvailability: (a: Availability) => void;
  setStaffAvailability: (id: string, a: Availability) => void;
  logActivity: (type: string, description: string) => void;
  sendMessage: (staffId: string, text: string) => void;
  addChat: (msg: Omit<ChatMessage, "id" | "at">) => void;
  clearChat: () => void;
};

const AppStoreContext = createContext<Store | null>(null);

export function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(initialState);
  const [storageReady, setStorageReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const hydrated = storageReady && authReady;

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toSessionUser(session?.user ?? null));
      setAuthReady(true);
    });
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(toSessionUser(session?.user ?? null));
      setAuthReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistedState>;
        setState({ ...initialState, ...parsed, staff: parsed.staff?.length ? parsed.staff : SEED_STAFF });
      }
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  const logActivity = useCallback((type: string, description: string) => {
    setState((s) => ({
      ...s,
      activities: [
        { id: newId(), type, description, at: new Date().toISOString() },
        ...s.activities,
      ].slice(0, 200),
    }));
  }, []);

  const login = useCallback(
    (email: string, name?: string) => {
      const derived =
        name?.trim() ||
        email
          .split("@")[0]
          .replace(/[._-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
      setState((s) => ({
        ...s,
        user: { name: derived, email, role: "Team Member" },
        activities: [
          {
            id: newId(),
            type: "Authentication",
            description: `Signed in as ${email}`,
            at: new Date().toISOString(),
          },
          ...s.activities,
        ],
      }));
    },
    [],
  );

  const logout = useCallback(() => {
    setState((s) => ({
      ...s,
      user: null,
      activities: [
        {
          id: newId(),
          type: "Authentication",
          description: "Signed out",
          at: new Date().toISOString(),
        },
        ...s.activities,
      ],
    }));
  }, []);

  const setAvailability = useCallback((a: Availability) => {
    setState((s) => ({
      ...s,
      availability: a,
      activities: [
        {
          id: newId(),
          type: "Availability",
          description: `Status changed to ${a}`,
          at: new Date().toISOString(),
        },
        ...s.activities,
      ],
    }));
  }, []);

  const setStaffAvailability = useCallback((id: string, a: Availability) => {
    setState((s) => ({
      ...s,
      staff: s.staff.map((m) => (m.id === id ? { ...m, availability: a } : m)),
    }));
  }, []);

  const sendMessage = useCallback((staffId: string, text: string) => {
    setState((s) => {
      const member = s.staff.find((m) => m.id === staffId);
      const now = new Date().toISOString();
      return {
        ...s,
        messages: [...s.messages, { id: newId(), staffId, from: "me", text, at: now }],
        activities: [
          {
            id: newId(),
            type: "Message",
            description: `Message sent to ${member?.name ?? "colleague"}`,
            at: now,
          },
          ...s.activities,
        ],
      };
    });
  }, []);

  const addChat = useCallback((msg: Omit<ChatMessage, "id" | "at">) => {
    setState((s) => ({
      ...s,
      chat: [...s.chat, { ...msg, id: newId(), at: new Date().toISOString() }],
    }));
  }, []);

  const clearChat = useCallback(() => {
    setState((s) => ({
      ...s,
      chat: [],
      activities: [
        {
          id: newId(),
          type: "THANDI",
          description: "Conversation cleared",
          at: new Date().toISOString(),
        },
        ...s.activities,
      ],
    }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...state,
      hydrated,
      login,
      logout,
      setAvailability,
      setStaffAvailability,
      logActivity,
      sendMessage,
      addChat,
      clearChat,
    }),
    [
      state,
      hydrated,
      login,
      logout,
      setAvailability,
      setStaffAvailability,
      logActivity,
      sendMessage,
      addChat,
      clearChat,
    ],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error("useAppStore must be used inside AppStoreProvider");
  return ctx;
}

export function relativeTime(iso: string, now: number = Date.now()) {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const s = Math.floor(diff / 1000);
  if (s < 45) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 1) return "Less than a minute ago";
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  const mo = Math.floor(d / 30);
  return `${mo} month${mo === 1 ? "" : "s"} ago`;
}

export function formatExact(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: "Available",
  away: "Away",
  busy: "Busy",
};

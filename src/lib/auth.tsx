import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { ProfileQuestionnaire } from "./tasks";

export type SupabaseUser = {
  id: string;
  email?: string;
  identities?: unknown[];
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token?: string;
  user: SupabaseUser;
};

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  session: AuthSession | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, details: SignUpDetails) => Promise<void>;
  signOut: () => Promise<void>;
};

export type SignUpDetails = {
  firstName: string;
  lastName: string;
};

type ProgressSnapshot = {
  done: Record<string, boolean>;
  docs: Record<string, boolean>;
};

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const AUTH_STORAGE_KEY = "predeparture.auth.v1";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    setSession(readSession());
    setLoading(false);
  }, []);

  const persistSession = useCallback((nextSession: AuthSession | null) => {
    setSession(nextSession);
    if (typeof window === "undefined") return;

    if (nextSession) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const response = await authRequest<{
        access_token: string;
        refresh_token?: string;
        user: SupabaseUser;
      }>("/auth/v1/token?grant_type=password", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      persistSession(response);
    },
    [persistSession],
  );

  const signUp = useCallback(
    async (email: string, password: string, details: SignUpDetails) => {
      const firstName = details.firstName.trim();
      const lastName = details.lastName.trim();
      const fullName = [firstName, lastName].filter(Boolean).join(" ");
      const response = await authRequest<{
        access_token?: string;
        refresh_token?: string;
        user: SupabaseUser;
      }>(
        `/auth/v1/signup?redirect_to=${encodeURIComponent(getAuthRedirectUrl())}`,
        {
          method: "POST",
          body: JSON.stringify({
            email,
            password,
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
            },
          }),
        },
      );

      if (!response.access_token && response.user.identities?.length === 0) {
        throw new Error("This email is already linked to an account. Try signing in instead.");
      }

      if (response.access_token) {
        persistSession({
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          user: response.user,
        });
      }
    },
    [persistSession],
  );

  const signOut = useCallback(async () => {
    if (session) {
      await authRequest("/auth/v1/logout", { method: "POST" }, session).catch(() => null);
    }
    persistSession(null);
  }, [persistSession, session]);

  const value = useMemo<AuthContextValue>(
    () => ({ configured, loading, session, signIn, signUp, signOut }),
    [configured, loading, session, signIn, signOut, signUp],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function getAuthRedirectUrl() {
  if (typeof window === "undefined") return "/auth";
  return `${window.location.origin}/auth`;
}

export async function getCloudProfile(session: AuthSession) {
  const rows = await restRequest<Array<{ questionnaire: ProfileQuestionnaire }>>(
    `/rest/v1/predeparture_profiles?user_id=eq.${session.user.id}&select=questionnaire&limit=1`,
    { method: "GET" },
    session,
  );

  return rows[0]?.questionnaire ?? null;
}

export async function saveCloudProfile(session: AuthSession, questionnaire: ProfileQuestionnaire) {
  await restRequest(
    "/rest/v1/predeparture_profiles?on_conflict=user_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        user_id: session.user.id,
        questionnaire,
        updated_at: new Date().toISOString(),
      }),
    },
    session,
  );
}

export async function getCloudProgress(session: AuthSession): Promise<ProgressSnapshot | null> {
  const rows = await restRequest<Array<ProgressSnapshot>>(
    `/rest/v1/predeparture_progress?user_id=eq.${session.user.id}&select=done,docs&limit=1`,
    { method: "GET" },
    session,
  );

  return rows[0] ?? null;
}

export async function saveCloudProgress(
  session: AuthSession,
  done: Record<string, boolean>,
  docs: Record<string, boolean>,
) {
  await restRequest(
    "/rest/v1/predeparture_progress?on_conflict=user_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        user_id: session.user.id,
        done,
        docs,
        updated_at: new Date().toISOString(),
      }),
    },
    session,
  );
}

function readSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

async function authRequest<T = unknown>(
  path: string,
  init: RequestInit,
  session?: AuthSession,
): Promise<T> {
  return supabaseRequest<T>(path, init, session);
}

export async function restRequest<T = unknown>(
  path: string,
  init: RequestInit,
  session: AuthSession,
): Promise<T> {
  return supabaseRequest<T>(path, init, session);
}

async function supabaseRequest<T = unknown>(
  path: string,
  init: RequestInit,
  session?: AuthSession,
): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase is not configured.");
  }

  const headers = new Headers(init.headers);
  headers.set("apikey", SUPABASE_ANON_KEY);
  headers.set("Content-Type", "application/json");
  if (session) headers.set("Authorization", `Bearer ${session.access_token}`);

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
}

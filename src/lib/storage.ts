import { useEffect, useState, useCallback } from "react";
import type { ProfileQuestionnaire } from "./tasks";

const PROFILE_KEY = "sac.profile.v1";
const PROGRESS_KEY = "sac.progress.v1";
const DOCS_KEY = "sac.docs.v1";

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function useProfile() {
  const [profile, setProfileState] = useState<ProfileQuestionnaire | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfileState(read<ProfileQuestionnaire>(PROFILE_KEY));
    setLoaded(true);
  }, []);

  const setProfile = useCallback((p: ProfileQuestionnaire | null) => {
    setProfileState(p);
    if (p) write(PROFILE_KEY, p);
    else if (typeof window !== "undefined") localStorage.removeItem(PROFILE_KEY);
  }, []);

  return { profile, setProfile, loaded };
}

export function useProgress() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDone(read<Record<string, boolean>>(PROGRESS_KEY) ?? {});
    setDocs(read<Record<string, boolean>>(DOCS_KEY) ?? {});
    setLoaded(true);
  }, []);

  const toggle = useCallback((id: string) => {
    setDone((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      write(PROGRESS_KEY, next);
      return next;
    });
  }, []);

  const toggleDoc = useCallback((taskId: string, docId: string) => {
    const key = `${taskId}.${docId}`;
    setDocs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      write(DOCS_KEY, next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setDone({});
    setDocs({});
    write(PROGRESS_KEY, {});
    write(DOCS_KEY, {});
  }, []);

  return { done, docs, toggle, toggleDoc, reset, loaded };
}

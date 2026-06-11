import { useEffect, useRef, useState, useCallback } from "react";
import {
  getCloudProfile,
  getCloudProgress,
  saveCloudProfile,
  saveCloudProgress,
  useAuth,
} from "./auth";
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

export function clearLocalRoadmap() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(DOCS_KEY);
}

export function hasLocalRoadmap() {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(PROFILE_KEY));
}

export function useProfile() {
  const { session } = useAuth();
  const [profile, setProfileState] = useState<ProfileQuestionnaire | null>(null);
  const [loaded, setLoaded] = useState(false);
  const profileRef = useRef<ProfileQuestionnaire | null>(null);

  useEffect(() => {
    const localProfile = read<ProfileQuestionnaire>(PROFILE_KEY);
    profileRef.current = localProfile;
    setProfileState(localProfile);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!session || !loaded) return;

    let cancelled = false;

    getCloudProfile(session)
      .then((cloudProfile) => {
        if (cancelled) return;

        if (cloudProfile) {
          profileRef.current = cloudProfile;
          setProfileState(cloudProfile);
          write(PROFILE_KEY, cloudProfile);
        } else if (profileRef.current) {
          void saveCloudProfile(session, profileRef.current);
        }
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [loaded, session]);

  const setProfile = useCallback(
    (p: ProfileQuestionnaire | null) => {
      profileRef.current = p;
      setProfileState(p);
      if (p) {
        write(PROFILE_KEY, p);
        if (session) void saveCloudProfile(session, p).catch(() => null);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem(PROFILE_KEY);
      }
    },
    [session],
  );

  return { profile, setProfile, loaded };
}

export function useProgress() {
  const { session } = useAuth();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);
  const doneRef = useRef<Record<string, boolean>>({});
  const docsRef = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const localDone = read<Record<string, boolean>>(PROGRESS_KEY) ?? {};
    const localDocs = read<Record<string, boolean>>(DOCS_KEY) ?? {};
    doneRef.current = localDone;
    docsRef.current = localDocs;
    setDone(localDone);
    setDocs(localDocs);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!session || !loaded) return;

    let cancelled = false;

    getCloudProgress(session)
      .then((cloudProgress) => {
        if (cancelled) return;

        if (cloudProgress) {
          doneRef.current = cloudProgress.done ?? {};
          docsRef.current = cloudProgress.docs ?? {};
          setDone(doneRef.current);
          setDocs(docsRef.current);
          write(PROGRESS_KEY, doneRef.current);
          write(DOCS_KEY, docsRef.current);
        } else {
          void saveCloudProgress(session, doneRef.current, docsRef.current);
        }
      })
      .catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [loaded, session]);

  const toggle = useCallback(
    (id: string) => {
      setDone((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        doneRef.current = next;
        write(PROGRESS_KEY, next);
        if (session) void saveCloudProgress(session, next, docsRef.current).catch(() => null);
        return next;
      });
    },
    [session],
  );

  const toggleDoc = useCallback(
    (taskId: string, docId: string) => {
      const key = `${taskId}.${docId}`;
      setDocs((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        docsRef.current = next;
        write(DOCS_KEY, next);
        if (session) void saveCloudProgress(session, doneRef.current, next).catch(() => null);
        return next;
      });
    },
    [session],
  );

  const reset = useCallback(() => {
    doneRef.current = {};
    docsRef.current = {};
    setDone({});
    setDocs({});
    write(PROGRESS_KEY, {});
    write(DOCS_KEY, {});
    if (session) void saveCloudProgress(session, {}, {}).catch(() => null);
  }, [session]);

  return { done, docs, toggle, toggleDoc, reset, loaded };
}

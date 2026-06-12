import { useEffect, useRef, useState, useCallback } from "react";
import {
  getCloudProfile,
  getCloudProgress,
  saveCloudProfile,
  saveCloudProgress,
  useAuth,
} from "./auth";
import type { Priority, ProfileQuestionnaire, TaskCategory } from "./tasks";

const PROFILE_KEY = "sac.profile.v1";
const PROGRESS_KEY = "sac.progress.v1";
const DOCS_KEY = "sac.docs.v1";
const CUSTOM_TASKS_DOC_KEY = "__predeparture_custom_tasks_v1";
const HIDDEN_TASKS_DOC_KEY = "__predeparture_hidden_tasks_v1";

export type CustomChecklistTask = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  phase: "before" | "after";
  recommendedDate: string;
  latestDate: string;
  priority: Priority;
};

type StoredDocs = Record<string, unknown>;

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

export function useProfile() {
  const { session } = useAuth();
  const [profile, setProfileState] = useState<ProfileQuestionnaire | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cloudLoaded, setCloudLoaded] = useState(false);
  const profileRef = useRef<ProfileQuestionnaire | null>(null);

  useEffect(() => {
    const localProfile = read<ProfileQuestionnaire>(PROFILE_KEY);
    profileRef.current = localProfile;
    setProfileState(localProfile);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!session) {
      setCloudLoaded(true);
      return;
    }

    let cancelled = false;
    setCloudLoaded(false);

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
      .catch(() => null)
      .finally(() => {
        if (!cancelled) setCloudLoaded(true);
      });

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

  return { profile, setProfile, loaded: loaded && cloudLoaded };
}

export function useProgress() {
  const { session } = useAuth();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [docs, setDocs] = useState<Record<string, boolean>>({});
  const [customTasks, setCustomTasks] = useState<CustomChecklistTask[]>([]);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const doneRef = useRef<Record<string, boolean>>({});
  const docsRef = useRef<Record<string, boolean>>({});
  const customTasksRef = useRef<CustomChecklistTask[]>([]);
  const hiddenTaskIdsRef = useRef<string[]>([]);

  useEffect(() => {
    const localDone = read<Record<string, boolean>>(PROGRESS_KEY) ?? {};
    const localDocs = parseStoredDocs(read<StoredDocs>(DOCS_KEY) ?? {});
    doneRef.current = localDone;
    docsRef.current = localDocs.docs;
    customTasksRef.current = localDocs.customTasks;
    hiddenTaskIdsRef.current = localDocs.hiddenTaskIds;
    setDone(localDone);
    setDocs(localDocs.docs);
    setCustomTasks(localDocs.customTasks);
    setHiddenTaskIds(localDocs.hiddenTaskIds);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!session || !loaded) return;

    let cancelled = false;

    getCloudProgress(session)
      .then((cloudProgress) => {
        if (cancelled) return;

        if (cloudProgress) {
          const cloudDocs = parseStoredDocs(cloudProgress.docs ?? {});
          doneRef.current = cloudProgress.done ?? {};
          docsRef.current = cloudDocs.docs;
          customTasksRef.current = cloudDocs.customTasks;
          hiddenTaskIdsRef.current = cloudDocs.hiddenTaskIds;
          setDone(doneRef.current);
          setDocs(docsRef.current);
          setCustomTasks(customTasksRef.current);
          setHiddenTaskIds(hiddenTaskIdsRef.current);
          write(PROGRESS_KEY, doneRef.current);
          write(DOCS_KEY, createStoredDocs(docsRef.current, customTasksRef.current, hiddenTaskIdsRef.current));
        } else {
          void saveCloudProgress(
            session,
            doneRef.current,
            createStoredDocs(docsRef.current, customTasksRef.current, hiddenTaskIdsRef.current),
          );
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
        if (session) {
          void saveCloudProgress(
            session,
            next,
            createStoredDocs(docsRef.current, customTasksRef.current, hiddenTaskIdsRef.current),
          ).catch(() => null);
        }
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
        write(DOCS_KEY, createStoredDocs(next, customTasksRef.current, hiddenTaskIdsRef.current));
        if (session) {
          void saveCloudProgress(
            session,
            doneRef.current,
            createStoredDocs(next, customTasksRef.current, hiddenTaskIdsRef.current),
          ).catch(() => null);
        }
        return next;
      });
    },
    [session],
  );

  const addCustomTask = useCallback(
    (task: Omit<CustomChecklistTask, "id">) => {
      const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const next = [...customTasksRef.current, { ...task, id }];
      customTasksRef.current = next;
      setCustomTasks(next);
      const storedDocs = createStoredDocs(docsRef.current, next, hiddenTaskIdsRef.current);
      write(DOCS_KEY, storedDocs);
      if (session) void saveCloudProgress(session, doneRef.current, storedDocs).catch(() => null);
    },
    [session],
  );

  const deleteCustomTask = useCallback(
    (id: string) => {
      const nextTasks = customTasksRef.current.filter((task) => task.id !== id);
      const nextDone = { ...doneRef.current };
      delete nextDone[id];
      customTasksRef.current = nextTasks;
      doneRef.current = nextDone;
      setCustomTasks(nextTasks);
      setDone(nextDone);
      const storedDocs = createStoredDocs(docsRef.current, nextTasks, hiddenTaskIdsRef.current);
      write(PROGRESS_KEY, nextDone);
      write(DOCS_KEY, storedDocs);
      if (session) void saveCloudProgress(session, nextDone, storedDocs).catch(() => null);
    },
    [session],
  );

  const hideTask = useCallback(
    (id: string) => {
      const next = hiddenTaskIdsRef.current.includes(id)
        ? hiddenTaskIdsRef.current
        : [...hiddenTaskIdsRef.current, id];
      hiddenTaskIdsRef.current = next;
      setHiddenTaskIds(next);
      const storedDocs = createStoredDocs(docsRef.current, customTasksRef.current, next);
      write(DOCS_KEY, storedDocs);
      if (session) void saveCloudProgress(session, doneRef.current, storedDocs).catch(() => null);
    },
    [session],
  );

  const restoreTask = useCallback(
    (id: string) => {
      const next = hiddenTaskIdsRef.current.filter((taskId) => taskId !== id);
      hiddenTaskIdsRef.current = next;
      setHiddenTaskIds(next);
      const storedDocs = createStoredDocs(docsRef.current, customTasksRef.current, next);
      write(DOCS_KEY, storedDocs);
      if (session) void saveCloudProgress(session, doneRef.current, storedDocs).catch(() => null);
    },
    [session],
  );

  const reset = useCallback(() => {
    doneRef.current = {};
    docsRef.current = {};
    setDone({});
    setDocs({});
    write(PROGRESS_KEY, {});
    const storedDocs = createStoredDocs({}, customTasksRef.current, hiddenTaskIdsRef.current);
    write(DOCS_KEY, storedDocs);
    if (session) void saveCloudProgress(session, {}, storedDocs).catch(() => null);
  }, [session]);

  return {
    done,
    docs,
    customTasks,
    hiddenTaskIds,
    toggle,
    toggleDoc,
    addCustomTask,
    deleteCustomTask,
    hideTask,
    restoreTask,
    reset,
    loaded,
  };
}

function parseStoredDocs(raw: StoredDocs) {
  const docs: Record<string, boolean> = {};

  for (const [key, value] of Object.entries(raw)) {
    if (key === CUSTOM_TASKS_DOC_KEY || key === HIDDEN_TASKS_DOC_KEY) continue;
    if (typeof value === "boolean") docs[key] = value;
  }

  return {
    docs,
    customTasks: parseCustomTasks(raw[CUSTOM_TASKS_DOC_KEY]),
    hiddenTaskIds: parseHiddenTaskIds(raw[HIDDEN_TASKS_DOC_KEY]),
  };
}

function createStoredDocs(
  docs: Record<string, boolean>,
  customTasks: CustomChecklistTask[],
  hiddenTaskIds: string[],
): StoredDocs {
  return {
    ...docs,
    [CUSTOM_TASKS_DOC_KEY]: customTasks,
    [HIDDEN_TASKS_DOC_KEY]: hiddenTaskIds,
  };
}

function parseCustomTasks(value: unknown): CustomChecklistTask[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isCustomChecklistTask);
}

function parseHiddenTaskIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is string => typeof id === "string");
}

function isCustomChecklistTask(value: unknown): value is CustomChecklistTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<CustomChecklistTask>;
  return (
    typeof task.id === "string" &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    typeof task.recommendedDate === "string" &&
    typeof task.latestDate === "string" &&
    (task.phase === "before" || task.phase === "after") &&
    ["visa", "housing", "insurance", "banking", "phone", "travel", "university", "scholarship"].includes(
      task.category ?? "",
    ) &&
    ["high", "medium", "low"].includes(task.priority ?? "")
  );
}

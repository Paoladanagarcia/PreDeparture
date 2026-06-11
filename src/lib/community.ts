import {
  restRequest,
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  type AuthSession,
} from "@/lib/auth";
import type { ProfileQuestionnaire } from "@/lib/tasks";

export type CommunityGroupKey = "general" | "housing" | "visa" | "arrival" | "money";

export type CommunityGroup = {
  key: CommunityGroupKey;
  name: string;
  description: string;
};

export type CommunityMessage = {
  id: string;
  cohort_key: string;
  group_key: CommunityGroupKey;
  user_id: string;
  display_name: string;
  body: string;
  created_at: string;
};

type MemberRow = {
  group_key: CommunityGroupKey;
};

type RealtimePayload = {
  event?: string;
  payload?: {
    data?: { record?: CommunityMessage };
    record?: CommunityMessage;
  };
};

export const COMMUNITY_GROUPS: CommunityGroup[] = [
  {
    key: "general",
    name: "General",
    description: "Ask quick questions and coordinate with your cohort.",
  },
  {
    key: "housing",
    name: "Housing",
    description: "Share leads, neighborhoods, lease questions and scam warnings.",
  },
  {
    key: "visa",
    name: "Visa & documents",
    description: "Compare timelines, required documents and embassy appointments.",
  },
  {
    key: "arrival",
    name: "Flights & arrival",
    description: "Plan arrival dates, airport transfers and first-day logistics.",
  },
  {
    key: "money",
    name: "Banking & insurance",
    description: "Discuss cards, bank setup, insurance and funding questions.",
  },
];

export function getCohort(profile: Pick<ProfileQuestionnaire, "university" | "startDate">) {
  const date = new Date(profile.startDate);
  const month = date.getMonth() + 1;
  const term = month >= 5 && month <= 11 ? "Fall" : "Spring";
  const year = Number.isNaN(date.getFullYear()) ? new Date().getFullYear() : date.getFullYear();
  const university = profile.university || "Your university";
  const label = `${university} - ${term} ${year}`;
  const key = `${slugify(university)}-${term.toLowerCase()}-${year}`;

  return { key, label, term: `${term} ${year}` };
}

export async function getJoinedGroups(session: AuthSession, cohortKey: string) {
  const rows = await restRequest<MemberRow[]>(
    `/rest/v1/predeparture_community_members?user_id=eq.${session.user.id}&cohort_key=eq.${encodeURIComponent(
      cohortKey,
    )}&select=group_key`,
    { method: "GET" },
    session,
  );

  return rows.map((row) => row.group_key);
}

export async function getMemberCounts(session: AuthSession, cohortKey: string) {
  const rows = await restRequest<MemberRow[]>(
    `/rest/v1/predeparture_community_members?cohort_key=eq.${encodeURIComponent(
      cohortKey,
    )}&select=group_key`,
    { method: "GET" },
    session,
  );

  return rows.reduce<Record<string, number>>((counts, row) => {
    counts[row.group_key] = (counts[row.group_key] ?? 0) + 1;
    return counts;
  }, {});
}

export async function joinCommunityGroup(
  session: AuthSession,
  cohortKey: string,
  groupKey: CommunityGroupKey,
  displayName: string,
) {
  await restRequest(
    "/rest/v1/predeparture_community_members?on_conflict=user_id,cohort_key,group_key",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        user_id: session.user.id,
        cohort_key: cohortKey,
        group_key: groupKey,
        display_name: displayName,
      }),
    },
    session,
  );
}

export async function listMessages(
  session: AuthSession,
  cohortKey: string,
  groupKey: CommunityGroupKey,
) {
  return restRequest<CommunityMessage[]>(
    `/rest/v1/predeparture_community_messages?cohort_key=eq.${encodeURIComponent(
      cohortKey,
    )}&group_key=eq.${groupKey}&select=*&order=created_at.asc&limit=80`,
    { method: "GET" },
    session,
  );
}

export async function sendMessage(
  session: AuthSession,
  cohortKey: string,
  groupKey: CommunityGroupKey,
  displayName: string,
  body: string,
) {
  const rows = await restRequest<CommunityMessage[]>(
    "/rest/v1/predeparture_community_messages",
    {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: session.user.id,
        cohort_key: cohortKey,
        group_key: groupKey,
        display_name: displayName,
        body,
      }),
    },
    session,
  );

  return rows[0];
}

export function subscribeToMessages(
  session: AuthSession,
  cohortKey: string,
  onMessage: (message: CommunityMessage) => void,
) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || typeof WebSocket === "undefined") {
    return () => undefined;
  }

  const socketUrl = SUPABASE_URL.replace(/^http/, "ws");
  const socket = new WebSocket(
    `${socketUrl}/realtime/v1/websocket?apikey=${encodeURIComponent(
      SUPABASE_ANON_KEY,
    )}&vsn=1.0.0`,
  );
  const topic = "realtime:public:predeparture_community_messages";
  let ref = 1;

  const send = (event: string, payload: unknown, topicName = topic) => {
    if (socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ topic: topicName, event, payload, ref: String(ref++) }));
  };

  socket.addEventListener("open", () => {
    send("phx_join", {
      access_token: session.access_token,
      config: {
        broadcast: { self: false },
        presence: { key: "" },
        postgres_changes: [
          {
            event: "INSERT",
            schema: "public",
            table: "predeparture_community_messages",
            filter: `cohort_key=eq.${cohortKey}`,
          },
        ],
      },
    });
  });

  socket.addEventListener("message", (event) => {
    try {
      const parsed = JSON.parse(event.data as string) as RealtimePayload;
      const record = parsed.payload?.data?.record ?? parsed.payload?.record;
      if (record) onMessage(record);
    } catch {
      // Ignore malformed realtime frames; polling keeps the chat usable.
    }
  });

  const heartbeat = window.setInterval(() => {
    send("heartbeat", {}, "phoenix");
  }, 25_000);

  return () => {
    window.clearInterval(heartbeat);
    socket.close();
  };
}

export function displayNameFromSession(session: AuthSession | null) {
  const emailPrefix = session?.user.email?.split("@")[0]?.trim();
  if (!emailPrefix) return "Student";
  return emailPrefix
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .slice(0, 32);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

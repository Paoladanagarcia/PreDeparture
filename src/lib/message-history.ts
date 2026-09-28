import type { CommunityMessage } from "./community";
export const MESSAGE_PAGE_SIZE = 80;
export type MessageCursor = Pick<CommunityMessage, "created_at" | "id">;
export function messageQuery(
  cohort: string,
  group: string,
  cursor?: MessageCursor,
  direction: "before" | "after" = "before",
) {
  const params = new URLSearchParams({
    cohort_key: `eq.${cohort}`,
    group_key: `eq.${group}`,
    select: "*",
    order: direction === "after" ? "created_at.asc,id.asc" : "created_at.desc,id.desc",
    limit: String(MESSAGE_PAGE_SIZE + 1),
  });
  if (cursor) {
    const op = direction === "after" ? "gt" : "lt";
    params.set(
      "or",
      `(created_at.${op}.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.${op}.${cursor.id}))`,
    );
  }
  return `/rest/v1/predeparture_community_messages?${params}`;
}
export function messagePage(rows: CommunityMessage[], direction: "before" | "after" = "before") {
  const page = rows.slice(0, MESSAGE_PAGE_SIZE);
  return {
    messages: direction === "before" ? page.reverse() : page,
    hasMore: rows.length > MESSAGE_PAGE_SIZE,
  };
}
export function mergeMessages(current: CommunityMessage[], incoming: CommunityMessage[]) {
  if (!incoming.length) return current;
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of incoming) byId.set(m.id, m);
  return [...byId.values()].sort(
    (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id),
  );
}

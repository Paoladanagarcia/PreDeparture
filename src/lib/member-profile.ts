import { restRequest, type AuthSession } from "./auth";

export type MemberProfile = {
  user_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string;
};
export type MemberDetails = Pick<MemberProfile, "first_name" | "last_name" | "bio">;
export function validateMemberDetails(details: MemberDetails): MemberDetails {
  const normalized = {
    first_name: details.first_name.trim(),
    last_name: details.last_name.trim(),
    bio: details.bio.trim(),
  };
  if (
    !normalized.first_name ||
    !normalized.last_name ||
    normalized.first_name.length > 60 ||
    normalized.last_name.length > 60 ||
    normalized.bio.length > 280
  )
    throw new Error("invalid-profile");
  return normalized;
}
export async function loadMemberProfiles(session: AuthSession, ids: string[]) {
  const unique = [...new Set(ids)]
    .filter((id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    .slice(0, 80);
  if (!unique.length) return [];
  return restRequest<MemberProfile[]>(
    `/rest/v1/predeparture_member_profiles?user_id=in.(${unique.join(",")})&select=user_id,first_name,last_name,full_name,bio`,
    { method: "GET" },
    session,
  );
}
export async function saveMemberProfile(session: AuthSession, details: MemberDetails) {
  const valid = validateMemberDetails(details);
  const rows = await restRequest<MemberProfile[]>(
    "/rest/v1/predeparture_member_profiles?on_conflict=user_id&select=user_id,first_name,last_name,full_name,bio",
    {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=representation" },
      body: JSON.stringify({ user_id: session.user.id, ...valid }),
    },
    session,
  );
  if (!rows[0]) throw new Error("profile-not-saved");
  return rows[0];
}
/** Signup metadata is a display fallback only, never an access-control decision. */
export function initialMemberDetails(session: AuthSession): MemberDetails {
  return {
    first_name: session.user.user_metadata?.first_name ?? "",
    last_name: session.user.user_metadata?.last_name ?? "",
    bio: "",
  };
}

/** Initialize new members without overwriting subsequent profile edits. */
export async function ensureMemberProfile(session: AuthSession) {
  const existing = await loadMemberProfiles(session, [session.user.id]);
  if (existing[0]) return existing[0];
  let details: MemberDetails;
  try {
    details = validateMemberDetails(initialMemberDetails(session));
  } catch {
    return null;
  }
  await restRequest(
    "/rest/v1/predeparture_member_profiles?on_conflict=user_id",
    {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({ user_id: session.user.id, ...details }),
    },
    session,
  );
  return (await loadMemberProfiles(session, [session.user.id]))[0] ?? null;
}

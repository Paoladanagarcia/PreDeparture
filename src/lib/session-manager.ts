/** Token claims only schedule refresh; the server always decides authorization. */
export type RefreshableSession = {
  access_token: string;
  refresh_token?: string;
  user: { id: string };
};
export class SessionExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "SessionExpiredError";
  }
}
export function tokenNeedsRefresh(token: string, now = Date.now()) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp !== "number" || exp * 1000 <= now + 60_000;
  } catch {
    return true;
  }
}
export function createSessionManager<S extends RefreshableSession>(options: {
  read: () => S | null;
  write: (session: S | null) => void;
  refresh: (session: S) => Promise<S>;
  lock: <T>(operation: () => Promise<T>) => Promise<T>;
}) {
  let pending: Promise<S> | null = null;
  async function valid(original: S, rejectedToken?: string): Promise<S> {
    const current = options.read();
    if (!current || current.user.id !== original.user.id) throw new SessionExpiredError();
    if (!tokenNeedsRefresh(current.access_token) && current.access_token !== rejectedToken)
      return current;
    if (pending) {
      await pending;
      return valid(original);
    }
    pending = options.lock(async () => {
      const latest = options.read();
      if (!latest || latest.user.id !== original.user.id) throw new SessionExpiredError();
      if (!tokenNeedsRefresh(latest.access_token) && latest.access_token !== rejectedToken)
        return latest;
      try {
        if (!latest.refresh_token) throw new SessionExpiredError();
        const next = await options.refresh(latest);
        // Do not resurrect a signed-out session or replace a new login.
        if (options.read()?.access_token !== latest.access_token) throw new SessionExpiredError();
        if (next.user.id !== latest.user.id) throw new SessionExpiredError();
        options.write(next);
        return next;
      } catch (error) {
        if (
          error instanceof SessionExpiredError &&
          options.read()?.access_token === latest.access_token
        )
          options.write(null);
        throw error;
      }
    });
    try {
      return await pending;
    } finally {
      pending = null;
    }
  }
  function invalidate(session: S) {
    if (options.read()?.access_token === session.access_token) options.write(null);
  }
  return { valid, invalidate };
}

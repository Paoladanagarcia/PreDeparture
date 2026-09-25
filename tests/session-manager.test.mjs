import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const code = ts.transpileModule(
  readFileSync(new URL("../src/lib/session-manager.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
).outputText;
const { createSessionManager, SessionExpiredError, tokenNeedsRefresh } = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
const token = (exp) =>
  `header.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.signature`;
const old = { access_token: token(1), refresh_token: "old-refresh", user: { id: "owner" } };
const renewed = {
  access_token: token(Date.now() / 1000 + 3600),
  refresh_token: "new-refresh",
  user: { id: "owner" },
};
function fixture(refresh, current = old) {
  let value = current;
  const manager = createSessionManager({
    read: () => value,
    write: (s) => {
      value = s;
    },
    refresh,
    lock: (fn) => fn(),
  });
  return {
    manager,
    read: () => value,
    write: (s) => {
      value = s;
    },
  };
}
test("expired and near-expiry sessions renew; valid sessions do not", async () => {
  assert.equal(tokenNeedsRefresh(old.access_token), true);
  assert.equal(tokenNeedsRefresh(token(Date.now() / 1000 + 30)), true);
  const f = fixture(async () => {
    throw Error("should not refresh");
  }, renewed);
  assert.equal(await f.manager.valid(renewed), renewed);
});
test("profile and community requests share one refresh and persist rotated tokens", async () => {
  let calls = 0;
  const f = fixture(async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 5));
    return renewed;
  });
  const results = await Promise.all(Array.from({ length: 8 }, () => f.manager.valid(old)));
  assert.equal(calls, 1);
  assert.ok(results.every((x) => x === renewed));
  assert.equal(f.read().refresh_token, "new-refresh");
});
test("stale consumers use the already refreshed session", async () => {
  const f = fixture(async () => {
    throw Error("unexpected");
  }, renewed);
  assert.equal(await f.manager.valid(old), renewed);
});
test("server rejection forces renewal even with an unexpired local token", async () => {
  const newer = { ...renewed, access_token: token(Date.now() / 1000 + 7200) };
  const f = fixture(async () => newer, renewed);
  assert.equal(await f.manager.valid(renewed, renewed.access_token), newer);
});
test("revoked refresh token clears session; transient network errors preserve it", async () => {
  const revoked = fixture(async () => {
    throw new SessionExpiredError();
  });
  await assert.rejects(revoked.manager.valid(old), SessionExpiredError);
  assert.equal(revoked.read(), null);
  const offline = fixture(async () => {
    throw new TypeError("offline");
  });
  await assert.rejects(offline.manager.valid(old));
  assert.equal(offline.read(), old);
});
test("logout during refresh cannot resurrect session", async () => {
  let finish;
  const f = fixture(
    () =>
      new Promise((r) => {
        finish = r;
      }),
  );
  const pending = f.manager.valid(old);
  f.write(null);
  finish(renewed);
  await assert.rejects(pending, SessionExpiredError);
  assert.equal(f.read(), null);
});
test("different-account login cannot be overwritten by an older refresh", async () => {
  let finish;
  const f = fixture(
    () =>
      new Promise((r) => {
        finish = r;
      }),
  );
  const pending = f.manager.valid(old);
  const other = { ...renewed, user: { id: "other" } };
  f.write(other);
  finish(renewed);
  await assert.rejects(pending, SessionExpiredError);
  assert.equal(f.read(), other);
  await assert.rejects(f.manager.valid(old));
});
test("a session without a refresh token expires cleanly", async () => {
  const f = fixture(async () => renewed, { ...old, refresh_token: undefined });
  await assert.rejects(f.manager.valid(old), SessionExpiredError);
  assert.equal(f.read(), null);
});

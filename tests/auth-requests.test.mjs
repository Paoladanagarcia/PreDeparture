import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
    },
  }).outputText;
const url = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const managerUrl = url(compile("../src/lib/session-manager.ts"));
let source = compile("../src/lib/auth.tsx")
  .replace(/import\s*\{[^}]+\}\s*from "react";/, "const createContext = () => null;")
  .replace('"./session-manager"', JSON.stringify(managerUrl))
  .replace("import.meta.env.VITE_SUPABASE_URL", '"https://auth-fixture.invalid"')
  .replace("import.meta.env.VITE_SUPABASE_ANON_KEY", '"public-test-key"');
const { restRequest } = await import(url(source));
const stored = new Map();
globalThis.window = new EventTarget();
globalThis.localStorage = {
  getItem: (k) => stored.get(k) ?? null,
  setItem: (k, v) => stored.set(k, v),
  removeItem: (k) => stored.delete(k),
};
const token = (exp) => `head.${Buffer.from(JSON.stringify({ exp })).toString("base64url")}.sig`;
const old = { access_token: token(1), refresh_token: "old", user: { id: "owner" } };
const fresh = {
  access_token: token(Date.now() / 1000 + 3600),
  refresh_token: "new",
  user: { id: "owner" },
};
const reset = (s) => stored.set("predeparture.auth.v1", JSON.stringify(s));
test("expired session renews before loading real profile/community request paths", async () => {
  reset(old);
  let refreshes = 0;
  const paths = [];
  globalThis.fetch = async (url, options) => {
    if (url.includes("grant_type=refresh_token")) {
      refreshes++;
      assert.equal(JSON.parse(options.body).refresh_token, "old");
      return Response.json(fresh);
    }
    paths.push(url);
    assert.equal(options.headers.get("Authorization"), `Bearer ${fresh.access_token}`);
    return Response.json([{ ok: true }]);
  };
  await Promise.all(
    ["/rest/v1/predeparture_member_profiles", "/rest/v1/predeparture_community_members"].map((p) =>
      restRequest(p, { method: "GET" }, old),
    ),
  );
  assert.equal(refreshes, 1);
  assert.equal(paths.length, 2);
  assert.equal(JSON.parse(stored.get("predeparture.auth.v1")).refresh_token, "new");
});
test("401 retries once after refresh without changing the profile save payload", async () => {
  reset(fresh);
  let count = 0;
  const newer = { ...fresh, access_token: token(Date.now() / 1000 + 7200) };
  const body = JSON.stringify({ first_name: "Élodie", last_name: "Dupont" });
  globalThis.fetch = async (url, options) => {
    if (url.includes("grant_type=refresh_token")) return Response.json(newer);
    assert.equal(options.body, body);
    count++;
    return count === 1
      ? Response.json({ message: "JWT expired" }, { status: 401 })
      : Response.json([{ full_name: "Élodie Dupont" }]);
  };
  assert.equal(
    (await restRequest("/rest/v1/predeparture_member_profiles", { method: "POST", body }, fresh))[0]
      .full_name,
    "Élodie Dupont",
  );
  assert.equal(count, 2);
});
test("non-auth server errors do not refresh or retry writes", async () => {
  reset(fresh);
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ message: "unavailable" }, { status: 503 });
  };
  await assert.rejects(
    restRequest("/rest/v1/predeparture_member_profiles", { method: "POST", body: "{}" }, fresh),
  );
  assert.equal(calls, 1);
  assert.ok(stored.has("predeparture.auth.v1"));
});
test("invalid refresh clears the stale displayed session", async () => {
  reset(old);
  globalThis.fetch = async () =>
    Response.json({ message: "Invalid refresh token" }, { status: 400 });
  await assert.rejects(
    restRequest("/rest/v1/predeparture_member_profiles", { method: "GET" }, old),
    { name: "SessionExpiredError" },
  );
  assert.equal(stored.has("predeparture.auth.v1"), false);
});

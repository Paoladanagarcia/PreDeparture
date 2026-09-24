import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = ts.transpileModule(
  readFileSync(new URL("../src/lib/member-profile.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } },
).outputText;
const requests = [];
let response = [];
globalThis.__memberProfileRequest = async (...args) => {
  requests.push(args);
  return response;
};
const code = source.replace(
  /import .* from "\.\/auth";/,
  "const restRequest = globalThis.__memberProfileRequest;",
);
const { validateMemberDetails, saveMemberProfile, loadMemberProfiles, ensureMemberProfile } =
  await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const id = "c05941d0-480a-4103-abcb-06c547401001";
const session = { user: { id }, access_token: "test-only" };
test("preserves complete compound surnames and accented names", () => {
  assert.deepEqual(
    validateMemberDetails({
      first_name: " Élodie ",
      last_name: " de la García Dupont ",
      bio: " Bonjour ",
    }),
    { first_name: "Élodie", last_name: "de la García Dupont", bio: "Bonjour" },
  );
});
test("rejects blank names and excessive bio before sending", async () => {
  for (const details of [
    { first_name: " ", last_name: "A", bio: "" },
    { first_name: "A", last_name: "", bio: "" },
    { first_name: "A", last_name: "B", bio: "x".repeat(281) },
  ]) {
    const before = requests.length;
    await assert.rejects(saveMemberProfile(session, details));
    assert.equal(requests.length, before);
  }
});
test("save uses signed-in identity and only explicit profile fields", async () => {
  response = [{ user_id: id, first_name: "A", last_name: "B", full_name: "A B", bio: "" }];
  await saveMemberProfile(session, {
    ...response[0],
    user_id: "attacker",
    email: "private@example.com",
  });
  assert.deepEqual(JSON.parse(requests.at(-1)[1].body), {
    user_id: id,
    first_name: "A",
    last_name: "B",
    bio: "",
  });
});
test("profile lookup discards invalid identifiers and deduplicates authors", async () => {
  response = [];
  await loadMemberProfiles(session, [id, id, "bad),or=(true", "-".repeat(36)]);
  assert.ok(requests.at(-1)[0].includes(`in.(${id})`));
  assert.ok(!requests.at(-1)[0].includes("email"));
});
test("initialization never overwrites an edited profile", async () => {
  response = [{ user_id: id, full_name: "Edited Name" }];
  const before = requests.length;
  assert.equal((await ensureMemberProfile(session)).full_name, "Edited Name");
  assert.equal(requests.length, before + 1);
  assert.equal(requests.at(-1)[1].method, "GET");
});

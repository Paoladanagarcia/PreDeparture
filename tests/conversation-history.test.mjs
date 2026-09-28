import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const url = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const { messageQuery, messagePage, mergeMessages } = await import(
  url(compile("../src/lib/message-history.ts"))
);
const { selectConversationOwner, readConversation, saveConversation } = await import(
  url(compile("../src/lib/assistant-memory.ts"))
);
const rows = Array.from({ length: 185 }, (_, i) => ({
  id: String(i).padStart(5, "0"),
  created_at: "2026-09-27T12:00:00+00:00",
  body: `message ${i}`,
}));
test("history begins at newest 80 and traverses more than two pages without timestamp-tie omissions", () => {
  let first = messagePage([...rows].reverse());
  assert.equal(first.messages[0].id, "00105");
  assert.equal(first.messages.at(-1).id, "00184");
  let all = first.messages;
  while (first.hasMore) {
    const cursor = all[0];
    const q = new URL(messageQuery("a cohort", "general", cursor), "https://example.test")
      .searchParams;
    assert.equal(q.get("order"), "created_at.desc,id.desc");
    assert.ok(q.get("or").includes(`id.lt.${cursor.id}`));
    first = messagePage(rows.filter((m) => m.id < cursor.id).reverse());
    all = mergeMessages(all, first.messages);
  }
  assert.deepEqual(all, rows);
});
test("polling pages merge with history and realtime without removing recent messages or duplicating rows", () => {
  let history = rows.slice(0, 100);
  const q = new URL(messageQuery("cohort", "visa", rows[99], "after"), "https://example.test")
    .searchParams;
  assert.equal(q.get("order"), "created_at.asc,id.asc");
  assert.ok(q.get("or").includes("id.gt.00099"));
  history = mergeMessages(history, [rows[184]]); // realtime ahead of polling
  const page = messagePage(rows.slice(100), "after");
  assert.equal(page.hasMore, true);
  history = mergeMessages(history, page.messages);
  history = mergeMessages(history, messagePage(rows.slice(180), "after").messages);
  assert.deepEqual(history, rows);
  assert.strictEqual(mergeMessages(history, []), history);
});
test("empty and exact-size final pages correctly stop pagination", () => {
  assert.equal(messagePage([]).hasMore, false);
  assert.equal(messagePage(rows.slice(0, 80)).hasMore, false);
  assert.equal(messagePage(rows.slice(0, 81)).hasMore, true);
});
test("assistant conversation survives route reuse but is cleared on account changes and reset", () => {
  selectConversationOwner("alice");
  const saved = [
    { role: "user", content: "Hello" },
    { role: "assistant", content: "Hi" },
  ];
  saveConversation("alice", saved);
  selectConversationOwner("alice");
  assert.deepEqual(readConversation(), saved);
  selectConversationOwner("guest");
  assert.deepEqual(readConversation(), []);
  saveConversation("alice", saved); // a stale request cannot leak across users
  assert.deepEqual(readConversation(), []);
  saveConversation("guest", saved);
  saveConversation("guest", []);
  assert.deepEqual(readConversation(), []);
});

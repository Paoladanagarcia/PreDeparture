import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(new URL("../src/lib/next-actions.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { planNextActions, startedKey, actionReason } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const date = (value) => new Date(`${value}T12:00:00`);
const arrival = date("2026-12-01");
const today = date("2026-11-01");
const task = (id, extra = {}) => ({
  id,
  title: id,
  description: "",
  category: "housing",
  phase: "before",
  recommendedDaysBefore: 40,
  latestDaysBefore: 20,
  priority: "medium",
  ...extra,
});

test("returns three actionable tasks, excluding completed and waiting tasks", () => {
  const tasks = [
    task("done"),
    task("housing-secure"),
    task("housing-search"),
    task("b"),
    task("c"),
    task("d"),
  ];
  const p = planNextActions(tasks, arrival, { done: true }, {}, today);
  assert.equal(p.next.length, 3);
  assert(!p.next.some((d) => ["done", "housing-secure"].includes(d.task.id)));
  assert.equal(p.decisions.find((d) => d.task.id === "housing-secure").status, "blocked");
});

test("dependency unlocks on completion and blocks again when reopened", () => {
  const tasks = [
    task("scholarships-research"),
    task("scholarships-prepare"),
    task("scholarships-submit"),
  ];
  const p = planNextActions(tasks, arrival, { "scholarships-research": true }, {}, today);
  assert.equal(p.next[0].task.id, "scholarships-prepare");
  const next = planNextActions(
    tasks,
    arrival,
    { "scholarships-research": true, "scholarships-prepare": true },
    {},
    today,
  );
  assert.equal(next.next[0].task.id, "scholarships-submit");
  const reopened = planNextActions(
    tasks,
    arrival,
    { "scholarships-research": true, "scholarships-prepare": false },
    {},
    today,
  );
  assert.equal(reopened.decisions[2].status, "blocked");
});

test("hidden prerequisites do not block and existing completions always win", () => {
  assert.equal(planNextActions([task("housing-secure")], arrival, {}, {}, today).next.length, 1);
  const p = planNextActions(
    [task("housing-search"), task("housing-secure")],
    arrival,
    { "housing-secure": true },
    {},
    today,
  );
  assert.equal(p.decisions[1].status, "done");
});

test("moving arrival earlier recalculates dates, order and urgency", () => {
  const tasks = [
    task("started", { recommendedDaysBefore: 10, latestDaysBefore: 1 }),
    task("urgent", { latestDaysBefore: 25 }),
  ];
  const docs = { [startedKey("started")]: true };
  const later = planNextActions(tasks, date("2027-01-01"), {}, docs, today);
  const earlier = planNextActions(tasks, arrival, {}, docs, today);
  assert.equal(later.next[0].task.id, "started");
  assert.equal(later.urgentCount, 0);
  assert.equal(earlier.next[0].task.id, "urgent");
  assert.equal(earlier.urgentCount, 1);
  assert.equal(earlier.next[0].daysToLatest, 5);
  assert.match(
    actionReason(earlier.next[0], true, (t) => t.title),
    /5 jour/,
  );
});

test("progress survives JSON round-trip, done overrides it, reset clears it", () => {
  const docs = JSON.parse(JSON.stringify({ [startedKey("a")]: true, "visa-docs.passport": true }));
  assert.equal(
    planNextActions([task("a")], arrival, {}, docs, today).decisions[0].status,
    "in-progress",
  );
  assert.equal(
    planNextActions([task("a")], arrival, { a: true }, docs, today).decisions[0].status,
    "done",
  );
  assert.equal(planNextActions([task("a")], arrival, {}, {}, today).decisions[0].status, "todo");
});

test("after-arrival steps become actionable only on arrival", () => {
  const tasks = [
    task("after", { phase: "after", recommendedDaysBefore: -2, latestDaysBefore: -7 }),
  ];
  assert.equal(planNextActions(tasks, arrival, {}, {}, today).next.length, 0);
  assert.equal(planNextActions(tasks, arrival, {}, {}, arrival).next.length, 1);
});

test("overdue before near-term; completed and empty plans have no urgency", () => {
  const tasks = [task("soon", { latestDaysBefore: 25 }), task("overdue", { latestDaysBefore: 40 })];
  const p = planNextActions(tasks, arrival, {}, {}, today);
  assert.equal(p.next[0].task.id, "overdue");
  assert.match(
    actionReason(p.next[0], true, (t) => t.title),
    /dépassée/,
  );
  assert.equal(
    planNextActions(tasks, arrival, { soon: true, overdue: true }, {}, today).urgentCount,
    0,
  );
  assert.deepEqual(planNextActions([], arrival, {}, {}, today).next, []);
  assert.deepEqual(planNextActions(tasks, new Date("invalid"), {}, {}, today).next, []);
});

for (const zone of ["America/Los_Angeles", "Europe/Paris", "Pacific/Auckland"]) {
  test(`urgency uses calendar days across DST in ${zone}`, () => {
    const old = process.env.TZ;
    process.env.TZ = zone;
    try {
      for (const [start, end] of [
        ["2026-03-07", "2026-03-09"],
        ["2026-10-31", "2026-11-02"],
        ["2026-12-31", "2027-01-02"],
      ]) {
        const p = planNextActions(
          [task("custom-test", { latestDaysBefore: 0 })],
          date(end),
          {},
          {},
          date(start),
        );
        assert.equal(p.next[0].daysToLatest, 2);
      }
    } finally {
      if (old === undefined) delete process.env.TZ;
      else process.env.TZ = old;
    }
  });
}

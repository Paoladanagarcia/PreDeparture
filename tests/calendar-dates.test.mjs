import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

// Use the existing TypeScript dependency; no additional test runtime is required.
const source = readFileSync(new URL("../src/lib/tasks.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
const { parseCalendarDate, toCalendarDate, dateMinusDays, formatDate } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

for (const timezone of ["America/Los_Angeles", "Europe/Paris", "Pacific/Auckland"]) {
  test(`calendar dates and localized display: ${timezone}`, () => {
    const previousTimezone = process.env.TZ;
    process.env.TZ = timezone;
    try {
      for (const day of ["2026-12-16", "2026-03-08", "2026-11-01", "2027-01-01"]) {
        assert.equal(toCalendarDate(parseCalendarDate(day)), day);
      }
      assert.equal(toCalendarDate(dateMinusDays(parseCalendarDate("2026-03-09"), 1)), "2026-03-08");
      assert.equal(toCalendarDate(dateMinusDays(parseCalendarDate("2026-11-02"), 1)), "2026-11-01");
      assert.equal(formatDate(parseCalendarDate("2026-12-16"), "en"), "Dec 16, 2026");
      assert.match(formatDate(parseCalendarDate("2026-12-16"), "fr"), /16 déc/);
      assert.equal(parseCalendarDate("2027-01-01").getFullYear(), 2027);
    } finally {
      if (previousTimezone === undefined) delete process.env.TZ;
      else process.env.TZ = previousTimezone;
    }
  });
}

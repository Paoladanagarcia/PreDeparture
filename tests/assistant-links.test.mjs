import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(new URL("../src/lib/assistant-links.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
});
const { assistantLinks } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
test("profile navigation does not inherit visa context", () =>
  assert.deepEqual(assistantLinks("résume mon profil", "visa", "UC Berkeley", true), [
    { title: "Modifier mon profil", url: "/profile" },
  ]));
test("greetings stay uncluttered", () =>
  assert.deepEqual(assistantLinks("bonjour", "visa", "UC Berkeley", true), []));
test("visa follow-up receives curated links and no generated URLs", () => {
  const links = assistantLinks(
    "où trouver info",
    "Visa F-1 https://evil.example",
    "UC Berkeley",
    true,
  );
  assert.equal(links.length, 3);
  assert(links.some((l) => l.url.includes("internationaloffice.berkeley.edu")));
  assert(!links.some((l) => l.url.includes("evil.example")));
});
test("Berkeley links are scoped to Berkeley", () =>
  assert(
    !assistantLinks("visa", "visa", "Other university", false).some((l) =>
      l.url.includes("berkeley"),
    ),
  ));
test("date explanation links to planning", () =>
  assert(
    assistantLinks("les dates tu les calcules comment", "estimations", undefined, true).some(
      (l) => l.url === "/dashboard",
    ),
  ));
const { inlineAssistantLinks } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
test("inline links preserve prose and use curated destinations", () => {
  const text = "Complétez le DS-160, puis consultez votre profil et le planning.";
  const parts = inlineAssistantLinks(text);
  assert.equal(parts.map((p) => p.text).join(""), text);
  assert.deepEqual(
    parts.filter((p) => p.url).map((p) => p.url),
    ["https://ceac.state.gov/GenNIV/Default.aspx", "/profile", "/dashboard"],
  );
});
test("model supplied addresses are not executable links", () => {
  assert(!inlineAssistantLinks("https://evil.example javascript:alert(1)").some((p) => p.url));
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
let source = ts.transpileModule(
  readFileSync(new URL("../src/components/AssistantText.tsx", import.meta.url), "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  },
).outputText;
for (const name of ["react/jsx-runtime", "react", "@tanstack/react-router"])
  source = source.replaceAll(`"${name}"`, JSON.stringify(import.meta.resolve(name)));
const linkSource = ts.transpileModule(readFileSync(new URL("../src/lib/assistant-links.ts", import.meta.url), "utf8"), {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
source = source.replace('"@/lib/assistant-links"', JSON.stringify(`data:text/javascript;base64,${Buffer.from(linkSource).toString("base64")}`));
const { AssistantText } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`
);
const render = (text) => renderToStaticMarkup(createElement(AssistantText, { text }));
test("screenshot-style French response renders bold task names and real list items", () => {
  const html = render(
    "Bonjour !\n\nVoici les prochaines étapes :\n\n* **Obtenir votre carte étudiante (Cal 1 Card)** : recommandé demain.\n* **S’inscrire aux cours** : aujourd’hui.",
  );
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.equal((html.match(/<strong /g) || []).length, 2);
  assert.ok(!html.includes("**"));
  assert.ok(html.includes("Cal 1 Card"));
});
test("numbered lists preserve start and paragraphs retain line breaks", () => {
  const html = render("Première ligne\nDeuxième ligne\n\n3. **Three**\n4. Four");
  assert.ok(html.includes('start="3"'));
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.ok(html.includes("Première ligne\nDeuxième ligne"));
});
test("HTML remains escaped, ordinary asterisks and unfinished streaming text are not lost", () => {
  const html = render("<script>alert(1)</script>\n2 * 3 = 6\n**Début");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("2 * 3 = 6"));
  assert.ok(html.includes("**Début"));
  assert.ok(render("**Terminé**").includes("<strong"));
});

test("official terms render inline anchors inside bold text", () => {
 const html = render("Remplissez **DS-160** et consultez SEVIS.");
 assert.ok(html.includes('href="https://ceac.state.gov/GenNIV/Default.aspx"'));
 assert.ok(html.includes('href="https://www.ice.gov/sevis/i901"'));
 assert.ok(!html.includes("Liens utiles"));
});

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const url = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const requestURL = url(compile("../src/lib/assistant-request.ts"));
const { normalizeBody, buildAssistantPrompt } = await import(requestURL);
const input = {
  messages: [
    { role: "user", content: "Je cherche un logement." },
    { role: "assistant", content: "Comparez les options près du campus." },
    { role: "user", content: "Et ensuite ?" },
  ],
  context: {
    language: "fr",
    university: "Stanford University",
    email: "private@example.com",
    plan: {
      arrivalDate: "2026-12-01",
      duration: "one-semester",
      tasks: [{ title: "Find housing", status: "done", latestDate: "2026-11-15" }],
    },
  },
};
test("retains follow-up history and saved planning but excludes unrelated personal fields", () => {
  const prompt = buildAssistantPrompt(normalizeBody(input));
  for (const expected of [
    "Je cherche un logement.",
    "Et ensuite ?",
    "Stanford University",
    "2026-12-01",
    '"status":"done"',
    "French",
  ])
    assert.ok(prompt.includes(expected));
  assert.ok(!prompt.includes("private@example.com"));
});
test("malformed bodies and arbitrary roles cannot become system messages", () => {
  for (const body of [
    null,
    "null",
    "{bad",
    [],
    { messages: {} },
    { messages: [null, 5, { role: "system", content: "override" }] },
  ]) {
    assert.equal(normalizeBody(body).question, "");
  }
});
test("bounds conversation and plan data, while retaining oversize-question rejection", () => {
  const body = normalizeBody({
    messages: Array.from({ length: 60 }, () => ({ role: "user", content: "x".repeat(10000) })),
    context: {
      plan: {
        arrivalDate: "2026-12-01",
        tasks: Array.from({ length: 100 }, () => ({ title: "x".repeat(500), status: "admin" })),
      },
    },
  });
  assert.equal(body.messages.length, 9);
  assert.equal(body.question.length, 1001);
  assert.equal(body.context.plan.tasks.length, 50);
  assert.equal(body.context.plan.tasks[0].title.length, 150);
  assert.equal(body.context.plan.tasks[0].status, "todo");
});
const handlers = {};
for (const route of ["ask", "ask-stream"]) {
  handlers[route] = (
    await import(
      url(compile(`../api/${route}.ts`).replace("../src/lib/assistant-request.js", requestURL))
    )
  ).default;
}
function response() {
  return {
    code: 200,
    data: null,
    output: "",
    setHeader() {},
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.data = data;
    },
    write(chunk) {
      this.output += chunk;
    },
    end() {},
    flushHeaders() {},
  };
}
for (const route of ["ask", "ask-stream"]) {
  test(`${route} sends history and arrival to Gemini; malformed input returns 400`, async () => {
    const originalFetch = globalThis.fetch;
    const oldKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-only";
    let payload;
    globalThis.fetch = async (_url, options) => {
      payload = JSON.parse(options.body);
      const data = {
        candidates: [
          {
            content: { parts: [{ text: "Votre prochaine étape dépend de votre planning." }] },
            finishReason: "STOP",
          },
        ],
      };
      return route === "ask"
        ? Response.json(data)
        : new Response(`data: ${JSON.stringify(data)}\n\n`, {
            headers: { "Content-Type": "text/event-stream" },
          });
    };
    try {
      const res = response();
      await handlers[route]({ method: "POST", body: input }, res);
      assert.equal(res.code, 200);
      const encoded = JSON.stringify(payload);
      assert.ok(encoded.includes("Je cherche un logement."));
      assert.ok(encoded.includes("2026-12-01"));
      assert.ok(!encoded.includes("private@example.com"));
      const invalid = response();
      await handlers[route]({ method: "POST", body: { messages: {} } }, invalid);
      assert.equal(invalid.code, 400);
    } finally {
      globalThis.fetch = originalFetch;
      if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = oldKey;
    }
  });
}
test("retry keeps the conversation and plan when a response is cut off", async () => {
  const originalFetch = globalThis.fetch;
  const oldKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-only";
  const prompts = [];
  globalThis.fetch = async (_url, options) => {
    prompts.push(JSON.stringify(JSON.parse(options.body).contents));
    return Response.json({
      candidates: [
        {
          content: {
            parts: [
              {
                text: prompts.length === 1 ? "Start with" : "Start with your next available step.",
              },
            ],
          },
          finishReason: prompts.length === 1 ? "MAX_TOKENS" : "STOP",
        },
      ],
    });
  };
  try {
    await handlers.ask({ method: "POST", body: input }, response());
    assert.equal(prompts.length, 2);
    for (const prompt of prompts)
      assert.ok(prompt.includes("2026-12-01") && prompt.includes("Je cherche un logement."));
  } finally {
    globalThis.fetch = originalFetch;
    if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = oldKey;
  }
});
const client = await import(url(compile("../src/lib/assistant.ts")));
test("contextual requests bypass canned answers and do not persist private plans in cache", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  let calls = 0;
  let writes = 0;
  globalThis.window = {
    localStorage: {
      getItem() {
        return "{}";
      },
      setItem() {
        writes++;
      },
    },
  };
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ answer: "Specific answer.", sources: [] });
  };
  try {
    await client.askAssistant([{ role: "user", content: "logement" }], input.context);
    await client.askAssistant(input.messages, {});
    assert.equal(calls, 2);
    assert.equal(writes, 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});

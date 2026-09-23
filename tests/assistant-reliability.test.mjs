import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const compile = (path) =>
  ts.transpileModule(readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
const url = (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`;
const lifetimeURL = url(compile("../src/lib/assistant-lifetime.ts"));
const { requestLifetime } = await import(lifetimeURL);
const client = await import(
  url(compile("../src/lib/assistant.ts").replace("./assistant-lifetime", lifetimeURL))
);
const requestURL = url(compile("../src/lib/assistant-request.ts"));
const handler = (
  await import(
    url(
      compile("../api/ask-stream.ts")
        .replace("../src/lib/assistant-request.js", requestURL)
        .replace("../src/lib/assistant-lifetime.js", lifetimeURL),
    )
  )
).default;
const messages = [{ role: "user", content: "Help me plan my arrival." }];
const framed = (events) =>
  new Response(events.map((e) => JSON.stringify(e) + "\n").join(""), {
    headers: { "Content-Type": "application/x-ndjson" },
  });

test("request budget aborts and can be disposed without a later timeout", async () => {
  const budget = requestLifetime(undefined, 5);
  await new Promise((resolve) => budget.signal.addEventListener("abort", resolve, { once: true }));
  assert.equal(budget.signal.reason.name, "TimeoutError");
  budget.dispose();
  const cancelled = requestLifetime(undefined, 5);
  cancelled.dispose();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(cancelled.signal.aborted, false);
});
test("stop cancels the underlying fetch", async () => {
  const original = globalThis.fetch;
  const controller = new AbortController();
  let signal;
  globalThis.fetch = (_url, options) => {
    signal = options.signal;
    return new Promise((_, reject) =>
      signal.addEventListener("abort", () => reject(signal.reason), { once: true }),
    );
  };
  try {
    const pending = client.askAssistantStream(
      messages,
      {},
      { signal: controller.signal, onUpdate() {} },
    );
    controller.abort();
    await assert.rejects(pending, { name: "AbortError" });
    assert.equal(signal.aborted, true);
  } finally {
    globalThis.fetch = original;
  }
});
test("framed stream requires a completion marker and preserves partial text", async () => {
  const original = globalThis.fetch;
  let partial = "";
  globalThis.fetch = async () => framed([{ type: "delta", text: "First step" }]);
  try {
    await assert.rejects(
      client.askAssistantStream(messages, {}, { onUpdate: (text) => (partial = text) }),
      /incomplete/,
    );
    assert.equal(partial, "First step");
  } finally {
    globalThis.fetch = original;
  }
});
test("successful fragmented stream reconstructs text and completes", async () => {
  const original = globalThis.fetch;
  const encoded = new TextEncoder().encode(
    JSON.stringify({ type: "delta", text: "Prêt à partir." }) +
      "\n" +
      JSON.stringify({ type: "done" }) +
      "\n",
  );
  globalThis.fetch = async () =>
    new Response(
      new ReadableStream({
        start(c) {
          for (const byte of encoded) c.enqueue(new Uint8Array([byte]));
          c.close();
        },
      }),
      { headers: { "Content-Type": "application/x-ndjson" } },
    );
  try {
    const reply = await client.askAssistantStream(messages, {}, { onUpdate() {} });
    assert.equal(reply.answer, "Prêt à partir.");
  } finally {
    globalThis.fetch = original;
  }
});
test("stream errors and provider quota remain errors, not successful answers", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      framed([
        { type: "delta", text: "Partial" },
        { type: "error", code: "timeout" },
      ]);
    await assert.rejects(client.askAssistantStream(messages, {}, { onUpdate() {} }), /timeout/);
    globalThis.fetch = async () => new Response("{}", { status: 429 });
    await assert.rejects(client.askAssistantStream(messages, {}, { onUpdate() {} }), /quota/);
  } finally {
    globalThis.fetch = original;
  }
});
for (const reason of ["STOP", "MAX_TOKENS", "missing"])
  test(`server signals ${reason} without changing status after streaming`, async () => {
    const original = globalThis.fetch;
    const oldKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-only";
    globalThis.fetch = async () =>
      new Response(
        `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: "A useful answer." }] }, ...(reason === "missing" ? {} : { finishReason: reason }) }] })}\n\n`,
      );
    const output = [];
    let started = false;
    let ended = false;
    const res = {
      status(code) {
        assert.equal(started, false);
        assert.equal(code, 200);
        return this;
      },
      setHeader() {},
      json() {
        assert.fail("must not write JSON status after streaming");
      },
      write(text) {
        started = true;
        output.push(JSON.parse(text));
      },
      end() {
        ended = true;
      },
    };
    try {
      await handler(
        { method: "POST", headers: { accept: "application/x-ndjson" }, body: { messages } },
        res,
      );
      assert.equal(ended, true);
      assert.equal(output[0].type, "delta");
      assert.equal(output.at(-1).type, reason === "STOP" ? "done" : "error");
    } finally {
      globalThis.fetch = original;
      if (oldKey === undefined) delete process.env.GEMINI_API_KEY;
      else process.env.GEMINI_API_KEY = oldKey;
    }
  });

import { requestLifetime } from "../src/lib/assistant-lifetime.js";
/// <reference types="node" />
import {
  normalizeBody,
  extractQuestion,
  buildAssistantPrompt,
  directAssistantAnswer,
  ASSISTANT_SYSTEM_INSTRUCTION,
} from "../src/lib/assistant-request.js";

type VercelRequest = {
  method?: string;
  body?: unknown;
  headers?: { accept?: string };
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  on?: (event: "close", listener: () => void) => void;
  off?: (event: "close", listener: () => void) => void;
  write: (chunk: string) => void;
  end: () => void;
};

type GeminiPart = {
  text?: string;
};

type GeminiResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

const MODELS = ["gemini-2.5-flash", "gemini-flash-latest"];
const MAX_QUESTION_LENGTH = 1000;
const QUOTA_ERROR_MESSAGE =
  "The AI assistant has reached its temporary usage limit. Please try again later.";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST to ask the assistant." });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        "AI assistant is not configured yet. Add GEMINI_API_KEY to your local or Vercel environment variables.",
    });
  }

  const body = normalizeBody(req.body);
  const question = extractQuestion(body);

  if (!question) {
    return res.status(400).json({ error: "Please ask a question before sending." });
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    return res.status(400).json({
      error: `Please keep your question under ${MAX_QUESTION_LENGTH} characters.`,
    });
  }

  const framed = req.headers?.accept?.includes("application/x-ndjson") ?? false;
  const direct = directAssistantAnswer(body);
  if (direct) {
    res.status(200);
    res.setHeader(
      "Content-Type",
      framed ? "application/x-ndjson; charset=utf-8" : "text/plain; charset=utf-8",
    );
    res.setHeader("Cache-Control", "no-store");
    res.write(
      framed
        ? JSON.stringify({ type: "delta", text: direct }) +
            "\n" +
            JSON.stringify({ type: "done" }) +
            "\n"
        : direct,
    );
    return res.end();
  }
  let streaming = false;
  const lifetime = requestLifetime(undefined, 45000);
  res.on?.("close", lifetime.abort);
  try {
    const prompt = buildAssistantPrompt(body);
    const { response, data, model } = await streamWithAvailableModel(
      apiKey,
      prompt,
      lifetime.signal,
    );

    if (!response.ok || !response.body) {
      console.error("Gemini streaming API error", {
        model,
        httpStatus: response.status,
        geminiCode: data.error?.code,
        geminiStatus: data.error?.status,
        geminiMessage: data.error?.message,
      });

      if (
        response.status === 429 ||
        data.error?.code === 429 ||
        data.error?.status === "RESOURCE_EXHAUSTED"
      ) {
        return res.status(429).json({ error: QUOTA_ERROR_MESSAGE });
      }

      return res.status(502).json({
        error: "The AI assistant is temporarily unavailable. Please try again in a moment.",
      });
    }

    res.status(200);
    res.setHeader(
      "Content-Type",
      framed ? "application/x-ndjson; charset=utf-8" : "text/plain; charset=utf-8",
    );
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    streaming = true;
    await writeGeminiStream(response, res, framed);
    return res.end();
  } catch (error) {
    console.error("Assistant stream route error", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    if (streaming) {
      if (framed && lifetime.signal.reason?.name !== "AbortError")
        res.write(
          JSON.stringify({
            type: "error",
            code: lifetime.signal.aborted ? "timeout" : "incomplete",
          }) + "\n",
        );
      return res.end();
    }
    if (lifetime.signal.aborted) return res.status(504).json({ error: "timeout" });
    return res.status(502).json({
      error: "The AI assistant is temporarily unavailable. Please try again in a moment.",
    });
  } finally {
    lifetime.dispose();
    res.off?.("close", lifetime.abort);
  }
}

async function streamWithAvailableModel(apiKey: string, prompt: string, signal: AbortSignal) {
  let lastResponse: Response | null = null;
  let lastData: GeminiResponse = {};
  let lastModel = MODELS[0];

  for (const model of MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: ASSISTANT_SYSTEM_INSTRUCTION }],
          },
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 2048,
            ...(model === "gemini-2.5-flash" ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            temperature: 0.2,
          },
        }),
      },
    );

    lastResponse = response;
    lastModel = model;

    if (!response.ok) {
      lastData = (await response
        .clone()
        .json()
        .catch(() => ({}))) as GeminiResponse;

      if (isModelUnavailable(response, lastData)) {
        console.warn("Gemini streaming model unavailable, trying fallback", {
          model,
          httpStatus: response.status,
          geminiStatus: lastData.error?.status,
          geminiMessage: lastData.error?.message,
        });
        continue;
      }
    }

    break;
  }

  return {
    response: lastResponse as Response,
    data: lastData,
    model: lastModel,
  };
}

async function writeGeminiStream(response: Response, res: VercelResponse, framed: boolean) {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  let hasText = false;
  const consume = (line: string) => {
    if (!line.trim().startsWith("data:")) return;
    const payload = line.trim().slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    const data = JSON.parse(payload) as GeminiResponse;
    if (data.error) throw new Error("provider-error");
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.map((part) => part.text || "").join("") || "";
    if (text) {
      hasText = true;
      res.write(framed ? JSON.stringify({ type: "delta", text }) + "\n" : text);
    }
    if (candidate?.finishReason) {
      if (candidate.finishReason !== "STOP") throw new Error("incomplete");
      finished = true;
    }
  };
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) consume(line);
    }
    buffer += decoder.decode();
    for (const line of buffer.split("\n")) consume(line);
    if (!finished || !hasText) throw new Error("incomplete");
    if (framed) res.write(JSON.stringify({ type: "done" }) + "\n");
  } finally {
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

function isModelUnavailable(response: Response, data: GeminiResponse) {
  return (
    response.status === 404 ||
    data.error?.code === 404 ||
    data.error?.status === "NOT_FOUND" ||
    Boolean(data.error?.message?.includes("is not found"))
  );
}

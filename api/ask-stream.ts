/// <reference types="node" />

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  write: (chunk: string) => void;
  end: () => void;
};

type AssistantMessage = {
  role?: string;
  content?: unknown;
};

type RequestBody = {
  question?: unknown;
  messages?: AssistantMessage[];
  context?: {
    university?: unknown;
    language?: unknown;
  };
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

const SYSTEM_INSTRUCTION = `
You are PreDeparture's exchange-preparation assistant.
Scope: study-abroad preparation, UC Berkeley/Stanford exchange, F-1 visa, DS-160, SEVIS, housing, insurance, banking, phone/eSIM, arrival, scholarships/funding, student community.
If outside scope, redirect briefly.
Answer in plain text, short practical bullets when useful.
Do not use Markdown bold, tables or long headings.
Do not invent exact fees, deadlines, legal requirements or university rules.
Tell users to verify changeable facts on official university, embassy or government websites.
`.trim();

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

  try {
    const university =
      typeof body.context?.university === "string" ? body.context.university : "the host university";
    const language = body.context?.language === "fr" ? "French" : "English";
    const prompt = buildPrompt(university, question, language);
    const { response, data, model } = await streamWithAvailableModel(apiKey, prompt);

    if (!response.ok || !response.body) {
      console.error("Gemini streaming API error", {
        model,
        httpStatus: response.status,
        geminiCode: data.error?.code,
        geminiStatus: data.error?.status,
        geminiMessage: data.error?.message,
      });

      if (response.status === 429 || data.error?.code === 429 || data.error?.status === "RESOURCE_EXHAUSTED") {
        return res.status(429).json({ error: QUOTA_ERROR_MESSAGE });
      }

      return res.status(502).json({
        error: "The AI assistant is temporarily unavailable. Please try again in a moment.",
      });
    }

    res.status(200);
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("X-Accel-Buffering", "no");

    await writeGeminiStream(response, res);
    return res.end();
  } catch (error) {
    console.error("Assistant stream route error", error);
    return res.status(502).json({
      error: "The AI assistant is temporarily unavailable. Please try again in a moment.",
    });
  }
}

async function streamWithAvailableModel(apiKey: string, prompt: string) {
  let lastResponse: Response | null = null;
  let lastData: GeminiResponse = {};
  let lastModel = MODELS[0];

  for (const model of MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }],
          },
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 850,
            temperature: 0.2,
          },
        }),
      },
    );

    lastResponse = response;
    lastModel = model;

    if (!response.ok) {
      lastData = (await response.clone().json().catch(() => ({}))) as GeminiResponse;

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

async function writeGeminiStream(response: Response, res: VercelResponse) {
  const reader = response.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const text = extractTextFromSseLine(line);
      if (text) res.write(text);
    }
  }

  buffer += decoder.decode();
  for (const line of buffer.split("\n")) {
    const text = extractTextFromSseLine(line);
    if (text) res.write(text);
  }
}

function extractTextFromSseLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed.startsWith("data:")) return "";

  const payload = trimmed.slice("data:".length).trim();
  if (!payload || payload === "[DONE]") return "";

  try {
    const data = JSON.parse(payload) as GeminiResponse;
    return data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "";
  } catch {
    return "";
  }
}

function buildPrompt(university: string, question: string, language: string) {
  return [
    `Host university context: ${university}`,
    `Interface language: ${language}`,
    `Student question: ${question}`,
    "Answer in the interface language unless the student's question clearly uses another language.",
    "Keep it under 140 words unless the user asks for detail.",
    "Use short hyphen bullets for lists.",
    "Use blank lines between groups.",
    "Finish the answer cleanly.",
  ].join("\n\n");
}

function isModelUnavailable(response: Response, data: GeminiResponse) {
  return (
    response.status === 404 ||
    data.error?.code === 404 ||
    data.error?.status === "NOT_FOUND" ||
    Boolean(data.error?.message?.includes("is not found"))
  );
}

function normalizeBody(body: unknown): RequestBody {
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as RequestBody;
    } catch {
      return {};
    }
  }

  if (body && typeof body === "object") {
    return body as RequestBody;
  }

  return {};
}

function extractQuestion(body: RequestBody) {
  if (typeof body.question === "string") {
    return body.question.trim();
  }

  const lastUserMessage = body.messages
    ?.filter((message) => message.role === "user" && typeof message.content === "string")
    .at(-1);

  return typeof lastUserMessage?.content === "string" ? lastUserMessage.content.trim() : "";
}

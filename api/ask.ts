/// <reference types="node" />

type VercelRequest = {
  method?: string;
  body?: unknown;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
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
  }>;
  error?: {
    code?: number;
    status?: string;
    message?: string;
  };
};

const MODELS = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash"];
const MAX_QUESTION_LENGTH = 1000;
const DISCLAIMER = "Always verify critical information through official university or government websites.";
const QUOTA_ERROR_MESSAGE =
  "The AI assistant has reached its temporary usage limit. Please try again later.";

const SYSTEM_INSTRUCTION = `
You are the PreDeparture AI assistant.

Answer only questions related to:
- studying abroad preparation
- UC Berkeley exchange preparation
- Stanford exchange preparation when relevant
- F-1 visa
- DS-160
- SEVIS
- housing
- insurance
- banking
- phone plan or eSIM
- arrival logistics
- scholarships and funding
- student community

If the user asks about anything outside this scope, politely redirect them to exchange preparation topics.
Keep answers short, practical and easy to act on.
Use your general knowledge to give practical preparation guidance.
When mentioning facts that can change, tell the user to verify them on official university, embassy or government websites.
Do not invent exact deadlines, fees, legal requirements or university rules.
Never claim to replace official university, embassy or government guidance.
End every answer with this exact sentence:
"${DISCLAIMER}"
`.trim();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json");

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
    const prompt = `Host university context: ${university}\n\nStudent question: ${question}`;

    const { response, data, model } = await generateWithAvailableModel(apiKey, prompt);

    if (!response.ok) {
      console.error("Gemini API error", {
        model,
        httpStatus: response.status,
        geminiCode: data.error?.code,
        geminiStatus: data.error?.status,
        geminiMessage: data.error?.message,
      });
      if (response.status === 429 || data.error?.code === 429 || data.error?.status === "RESOURCE_EXHAUSTED") {
        return res.status(429).json({
          error: QUOTA_ERROR_MESSAGE,
        });
      }

      return res.status(502).json({
        error: "The AI assistant is temporarily unavailable. Please try again in a moment.",
      });
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!answer) {
      return res.status(502).json({
        error: "The AI assistant could not generate an answer. Please try again.",
      });
    }

    return res.status(200).json({
      answer: withDisclaimer(answer),
      sources: [],
    });
  } catch (error) {
    console.error("Assistant route error", error);
    return res.status(502).json({
      error: "The AI assistant is temporarily unavailable. Please try again in a moment.",
    });
  }
}

async function generateWithAvailableModel(apiKey: string, prompt: string) {
  let lastResponse: Response | null = null;
  let lastData: GeminiResponse = {};
  let lastModel = MODELS[0];

  for (const model of MODELS) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
            maxOutputTokens: 450,
            temperature: 0.25,
          },
        }),
      },
    );

    const data = (await response.json().catch(() => ({}))) as GeminiResponse;
    lastResponse = response;
    lastData = data;
    lastModel = model;

    if (response.ok || !isModelUnavailable(response, data)) {
      break;
    }

    console.warn("Gemini model unavailable, trying fallback", {
      model,
      httpStatus: response.status,
      geminiStatus: data.error?.status,
      geminiMessage: data.error?.message,
    });
  }

  return {
    response: lastResponse as Response,
    data: lastData,
    model: lastModel,
  };
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

function withDisclaimer(answer: string) {
  if (answer.includes(DISCLAIMER)) {
    return answer;
  }

  return `${answer}\n\n${DISCLAIMER}`;
}

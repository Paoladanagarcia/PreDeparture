export type AssistantSource = { title: string; url: string };
export type AssistantReply = { answer: string; sources: AssistantSource[] };
export type AssistantContext = { university?: string; language?: "en" | "fr" };

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantApiResponse = {
  answer?: string;
  sources?: AssistantSource[];
  error?: string;
};

type AskAssistantStreamOptions = {
  onUpdate: (answer: string) => void;
};

const CACHE_KEY = "predeparture.assistant.cache.v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 12;
const MAX_CACHE_ENTRIES = 20;

const quickReplies = [
  {
    patterns: ["sevis", "i-901", "i901"],
    en:
      "The SEVIS I-901 fee is paid before the F-1 visa interview.\n\n- Pay it on the official FMJfee website.\n\n- Keep the payment receipt for your visa appointment.\n\n- Make sure your I-20 information matches before paying.\n\nAlways verify fees and requirements on the official SEVP website.",
    fr:
      "Les frais SEVIS I-901 se paient avant l'entretien visa F-1.\n\n- Payez-les sur le site officiel FMJfee.\n\n- Gardez le reçu pour votre rendez-vous visa.\n\n- Vérifiez que les infos du I-20 sont correctes avant de payer.\n\nVérifiez toujours les frais et exigences sur le site officiel SEVP.",
    sources: [{ title: "SEVIS I-901 fee", url: "https://www.fmjfee.com/" }],
  },
  {
    patterns: ["ds-160", "ds160"],
    en:
      "The DS-160 is the online nonimmigrant visa application for the F-1 visa.\n\n- Complete it before scheduling or attending your interview.\n\n- Save the confirmation page.\n\n- Use the same passport and identity details as your visa documents.\n\nVerify the process on the official CEAC website.",
    fr:
      "Le DS-160 est le formulaire en ligne pour le visa F-1.\n\n- Remplissez-le avant l'entretien visa.\n\n- Gardez la page de confirmation.\n\n- Utilisez les mêmes infos que sur votre passeport et vos documents visa.\n\nVérifiez la procédure sur le site officiel CEAC.",
    sources: [{ title: "DS-160 CEAC", url: "https://ceac.state.gov/genniv/" }],
  },
  {
    patterns: ["housing", "logement", "rent", "lease", "sublet"],
    en:
      "For housing, start early and compare official university options first.\n\n- Check campus housing and off-campus resources.\n\n- Avoid paying deposits before verifying the listing.\n\n- For a one-semester exchange, be careful with 12-month leases.\n\nUse official university housing pages as your starting point.",
    fr:
      "Pour le logement, commencez tôt et comparez d'abord les options officielles.\n\n- Regardez le logement campus et les ressources off-campus.\n\n- Ne payez pas de dépôt avant d'avoir vérifié l'annonce.\n\n- Pour un semestre, attention aux baux de 12 mois.\n\nCommencez par les pages logement officielles de l'université.",
    sources: [],
  },
  {
    patterns: ["insurance", "assurance", "health"],
    en:
      "For health insurance, check your host university rules first.\n\n- Some universities require their student health plan.\n\n- Some allow a waiver if your insurance meets strict criteria.\n\n- Do not assume French or EU coverage is enough in the US.\n\nVerify directly with the university health insurance office.",
    fr:
      "Pour l'assurance santé, vérifiez d'abord les règles de l'université.\n\n- Certaines universités imposent leur assurance étudiante.\n\n- Certaines acceptent une exemption si votre assurance respecte leurs critères.\n\n- Ne supposez pas qu'une couverture française ou européenne suffit aux États-Unis.\n\nVérifiez auprès du service assurance santé de l'université.",
    sources: [],
  },
] satisfies Array<{
  patterns: string[];
  en: string;
  fr: string;
  sources: AssistantSource[];
}>;

const simpleQuickReplyPatterns = [
  /^(what is|what's|how does|explain|c'?est quoi|c est quoi|explique|comment marche|comment fonctionne)\s+.{0,45}\b(sevis|i-901|i901)\b\??$/i,
  /^(what is|what's|how does|explain|c'?est quoi|c est quoi|explique|comment marche|comment fonctionne)\s+.{0,45}\b(ds-160|ds160)\b\??$/i,
  /^(housing tips|logement|conseils logement|how to find housing|comment trouver un logement)\??$/i,
  /^(insurance|health insurance|assurance|assurance santé|assurance sante)\??$/i,
];

export async function askAssistant(
  messages: AssistantMessage[],
  context: AssistantContext = {},
): Promise<AssistantReply> {
  const question = messages.at(-1)?.content ?? "";
  const quickReply = findQuickReply(question, context);
  if (quickReply) return quickReply;

  const cacheKey = createCacheKey(question, context);
  const cached = readCachedReply(cacheKey);
  if (cached) return cached;

  const response = await fetch("/api/ask", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, context }),
  });

  const data = (await response.json().catch(() => ({}))) as AssistantApiResponse;

  if (!response.ok) {
    throw new Error(data.error || "The AI assistant is temporarily unavailable. Please try again.");
  }

  const reply = {
    answer: data.answer || "The AI assistant could not generate an answer. Please try again.",
    sources: data.sources || [],
  };
  writeCachedReply(cacheKey, reply);
  return reply;
}

export async function askAssistantStream(
  messages: AssistantMessage[],
  context: AssistantContext = {},
  options: AskAssistantStreamOptions,
): Promise<AssistantReply> {
  const question = messages.at(-1)?.content ?? "";
  const quickReply = findQuickReply(question, context);
  if (quickReply) {
    options.onUpdate(quickReply.answer);
    return quickReply;
  }

  const cacheKey = createCacheKey(question, context);
  const cached = readCachedReply(cacheKey);
  if (cached) {
    options.onUpdate(cached.answer);
    return cached;
  }

  const response = await fetch("/api/ask-stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as AssistantApiResponse;
    throw new Error(data.error || "The AI assistant is temporarily unavailable. Please try again.");
  }

  if (!response.body) {
    throw new Error("The AI assistant is temporarily unavailable. Please try again.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let answer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    answer += decoder.decode(value, { stream: true });
    options.onUpdate(answer);
  }

  answer += decoder.decode();
  const reply = {
    answer: answer.trim() || "The AI assistant could not generate an answer. Please try again.",
    sources: [],
  };

  options.onUpdate(reply.answer);
  writeCachedReply(cacheKey, reply);
  return reply;
}

function findQuickReply(question: string, context: AssistantContext): AssistantReply | null {
  const normalized = question.toLowerCase();
  if (!isSimpleQuickReplyQuestion(question)) return null;

  const match = quickReplies.find((reply) =>
    reply.patterns.some((pattern) => normalized.includes(pattern)),
  );

  if (!match) return null;

  return {
    answer: context.language === "fr" ? match.fr : match.en,
    sources: withUniversitySources(match.sources, normalized, context.university),
  };
}

function isSimpleQuickReplyQuestion(question: string) {
  const trimmed = question.trim();
  if (!trimmed || trimmed.length > 90) return false;
  return simpleQuickReplyPatterns.some((pattern) => pattern.test(trimmed));
}

function withUniversitySources(
  sources: AssistantSource[],
  normalizedQuestion: string,
  university?: string,
): AssistantSource[] {
  if (!/(housing|logement|rent|lease|sublet|insurance|assurance|health)/.test(normalizedQuestion)) {
    return sources;
  }

  if (university === "Stanford University") {
    return [
      ...sources,
      { title: "Stanford Student Housing", url: "https://rde.stanford.edu/studenthousing" },
      {
        title: "Stanford Cardinal Care",
        url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
      },
    ];
  }

  return [
    ...sources,
    { title: "UC Berkeley Housing", url: "https://housing.berkeley.edu/" },
    { title: "UC SHIP", url: "https://uhs.berkeley.edu/ship" },
  ];
}

function createCacheKey(question: string, context: AssistantContext) {
  return JSON.stringify({
    q: question.trim().toLowerCase().replace(/\s+/g, " "),
    university: context.university ?? "",
    language: context.language ?? "en",
  });
}

function readCachedReply(key: string): AssistantReply | null {
  if (typeof window === "undefined") return null;
  try {
    const cache = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}") as Record<
      string,
      { savedAt: number; reply: AssistantReply }
    >;
    const entry = cache[key];
    if (!entry || Date.now() - entry.savedAt > CACHE_TTL_MS) return null;
    return entry.reply;
  } catch {
    return null;
  }
}

function writeCachedReply(key: string, reply: AssistantReply) {
  if (typeof window === "undefined") return;
  try {
    const cache = JSON.parse(window.localStorage.getItem(CACHE_KEY) || "{}") as Record<
      string,
      { savedAt: number; reply: AssistantReply }
    >;
    cache[key] = { savedAt: Date.now(), reply };
    const entries = Object.entries(cache)
      .sort(([, a], [, b]) => b.savedAt - a.savedAt)
      .slice(0, MAX_CACHE_ENTRIES);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Cache is best-effort only.
  }
}

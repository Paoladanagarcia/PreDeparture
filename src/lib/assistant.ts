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

export async function askAssistant(
  messages: AssistantMessage[],
  context: AssistantContext = {},
): Promise<AssistantReply> {
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

  return {
    answer: data.answer || "The AI assistant could not generate an answer. Please try again.",
    sources: data.sources || [],
  };
}

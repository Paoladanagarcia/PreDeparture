import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { askAssistant, type AssistantReply } from "@/lib/assistant";
import { useProfile } from "@/lib/storage";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — PreDeparture" },
      {
        name: "description",
        content:
          "Ask questions about visa, housing, insurance, banking and arrival. Answers grounded in official sources.",
      },
    ],
  }),
  component: AssistantPage,
});

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; sources?: { title: string; url: string }[] };

const SUGGESTIONS = [
  "What documents do I need for my F-1 visa interview?",
  "How does the SEVIS fee work?",
  "Is university health insurance mandatory?",
  "How should I compare housing near campus?",
];

function AssistantPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const reply: AssistantReply = await askAssistant(
        next.map((m) => ({ role: m.role, content: m.content })),
        { university: profile?.university },
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply.answer, sources: reply.sources },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/dashboard" })}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/community">
                <MessageCircle className="mr-1 h-4 w-4" /> Community
              </Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Source-grounded assistant
          </div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
            Ask anything about your exchange
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Answers are based on verified official sources — university websites, embassy pages and
            government documentation. Always verify critical information on the official websites.
          </p>
        </div>

        <Card className="flex h-[62vh] flex-col overflow-hidden p-0 sm:h-[60vh]">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3 sm:p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <Sparkles className="h-4 w-4" />
                  </span>
                  <div className="text-sm">
                    <p className="font-medium">Hi 👋 I'm your PreDeparture assistant.</p>
                    <p className="mt-1 text-muted-foreground">
                      I can help with F-1 visa, SEVIS, DS-160, campus housing, health insurance, US
                      banking, phone plans, scholarships and your arrival.
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-muted"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <MessageBubble key={i} m={m} />
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Looking it up in official sources…
              </div>
            )}

            {error && (
              <div className="flex gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <form
            className="flex items-end gap-2 border-t bg-card p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about visa, housing, insurance, banking, arrival…"
              className="min-h-[44px] flex-1 resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
            <Button type="submit" disabled={loading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <p className="mt-3 text-xs text-muted-foreground">
          ⚠️ This assistant provides guidance only. Always verify visa requirements, deadlines and
          fees on official government and university websites before making important decisions.
        </p>
      </main>
    </div>
  );
}

function MessageBubble({ m }: { m: ChatMessage }) {
  if (m.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[92%] rounded-2xl rounded-br-sm bg-primary px-3 py-2.5 text-sm text-primary-foreground sm:max-w-[85%] sm:px-4">
          {m.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="max-w-[92%] space-y-3 sm:max-w-[85%]">
        <div className="rounded-2xl rounded-tl-sm border bg-card px-3 py-3 text-sm sm:px-4">
          <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
        </div>
        {m.sources && m.sources.length > 0 && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3 w-3" /> Official sources
            </p>
            <ul className="space-y-1.5">
              {m.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    {s.title} <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// Suppress unused import warning when Link isn't used yet.
void Link;

import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Lock, MessageCircle, Send, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import {
  COMMUNITY_GROUPS,
  displayNameFromSession,
  getCohort,
  getJoinedGroups,
  getMemberCounts,
  joinCommunityGroup,
  listMessages,
  sendMessage,
  subscribeToMessages,
  type CommunityGroupKey,
  type CommunityMessage,
} from "@/lib/community";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { ProfileQuestionnaire } from "@/lib/tasks";

type Status = "ready" | "loading" | "unavailable";

export function CommunityCard({
  profile,
}: {
  profile?: Pick<ProfileQuestionnaire, "university" | "startDate"> | null;
}) {
  const { configured, session } = useAuth();
  const { t } = useI18n();
  const cohort = useMemo(
    () =>
      profile
        ? getCohort(profile)
        : { key: "preview", label: t("community.previewLabel"), term: "" },
    [profile, t],
  );
  const [activeGroup, setActiveGroup] = useState<CommunityGroupKey>("general");
  const [joinedGroups, setJoinedGroups] = useState<CommunityGroupKey[]>([]);
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [displayName, setDisplayName] = useState(() => displayNameFromSession(session));
  const [status, setStatus] = useState<Status>("loading");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const joined = joinedGroups.includes(activeGroup);
  const activeGroupMeta = COMMUNITY_GROUPS.find((group) => group.key === activeGroup);
  const activeGroupLabel = activeGroupMeta ? getCommunityGroupLabel(activeGroupMeta.key, t) : "";
  const activeGroupDescription = activeGroupMeta
    ? getCommunityGroupDescription(activeGroupMeta.key, t)
    : "";

  useEffect(() => {
    setDisplayName(displayNameFromSession(session));
  }, [session]);

  useEffect(() => {
    let cancelled = false;

    async function loadMembership() {
      if (!configured || !session || !profile) {
        setStatus("ready");
        setJoinedGroups([]);
        setMemberCounts({});
        return;
      }

      setStatus("loading");
      try {
        const [groups, counts] = await Promise.all([
          getJoinedGroups(session, cohort.key),
          getMemberCounts(session, cohort.key),
        ]);
        if (cancelled) return;

        setJoinedGroups(groups);
        setMemberCounts(counts);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("unavailable");
      }
    }

    loadMembership();
    return () => {
      cancelled = true;
    };
  }, [cohort.key, configured, profile, session]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!session || !profile || !joined) {
        setMessages([]);
        return;
      }

      try {
        const rows = await listMessages(session, cohort.key, activeGroup);
        if (!cancelled) setMessages(rows);
      } catch {
        if (!cancelled) setStatus("unavailable");
      }
    }

    loadMessages();
    const interval = window.setInterval(loadMessages, 7000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [activeGroup, cohort.key, joined, profile, session]);

  useEffect(() => {
    if (!session || !profile || !joined) return;
    return subscribeToMessages(session, cohort.key, (message) => {
      if (message.group_key !== activeGroup) return;
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
    });
  }, [activeGroup, cohort.key, joined, profile, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function handleJoin(groupKey = activeGroup) {
    if (!configured) {
      toast.error(t("community.supabaseRequired"));
      return;
    }
    if (!profile) {
      toast.error(t("community.profileBeforeJoin"));
      return;
    }
    if (!session) return;

    try {
      await joinCommunityGroup(session, cohort.key, groupKey, displayName || "Student");
      setJoinedGroups((current) =>
        current.includes(groupKey) ? current : [...current, groupKey],
      );
      setMemberCounts((current) => ({
        ...current,
        [groupKey]: (current[groupKey] ?? 0) + 1,
      }));
      toast.success(`${t("community.joined")} ${getCommunityGroupLabel(groupKey, t)}`);
    } catch {
      setStatus("unavailable");
      toast.error(t("community.databaseTitle"));
    }
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!session || !joined || !draft.trim()) return;

    setSending(true);
    try {
      const nextMessage = await sendMessage(
        session,
        cohort.key,
        activeGroup,
        displayName || "Student",
        draft.trim(),
      );
      setDraft("");
      if (nextMessage) {
        setMessages((current) =>
          current.some((item) => item.id === nextMessage.id) ? current : [...current, nextMessage],
        );
      }
    } catch {
      toast.error(t("community.messageFailed"));
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="mt-5 overflow-hidden border-primary/20 p-0">
      <div className="bg-hero-gradient">
        <div className="p-4 sm:p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Users className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-semibold md:text-xl">{t("community.title")}</h2>
                <Badge variant="outline" className="border-primary/30 bg-card/80">
                  <MessageCircle className="mr-1 h-3 w-3" /> {t("community.liveGroups")}
                </Badge>
              </div>
              <p className="mt-3 text-base font-semibold">{cohort.label}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("community.cardDesc")}
              </p>
            </div>

            <div className="rounded-lg border bg-card/90 p-3 text-sm lg:w-80">
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary" />
                <p className="text-muted-foreground">
                  {t("community.tips")}
                </p>
              </div>
            </div>
          </div>

          {(!session || !profile) && (
            <div className="mt-5 rounded-lg border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    {!session ? t("community.signInToJoin") : t("community.createProfile")}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {!session
                      ? t("community.previewOnly")
                      : t("community.profileRequired")}
                  </p>
                </div>
                <Button asChild className="shrink-0">
                  <Link to={!session ? "/auth" : "/onboarding"}>
                    {!session ? t("common.signIn") : t("community.createProfile")}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {status === "unavailable" && (
            <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <p className="font-medium">{t("community.databaseTitle")}</p>
              <p className="mt-1 text-muted-foreground">
                {t("community.databaseDesc")}
              </p>
            </div>
          )}

          <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="space-y-2">
              {COMMUNITY_GROUPS.map((group) => {
                const isActive = group.key === activeGroup;
                const isJoined = Boolean(session && profile && joinedGroups.includes(group.key));
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => setActiveGroup(group.key)}
                    className={cn(
                      "w-full rounded-lg border bg-card p-3 text-left transition hover:border-primary/40",
                      isActive && "border-primary shadow-sm",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{getCommunityGroupLabel(group.key, t)}</p>
                      {isJoined ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {getCommunityGroupDescription(group.key, t)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {memberCounts[group.key] ?? 0}{" "}
                      {(memberCounts[group.key] ?? 0) === 1
                        ? t("community.member")
                        : t("community.members")}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border bg-card">
              <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{activeGroupLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeGroupDescription}
                  </p>
                </div>
                {session && profile && !joined && (
                  <Button size="sm" onClick={() => handleJoin()}>
                    {t("community.joinGroup")}
                  </Button>
                )}
              </div>
              <Separator />

              {joined ? (
                <div>
                  <ScrollArea className="h-72 p-4 sm:h-80">
                    {messages.length === 0 ? (
                      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                        {t("community.noMessages")}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <ChatMessage
                            key={message.id}
                            message={message}
                            mine={message.user_id === session?.user.id}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  <Separator />
                  <form onSubmit={handleSend} className="space-y-3 p-4">
                    <div className="grid gap-2 sm:grid-cols-[180px_1fr]">
                      <Input
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        maxLength={32}
                        placeholder={t("community.displayName")}
                      />
                      <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={`${t("community.messagePlaceholder")} ${activeGroupLabel.toLowerCase()}...`}
                        className="min-h-11 resize-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={sending || !draft.trim()}>
                        <Send className="h-4 w-4" /> {t("community.send")}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex min-h-72 items-center justify-center p-4">
                  <div className="max-w-sm text-center">
                    <Lock className="mx-auto h-7 w-7 text-muted-foreground" />
                    <p className="mt-3 font-medium">
                      {!session
                        ? t("community.signInUnlock")
                        : !profile
                          ? t("community.profileUnlock")
                          : t("community.joinReadPost")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("community.privateChats")}
                    </p>
                    {session && profile ? (
                      <Button className="mt-4" onClick={() => handleJoin()}>
                        {t("community.joinGroup")}
                      </Button>
                    ) : (
                      <Button asChild className="mt-4">
                        <Link to={!session ? "/auth" : "/onboarding"}>
                          {!session ? t("common.signIn") : t("community.createProfile")}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function getCommunityGroupLabel(
  groupKey: CommunityGroupKey,
  t: (key: TranslationKey) => string,
) {
  return t(`community.${groupKey}` as TranslationKey);
}

function getCommunityGroupDescription(
  groupKey: CommunityGroupKey,
  t: (key: TranslationKey) => string,
) {
  return t(`community.${groupKey}Desc` as TranslationKey);
}

function ChatMessage({ message, mine }: { message: CommunityMessage; mine: boolean }) {
  const initials = message.display_name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("flex gap-3", mine && "justify-end")}>
      {!mine && (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials || "S"}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[82%] rounded-lg border px-3 py-2 text-sm",
          mine ? "bg-primary text-primary-foreground" : "bg-muted/40",
        )}
      >
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold">{message.display_name}</span>
          <span className={cn("text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
      </div>
    </div>
  );
}

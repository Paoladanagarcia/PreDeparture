import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useProfile, useProgress } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import {
  TASKS,
  CATEGORY_META,
  PRIORITY_META,
  dateMinusDays,
  formatDate,
  type ProfileQuestionnaire,
  type Task,
} from "@/lib/tasks";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { getUniversityConfig } from "@/lib/universities";
import {
  ExternalLink,
  CalendarClock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  ShieldCheck,
  FileText,
  Sparkles,
  MessageCircle,
  Users,
  Home,
  CreditCard,
  Smartphone,
  Plane,
  DollarSign,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Your dashboard — PreDeparture" },
      {
        name: "description",
        content: "Your personalized study abroad checklist, timeline and resources.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { profile, loaded } = useProfile();
  const { done, docs, toggle, toggleDoc, reset } = useProgress();
  const { configured: authConfigured, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  const arrival = useMemo(
    () => (profile?.startDate ? new Date(profile.startDate) : new Date()),
    [profile?.startDate],
  );

  const university = useMemo(() => getUniversityConfig(profile?.university), [profile?.university]);
  const personalizedTasks = useMemo(
    () => (profile ? getPersonalizedTasks(profile) : TASKS),
    [profile],
  );
  const personalizedTips = useMemo(() => (profile ? getPersonalizedTips(profile) : []), [profile]);

  const completed = personalizedTasks.filter((t) => done[t.id]).length;
  const total = personalizedTasks.length;
  const pct = Math.round((completed / total) * 100);

  const nextTask = useMemo(() => {
    const pending = personalizedTasks
      .filter((t) => !done[t.id])
      .sort((a, b) => b.recommendedDaysBefore - a.recommendedDaysBefore);
    return pending[0];
  }, [done, personalizedTasks]);

  if (!profile) return null;

  const before = sortTasksByRecommendedDate(personalizedTasks.filter((t) => t.phase === "before"));
  const after = sortTasksByRecommendedDate(personalizedTasks.filter((t) => t.phase === "after"));

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/assistant">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> AI Assistant
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/community">
                <MessageCircle className="mr-1 h-3.5 w-3.5" /> Community
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">Profile</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Account</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/onboarding">Edit profile</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={reset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-4 sm:p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              You're heading to
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl md:text-3xl">
              {profile.university}, {profile.country}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.nationality} student · arriving{" "}
              {arrival.toLocaleDateString(undefined, { dateStyle: "long" })} ·{" "}
              {durationLabel(profile.duration)}
            </p>

            <div className="mt-4 sm:mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">You're {pct}% ready for departure</span>
                <span className="text-muted-foreground">
                  {completed} / {total} done
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </Card>

          <Card className="flex flex-col justify-between p-4 sm:p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Your next step
              </p>
              <p className="mt-2 text-lg font-semibold">
                {nextTask ? nextTask.title : "You're all set! 🎉"}
              </p>
              {nextTask && (
                <p className="mt-1 text-sm text-muted-foreground">{nextTask.description}</p>
              )}
            </div>
            {nextTask && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={nextTask.priority} />
                <CategoryBadge category={nextTask.category} />
                <Badge variant="outline" className="gap-1">
                  <CalendarClock className="h-3 w-3" />
                  by {formatDate(dateMinusDays(arrival, nextTask.recommendedDaysBefore))}
                </Badge>
              </div>
            )}
          </Card>
        </div>

        {personalizedTips.length > 0 && <PersonalizedTips tips={personalizedTips} />}

        {authConfigured && !session && <CloudSyncPrompt />}

        <CommunityPreviewCard university={profile.university} />

        <Tabs defaultValue="checklist" className="mt-6 sm:mt-8">
          <TabsList>
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="mt-6">
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              <ChecklistColumn
                title="Before departure"
                tasks={before}
                done={done}
                docs={docs}
                toggle={toggle}
                toggleDoc={toggleDoc}
                arrival={arrival}
              />
              <ChecklistColumn
                title="After arrival"
                tasks={after}
                done={done}
                docs={docs}
                toggle={toggle}
                toggleDoc={toggleDoc}
                arrival={arrival}
              />
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <Timeline tasks={personalizedTasks} done={done} arrival={arrival} />
          </TabsContent>

          <TabsContent value="resources" className="mt-6">
            <Resources university={university} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function CloudSyncPrompt() {
  return (
    <Card className="mt-5 border-primary/20 bg-primary-soft/40 p-4 sm:mt-6 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Save your roadmap</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            You're in guest mode. Create an account to sync your profile and checklist across
            devices.
          </p>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to="/auth">Create account</Link>
        </Button>
      </div>
    </Card>
  );
}

function PersonalizedTips({ tips }: { tips: Array<{ title: string; desc: string }> }) {
  return (
    <Card className="mt-5 p-4 sm:mt-6 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">For your profile</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {tips.map((tip) => (
          <div key={tip.title} className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold">{tip.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{tip.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function CommunityPreviewCard({ university }: { university: string }) {
  return (
    <Card className="mt-5 border-primary/20 bg-card p-4 sm:mt-6 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Community groups</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Join your {university} cohort groups for housing, visa, arrival and banking chat.
            </p>
          </div>
        </div>
        <Button asChild size="sm" className="shrink-0">
          <Link to="/community">
            Open community <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
    >
      <span>{meta.emoji}</span>
      {meta.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: Task["category"] }) {
  const meta = CATEGORY_META[category];
  return (
    <Badge variant="secondary" className="text-[10px]">
      {meta.emoji && <span>{meta.emoji}</span>}
      <span className={meta.emoji ? "ml-1" : ""}>{meta.label}</span>
    </Badge>
  );
}

function CategoryLabel({ category }: { category: Task["category"] }) {
  const meta = CATEGORY_META[category];
  return (
    <span>
      {meta.emoji && <span>{meta.emoji} </span>}
      {meta.label}
    </span>
  );
}

function TaskCard({
  t,
  isDone,
  toggle,
  docs,
  toggleDoc,
  arrival,
}: {
  t: Task;
  isDone: boolean;
  toggle: (id: string) => void;
  docs: Record<string, boolean>;
  toggleDoc: (taskId: string, docId: string) => void;
  arrival: Date;
}) {
  const recommended = dateMinusDays(arrival, t.recommendedDaysBefore);
  const latest = dateMinusDays(arrival, t.latestDaysBefore);

  if (isDone) {
    return (
      <li className="rounded-lg border border-success/30 bg-success/5 px-4 py-3 transition-colors">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isDone}
            onCheckedChange={() => toggle(t.id)}
            className="mt-1"
            id={t.id}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor={t.id}
                className="block cursor-pointer text-sm font-medium text-muted-foreground line-through"
              >
                {t.title}
              </label>
              <Badge variant="outline" className="border-success/40 bg-success/10 text-[10px]">
                <CheckCircle2 className="mr-1 h-3 w-3" /> Done
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <CategoryLabel category={t.category} />
              <span>Recommended: {formatDate(recommended)}</span>
              <span>Latest safe: {formatDate(latest)}</span>
            </div>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`rounded-lg border p-4 transition-colors ${isDone ? "bg-success/5 border-success/30" : "bg-card hover:bg-muted/40"}`}
    >
      <div className="flex gap-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => toggle(t.id)}
          className="mt-1"
          id={t.id}
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <label
              htmlFor={t.id}
              className={`block cursor-pointer text-sm font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}
            >
              {t.title}
            </label>
            <PriorityBadge priority={t.priority} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t.description}</p>

          <div className="mt-3 grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Recommended
              </p>
              <p className="text-xs font-semibold">{formatDate(recommended)}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Latest safe
              </p>
              <p className="text-xs font-semibold">{formatDate(latest)}</p>
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <CategoryBadge category={t.category} />
            {t.effort && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-3 w-3" /> {t.effort}
              </span>
            )}
            {t.source && (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3" /> Source: {t.source}
              </span>
            )}
            {t.link && (
              <a
                href={t.link.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                {t.link.label} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {t.warning && (
            <div className="mt-3 flex gap-2 rounded-md border border-warning/40 bg-warning/10 p-2 text-xs text-warning-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{t.warning}</span>
            </div>
          )}

          {t.requiredDocuments && t.requiredDocuments.length > 0 && (
            <div className="mt-3 rounded-md border bg-card p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <FileText className="h-3 w-3" /> Required documents
              </p>
              <ul className="space-y-1.5">
                {t.requiredDocuments.map((d) => {
                  const key = `${t.id}.${d.id}`;
                  const checked = !!docs[key];
                  return (
                    <li key={d.id} className="flex items-center gap-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={() => toggleDoc(t.id, d.id)}
                      />
                      <label
                        htmlFor={key}
                        className={`cursor-pointer text-xs ${checked ? "text-muted-foreground line-through" : ""}`}
                      >
                        {d.label}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

function ChecklistColumn({
  title,
  tasks,
  done,
  docs,
  toggle,
  toggleDoc,
  arrival,
}: {
  title: string;
  tasks: Task[];
  done: Record<string, boolean>;
  docs: Record<string, boolean>;
  toggle: (id: string) => void;
  toggleDoc: (taskId: string, docId: string) => void;
  arrival: Date;
}) {
  const completed = tasks.filter((t) => done[t.id]).length;
  return (
    <Card className="p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {completed} / {tasks.length}
        </span>
      </div>
      <ul className="space-y-3">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            t={t}
            isDone={!!done[t.id]}
            toggle={toggle}
            docs={docs}
            toggleDoc={toggleDoc}
            arrival={arrival}
          />
        ))}
      </ul>
    </Card>
  );
}

function Timeline({
  tasks,
  done,
  arrival,
}: {
  tasks: Task[];
  done: Record<string, boolean>;
  arrival: Date;
}) {
  const groups = getTimelineGroups(tasks);
  const completed = tasks.filter((task) => done[task.id]).length;
  const total = tasks.length;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Timeline</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your preparation path from early planning to the first month after arrival.
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {completed} / {total} done
        </Badge>
      </div>

      <div className="mt-4 flex gap-2 rounded-md border border-primary/30 bg-primary-soft/40 p-3 text-xs text-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          Timeline recommendations are based on typical preparation schedules. Requirements and
          processing times may vary by university, country and visa type. Always verify information
          through official sources.
        </p>
      </div>

      <div className="relative mt-8 space-y-8">
        <div className="absolute bottom-0 left-4 top-2 hidden w-px bg-border sm:block" />
        {groups.map((group) => {
          const groupDone = group.tasks.filter((task) => done[task.id]).length;
          const groupPct = Math.round((groupDone / group.tasks.length) * 100);

          return (
            <section key={group.title} className="relative sm:pl-12">
              <div className="absolute left-0 top-1 hidden h-8 w-8 place-items-center rounded-full border bg-background text-sm font-semibold shadow-sm sm:grid">
                {groupDone === group.tasks.length ? (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                ) : (
                  <span className="text-primary">{group.marker}</span>
                )}
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      {group.window}
                    </p>
                    <h3 className="mt-1 text-base font-semibold">{group.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{group.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${groupPct}%` }} />
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {groupDone} / {group.tasks.length}
                    </Badge>
                  </div>
                </div>

                <ul className="mt-4 grid gap-2">
                  {group.tasks.map((task) => {
                    const isDone = !!done[task.id];
                    const recommended = dateMinusDays(arrival, task.recommendedDaysBefore);
                    return (
                      <li
                        key={task.id}
                        className={`rounded-md border px-3 py-2 text-sm ${
                          isDone ? "border-success/30 bg-success/5" : "bg-muted/20"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isDone ? (
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                          ) : (
                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <p
                                className={`font-medium ${isDone ? "text-muted-foreground line-through" : ""}`}
                              >
                                {task.title}
                              </p>
                              <span className="shrink-0 text-xs font-medium text-primary">
                                {formatDate(recommended)}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                              <CategoryLabel category={task.category} />
                              <span>{task.effort}</span>
                              {task.priority === "high" && (
                                <span className="font-semibold text-destructive">
                                  High priority
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}
      </div>
    </Card>
  );
}

function Resources({ university }: { university: ReturnType<typeof getUniversityConfig> }) {
  const resources = [
    {
      topic: "visa",
      icon: FileText,
      title: "F-1 Visa",
      desc: "DS-160, SEVIS, interview documents and common mistakes.",
    },
    {
      topic: "housing",
      icon: Home,
      title: `${university.shortName} Housing`,
      desc: university.housing.desc,
    },
    {
      topic: "banking",
      icon: CreditCard,
      title: "Banking",
      desc: "Wise, US banks, cards, transfers and payment setup.",
    },
    {
      topic: "phone",
      icon: Smartphone,
      title: "Phone Plans",
      desc: "eSIMs, US numbers, prepaid plans and first-day connectivity.",
    },
    {
      topic: "arrival",
      icon: Plane,
      title: "Arrival Guide",
      desc: university.arrival.desc,
    },
    {
      topic: "scholarships",
      icon: DollarSign,
      title: "Scholarships",
      desc: "Funding options, deadlines and budget checklist.",
    },
    {
      topic: "insurance",
      icon: ShieldCheck,
      title: "Health Insurance",
      desc: "University insurance, waiver criteria and health coverage reminders.",
    },
  ] as const;

  return (
    <div className="space-y-5">
      <Card className="border-primary/30 bg-primary-soft/40 p-5">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold">Need help? Ask the AI assistant</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get answers grounded in official sources for visa, housing, insurance, banking and
              arrival at {university.shortName}.
            </p>
          </div>
          <Button asChild size="sm">
            <Link to="/assistant">Open assistant</Link>
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => (
          <Card key={resource.topic} className="p-5 transition-colors hover:bg-muted/40">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                <resource.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold">{resource.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{resource.desc}</p>
                <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">
                  <Link to="/resources/$topic" params={{ topic: resource.topic }}>
                    Open guide <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function durationLabel(d: string) {
  return (
    {
      "one-semester": "One semester",
      "two-semesters": "Two semesters / full academic year",
      "full-year": "Two semesters / full academic year",
      other: "Custom duration",
    }[d] ?? d
  );
}

function sortTasksByRecommendedDate(tasks: Task[]) {
  return [...tasks].sort((a, b) => b.recommendedDaysBefore - a.recommendedDaysBefore);
}

function getTimelineGroups(tasks: Task[]) {
  const before = tasks.filter((task) => task.phase === "before");
  const after = tasks.filter((task) => task.phase === "after");

  return [
    {
      title: "Visa and funding first",
      window: "As early as possible",
      desc: "Start with the items that can block the rest of your exchange.",
      marker: "1",
      tasks: sortTasksByRecommendedDate(
        before.filter(
          (task) =>
            task.category === "visa" ||
            task.category === "scholarship" ||
            task.recommendedDaysBefore >= 80,
        ),
      ),
    },
    {
      title: "Housing window",
      window: "2-3 months before",
      desc: "Housing near your host campus can be competitive, so this deserves its own planning block.",
      marker: "2",
      tasks: sortTasksByRecommendedDate(before.filter((task) => task.category === "housing")),
    },
    {
      title: "Final setup",
      window: "Last 30 days",
      desc: "Insurance, flights, banking and phone setup before you leave.",
      marker: "3",
      tasks: sortTasksByRecommendedDate(
        before.filter(
          (task) =>
            task.recommendedDaysBefore < 45 &&
            task.category !== "housing" &&
            task.category !== "visa" &&
            task.category !== "scholarship",
        ),
      ),
    },
    {
      title: "Arrival week",
      window: "First days on campus",
      desc: "Campus setup, student ID, transport and immediate admin.",
      marker: "4",
      tasks: sortTasksByRecommendedDate(after.filter((task) => task.recommendedDaysBefore >= -14)),
    },
    {
      title: "After arrival",
      window: "First month",
      desc: "Finish the remaining campus and local-life setup.",
      marker: "5",
      tasks: sortTasksByRecommendedDate(after.filter((task) => task.recommendedDaysBefore < -14)),
    },
  ].filter((group) => group.tasks.length > 0);
}

function getPersonalizedTasks(profile: ProfileQuestionnaire) {
  const university = getUniversityConfig(profile.university);
  const tasks = TASKS.map((task) => personalizeTaskForUniversity(task, university));

  if (isLikelyUsNational(profile.nationality)) {
    return tasks.filter((task) => task.category !== "visa");
  }

  return tasks;
}

function personalizeTaskForUniversity(
  task: Task,
  university: ReturnType<typeof getUniversityConfig>,
): Task {
  if (university.name !== "Stanford University") return task;

  if (task.id === "housing-search") {
    return {
      ...task,
      source: "Stanford R&DE Student Housing",
      warning: "Stanford housing eligibility and deadlines vary by program. Start early.",
      link: { label: "Stanford Housing", url: "https://rde.stanford.edu/studenthousing" },
    };
  }

  if (task.id === "housing-secure") {
    return {
      ...task,
      source: "Stanford R&DE Student Housing",
      warning: "For off-campus housing near Stanford, verify listings carefully before paying.",
    };
  }

  if (task.id === "insurance") {
    return {
      ...task,
      title: "Check Cardinal Care health insurance",
      description:
        "US healthcare is expensive. Check whether Stanford Cardinal Care applies or whether you can waive.",
      source: "Stanford Vaden Health Services",
      link: {
        label: "Cardinal Care",
        url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
      },
    };
  }

  if (task.id === "student-card") {
    return {
      ...task,
      title: "Obtain your Stanford ID Card",
      description: "Your official Stanford ID for campus access and university services.",
      source: "Stanford University IT",
    };
  }

  if (task.id === "register-classes") {
    return {
      ...task,
      description: "Use Axess to manage enrollment and student records.",
      source: "Stanford Axess",
    };
  }

  if (task.id === "transport") {
    return {
      ...task,
      description: "Understand Marguerite shuttle, Caltrain and local transport options.",
    };
  }

  if (task.id === "emergency") {
    return {
      ...task,
      description: "Save Stanford public safety, embassy, insurance hotline and a local contact.",
    };
  }

  if (task.id === "arrival-reqs") {
    return {
      ...task,
      description:
        "Check Bechtel International Center guidance, immigration check-in, orientation and health requirements.",
      source: "Bechtel International Center",
      link: {
        label: "Bechtel International Center",
        url: "https://bechtel.stanford.edu/",
      },
    };
  }

  return task;
}

function getPersonalizedTips(profile: ProfileQuestionnaire) {
  const tips: Array<{ title: string; desc: string }> = [];

  if (isLikelyUsNational(profile.nationality)) {
    tips.push({
      title: "Visa tasks hidden",
      desc: "Your nationality looks US-based, so F-1 visa tasks are removed from this roadmap.",
    });
  } else if (isLikelyFrenchOrEu(profile.nationality)) {
    tips.push({
      title: "Visa timing",
      desc: "As an EU/French student, prioritize I-20, SEVIS, DS-160 and embassy appointment timing early.",
    });
  } else {
    tips.push({
      title: "Check embassy rules",
      desc: "Visa timing depends on your nationality and local embassy wait times. Verify deadlines early.",
    });
  }

  if (profile.duration === "one-semester") {
    tips.push({
      title: "One-semester housing",
      desc: "Avoid 12-month leases when possible. Prioritize sublets, I-House or flexible student housing.",
    });
    tips.push({
      title: "Keep setup lightweight",
      desc: "For a short stay, eSIM + Wise/card setup may be enough before opening a full US bank account.",
    });
  } else if (profile.duration === "two-semesters" || profile.duration === "full-year") {
    tips.push({
      title: "Longer stay setup",
      desc: "A US phone number, US bank account and more stable housing can be worth setting up early.",
    });
    tips.push({
      title: "Budget planning",
      desc: "Plan for deposits, insurance, holiday housing gaps and exchange-rate changes across the year.",
    });
  } else {
    tips.push({
      title: "Flexible duration",
      desc: "Double-check housing contracts and insurance coverage match your exact stay length.",
    });
  }

  return tips.slice(0, 3);
}

function isLikelyUsNational(nationality: string) {
  const value = nationality.toLowerCase();
  return ["american", "united states", "usa", "u.s.", "us citizen"].some((term) =>
    value.includes(term),
  );
}

function isLikelyFrenchOrEu(nationality: string) {
  const value = nationality.toLowerCase();
  return [
    "french",
    "france",
    "german",
    "italian",
    "spanish",
    "dutch",
    "belgian",
    "portuguese",
    "polish",
    "europe",
    "eu",
  ].some((term) => value.includes(term));
}

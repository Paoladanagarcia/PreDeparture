import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { isCalendarInput } from "@/lib/planning-demo";
import { getTaskText } from "@/lib/task-text";
import { getPersonalizedTasks, customTaskToTask } from "@/lib/personalized-tasks";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile, useProgress, type CustomChecklistTask } from "@/lib/storage";
import type { ResourceGuideTopic } from "@/lib/resource-guides";
import { useAuth } from "@/lib/auth";
import {
  CATEGORY_META,
  PRIORITY_META,
  dateMinusDays,
  formatDate,
  parseCalendarDate,
  toCalendarDate,
  type ProfileQuestionnaire,
  type Priority,
  type Task,
  type TaskCategory,
} from "@/lib/tasks";
import { AppHeader } from "@/components/AppHeader";
import { translateDuration, useI18n, type Language } from "@/lib/i18n";
import {
  getUniversityConfig,
  UNIVERSITY_OPTIONS,
  type SupportedUniversity,
} from "@/lib/universities";
import {
  MoreHorizontal,
  ExternalLink,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Info,
  ShieldCheck,
  FileText,
  EyeOff,
  Plus,
  Trash2,
  Undo2,
} from "lucide-react";

import { NextActions, TaskStatusControl } from "@/components/NextActions";
import {
  planNextActions,
  actionStatusLabel,
  STARTED_NAMESPACE,
  type ActionDecision,
  type ActionStatus,
  planningAttention,
  matchesPlanningFilter,
  type PlanningFilter,
  type AttentionFilter,
} from "@/lib/next-actions";

const TASK_CATEGORIES: TaskCategory[] = [
  "visa",
  "housing",
  "insurance",
  "banking",
  "phone",
  "travel",
  "university",
  "scholarship",
];

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
  const { profile, setProfile, loaded: profileLoaded } = useProfile();
  const {
    done: savedDone,
    docs: savedDocs,
    customTasks: savedCustomTasks,
    hiddenTaskIds: savedHiddenTaskIds,
    toggle: toggleSaved,
    toggleDoc: toggleSavedDoc,
    addCustomTask,
    deleteCustomTask,
    hideTask,
    restoreTask,
    reset: resetSaved,
  } = useProgress();
  const { configured: authConfigured, session, loading: authLoading } = useAuth();
  const { language, t } = useI18n();
  const [previewProfile, setPreviewProfile] = useState<ProfileQuestionnaire>(() =>
    getDefaultDashboardProfile(),
  );
  const savedProfile = session ? profile : null;
  const effectiveProfile = savedProfile ?? previewProfile;
  const isExample = !savedProfile;
  const [previewDateChosen, setPreviewDateChosen] = useState(false);
  const [previewDone, setPreviewDone] = useState<Record<string, boolean>>({});
  const [previewDocs, setPreviewDocs] = useState<Record<string, boolean>>({});
  const done = isExample ? previewDone : savedDone;
  const docs = isExample ? previewDocs : savedDocs;
  const customTasks = isExample ? [] : savedCustomTasks;
  const hiddenTaskIds = isExample ? [] : savedHiddenTaskIds;
  const showTiming = !isExample || previewDateChosen;
  const toggle = (id: string) =>
    isExample ? setPreviewDone((current) => ({ ...current, [id]: !current[id] })) : toggleSaved(id);
  const toggleDoc = (id: string, docId: string) =>
    isExample
      ? setPreviewDocs((current) => ({
          ...current,
          [`${id}.${docId}`]: !current[`${id}.${docId}`],
        }))
      : toggleSavedDoc(id, docId);
  const reset = () => {
    if (isExample) {
      setPreviewDone({});
      setPreviewDocs({});
    } else resetSaved();
  };
  const [activeTab, setActiveTab] = useState("checklist");
  const checklistRef = useRef<HTMLDivElement>(null);
  const [focusChecklist, setFocusChecklist] = useState(false);

  function updateDashboardProfile(next: ProfileQuestionnaire) {
    if (!isCalendarInput(next.startDate)) return;
    if (savedProfile) {
      setProfile(next);
    } else {
      if (next.startDate !== previewProfile.startDate) setPreviewDateChosen(true);
      setPreviewProfile(next);
    }
  }

  const arrival = useMemo(
    () => (effectiveProfile.startDate ? parseCalendarDate(effectiveProfile.startDate) : new Date()),
    [effectiveProfile.startDate],
  );

  const personalizedTasks = useMemo(() => {
    const hidden = new Set(hiddenTaskIds);
    return [
      ...getPersonalizedTasks(effectiveProfile).filter((task) => !hidden.has(task.id)),
      ...customTasks.map((task) => customTaskToTask(task, arrival)),
    ];
  }, [arrival, customTasks, effectiveProfile, hiddenTaskIds]);

  const hiddenStandardTasks = useMemo(() => {
    const hidden = new Set(hiddenTaskIds);
    return getPersonalizedTasks(effectiveProfile).filter((task) => hidden.has(task.id));
  }, [effectiveProfile, hiddenTaskIds]);

  const completed = personalizedTasks.filter((t) => done[t.id]).length;
  const total = personalizedTasks.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const [today, setToday] = useState(() => new Date());
  const [statusFilter, setStatusFilter] = useState<PlanningFilter>("all");
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);
  const plan = planNextActions(personalizedTasks, arrival, done, docs, today);
  const decisions = new Map(
    plan.decisions.map((d) => [d.task.id, showTiming ? d : { ...d, urgent: false }]),
  );
  const attention = planningAttention(plan.decisions);
  const filteredTasks = plan.decisions
    .filter((decision) => matchesPlanningFilter(decision, statusFilter))
    .map((decision) => decision.task);
  const showAttention = (filter: AttentionFilter) => {
    setStatusFilter(filter);
    setActiveTab("checklist");
    setFocusChecklist(true);
  };
  useEffect(() => {
    if (!focusChecklist) return;
    checklistRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    checklistRef.current?.focus({ preventScroll: true });
    setFocusChecklist(false);
  }, [focusChecklist, activeTab, statusFilter]);
  const toggleStarted = (id: string) => toggleDoc(STARTED_NAMESPACE, id);
  const taskTitle = (task: Task) => getTaskText(task, language).title;

  const before = sortTasksByRecommendedDate(filteredTasks.filter((t) => t.phase === "before"));
  const after = sortTasksByRecommendedDate(filteredTasks.filter((t) => t.phase === "after"));

  if (authLoading || !profileLoaded)
    return (
      <div className="min-h-screen bg-muted/30">
        <AppHeader active="dashboard" />
        <p role="status" className="mx-auto max-w-6xl p-6">
          {language === "fr" ? "Chargement du planning…" : "Loading your plan…"}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        {isExample && (
          <section
            className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4"
            aria-label={language === "fr" ? "Planning d’exemple" : "Example plan"}
          >
            <p className="font-semibold text-primary">
              {language === "fr" ? "Planning d’exemple" : "Example plan"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "fr"
                ? "Personnalisez votre date d’arrivée pour essayer les priorités. Cette simulation n’est pas enregistrée et ne modifie aucun planning personnel."
                : "Choose your arrival date to try the priorities. This simulation is not saved and does not change a personal plan."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => document.getElementById("dashboard-arrival")?.focus()}
            >
              {language === "fr" ? "Choisir ma date d’arrivée" : "Choose my arrival date"}
            </Button>
          </section>
        )}
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("dashboard.headingTo")}
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl md:text-2xl">
              {effectiveProfile.university},{" "}
              {language === "fr" && effectiveProfile.country === "United States"
                ? "États-Unis"
                : effectiveProfile.country}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {language === "fr"
                ? effectiveProfile.nationality === "International"
                  ? "Étudiant international"
                  : `Étudiant · ${effectiveProfile.nationality}`
                : `${effectiveProfile.nationality} ${t("dashboard.student")}`}{" "}
              · {t("dashboard.arriving")}{" "}
              {arrival.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
                dateStyle: "long",
              })}{" "}
              · {translateDuration(effectiveProfile.duration, t)}
            </p>

            <div className="mt-4 sm:mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {pct}% {t("dashboard.ready")}
                </span>
                <span className="text-muted-foreground">
                  {completed} / {total} {t("dashboard.done")}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          </Card>

          <DashboardSettingsCard profile={effectiveProfile} onChange={updateDashboardProfile} />
        </div>

        <NextActions
          actions={plan.next}
          urgentCount={attention.all.length}
          actionableCount={attention.now.length}
          waitingCount={attention.waiting.length}
          onShowAttention={showAttention}
          showTiming={showTiming}
          example={isExample}
          remaining={total - completed}
          onToggleStarted={toggleStarted}
          onDone={toggle}
          title={taskTitle}
        />

        {authConfigured && !session && <CloudSyncPrompt />}
        {session && isExample && (
          <Card className="mt-4 p-4">
            <p className="text-sm text-muted-foreground">
              {language === "fr"
                ? "Prêt à créer votre propre planning ?"
                : "Ready to create your own plan?"}
            </p>
            <Button asChild className="mt-2" size="sm">
              <Link to="/onboarding">{t("landing.createPlan")}</Link>
            </Button>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5 sm:mt-6">
          <TabsList>
            <TabsTrigger value="checklist">{t("dashboard.checklist")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("dashboard.timeline")}</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="mt-5">
            <div
              ref={checklistRef}
              tabIndex={-1}
              className="scroll-mt-24 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{t("dashboard.checklist")}</h2>
                  <p className="text-sm text-muted-foreground">{t("dashboard.trackDone")}</p>
                </div>
                <Button variant="outline" size="sm" onClick={reset}>
                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> {t("common.resetChecklist")}
                </Button>
              </div>

              <div
                className="mb-4 flex flex-wrap gap-2"
                aria-label={language === "fr" ? "Filtrer les étapes" : "Filter steps"}
              >
                {(["all", "todo", "in-progress", "blocked", "done"] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    size="sm"
                    variant={statusFilter === status ? "default" : "outline"}
                    aria-pressed={statusFilter === status}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all"
                      ? language === "fr"
                        ? "Toutes"
                        : "All"
                      : actionStatusLabel(status, language === "fr")}
                    {" · "}
                    {status === "all"
                      ? total
                      : plan.decisions.filter((d) => d.status === status).length}
                  </Button>
                ))}
              </div>
              {statusFilter.startsWith("attention") && (
                <div
                  role="status"
                  className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm"
                >
                  <p>
                    {language === "fr"
                      ? "Étapes correspondant au compteur"
                      : "Steps matching the count"}{" "}
                    · {filteredTasks.length}
                    {statusFilter === "attention-waiting"
                      ? language === "fr"
                        ? " — en attente d’une autre démarche"
                        : " — waiting on another task"
                      : ""}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setStatusFilter("all")}
                  >
                    {language === "fr" ? "Voir toutes les étapes" : "Show all steps"}
                  </Button>
                </div>
              )}
              {filteredTasks.length === 0 && (
                <p className="mb-4 text-sm text-muted-foreground">
                  {language === "fr"
                    ? "Aucune étape dans ce statut."
                    : "No steps with this status."}
                </p>
              )}
              {!isExample && (
                <ChecklistCustomization
                  canSync={Boolean(session)}
                  onAdd={addCustomTask}
                  hiddenTasks={hiddenStandardTasks}
                  onRestore={restoreTask}
                />
              )}

              <Tabs
                defaultValue={before.length ? "before" : "after"}
                key={statusFilter}
                className="mt-4"
              >
                <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start">
                  <TabsTrigger value="before">
                    {t("dashboard.beforeDeparture")} · {before.length}
                  </TabsTrigger>
                  <TabsTrigger value="after">
                    {t("dashboard.afterArrival")} · {after.length}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="before">
                  <ChecklistColumn
                    title={t("dashboard.beforeDeparture")}
                    tasks={before}
                    decisions={decisions}
                    done={done}
                    docs={docs}
                    toggle={toggle}
                    toggleDoc={toggleDoc}
                    hideTask={hideTask}
                    deleteCustomTask={deleteCustomTask}
                    canCustomize={!isExample}
                    university={effectiveProfile.university}
                    arrival={arrival}
                  />
                </TabsContent>
                <TabsContent value="after">
                  <ChecklistColumn
                    title={t("dashboard.afterArrival")}
                    tasks={after}
                    decisions={decisions}
                    done={done}
                    docs={docs}
                    toggle={toggle}
                    toggleDoc={toggleDoc}
                    hideTask={hideTask}
                    deleteCustomTask={deleteCustomTask}
                    canCustomize={!isExample}
                    university={effectiveProfile.university}
                    arrival={arrival}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-5">
            <Timeline tasks={personalizedTasks} done={done} arrival={arrival} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function CloudSyncPrompt() {
  const { t } = useI18n();

  return (
    <Card className="mt-4 border-primary/15 bg-primary-soft/30 p-3 sm:mt-5 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <h2 className="text-xs font-semibold">{t("dashboard.saveRoadmap")}</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t("dashboard.saveRoadmapDesc")}</p>
        </div>
        <Button asChild size="sm" className="h-8 shrink-0 px-3 text-xs">
          <Link to="/auth">{t("dashboard.createAccount")}</Link>
        </Button>
      </div>
    </Card>
  );
}

function DashboardSettingsCard({
  profile,
  onChange,
}: {
  profile: ProfileQuestionnaire;
  onChange: (profile: ProfileQuestionnaire) => void;
}) {
  const { language, t } = useI18n();
  const [dateInput, setDateInput] = useState(profile.startDate);
  useEffect(() => setDateInput(profile.startDate), [profile.startDate]);

  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("dashboard.customize")}
      </p>
      <p className="mt-2 text-lg font-semibold">{t("dashboard.customizeTitle")}</p>

      <div className="mt-4 grid gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="dashboard-university" className="text-xs">
            {t("onboarding.universityLabel")}
          </Label>
          <Select
            value={profile.university}
            onValueChange={(university) => onChange({ ...profile, university })}
          >
            <SelectTrigger id="dashboard-university">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIVERSITY_OPTIONS.map((university) => (
                <SelectItem key={university} value={university}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dashboard-arrival" className="text-xs">
            {t("onboarding.arrivalLabel")}
          </Label>
          <Input
            id="dashboard-arrival"
            type="date"
            value={dateInput}
            aria-invalid={!isCalendarInput(dateInput)}
            onChange={(event) => {
              setDateInput(event.target.value);
              if (isCalendarInput(event.target.value))
                onChange({ ...profile, startDate: event.target.value });
            }}
          />
        </div>
      </div>
    </Card>
  );
}

function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const { language } = useI18n();
  const meta = PRIORITY_META[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${meta.className}`}
    >
      <span>{meta.emoji}</span>
      {getPriorityLabel(priority, language)}
    </span>
  );
}

function CategoryBadge({ category }: { category: Task["category"] }) {
  const { language } = useI18n();
  const meta = CATEGORY_META[category];
  return (
    <Badge variant="secondary" className="text-[10px]">
      {meta.emoji && <span>{meta.emoji}</span>}
      <span className={meta.emoji ? "ml-1" : ""}>{getCategoryLabel(category, language)}</span>
    </Badge>
  );
}

function CategoryLabel({ category }: { category: Task["category"] }) {
  const { language } = useI18n();
  const meta = CATEGORY_META[category];
  return (
    <span>
      {meta.emoji && <span>{meta.emoji} </span>}
      {getCategoryLabel(category, language)}
    </span>
  );
}

function ChecklistCustomization({
  canSync,
  hiddenTasks,
  onAdd,
  onRestore,
}: {
  canSync: boolean;
  hiddenTasks: Task[];
  onAdd: (task: Omit<CustomChecklistTask, "id">) => void;
  onRestore: (id: string) => void;
}) {
  const { language, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recommendedDate, setRecommendedDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [phase, setPhase] = useState<"before" | "after">("before");
  const [category, setCategory] = useState<TaskCategory>("university");
  const [priority, setPriority] = useState<Priority>("medium");

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle || !recommendedDate) return;

    onAdd({
      title: cleanTitle,
      description: description.trim() || t("dashboard.customTaskDefaultDesc"),
      category,
      phase,
      recommendedDate,
      latestDate: latestDate || recommendedDate,
      priority,
    });
    setTitle("");
    setDescription("");
    setRecommendedDate("");
    setLatestDate("");
    setPhase("before");
    setCategory("university");
    setPriority("medium");
    setOpen(false);
  }

  if (!canSync) {
    return (
      <Card className="mb-4 border-primary/15 bg-primary-soft/25 p-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{t("dashboard.customTasksSignIn")}</p>
          <Button asChild size="sm" className="h-8 px-3 text-xs">
            <Link to="/auth">{t("common.signIn")}</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mb-4 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">{t("dashboard.customTasksTitle")}</h3>
          <p className="text-xs text-muted-foreground">{t("dashboard.customTasksDesc")}</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setOpen((value) => !value)}
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          {t("dashboard.addTask")}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-3 border-t pt-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="custom-task-title">{t("dashboard.taskTitle")}</Label>
              <Input
                id="custom-task-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={90}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-task-date">{t("dashboard.recommendedDate")}</Label>
              <Input
                id="custom-task-date"
                type="date"
                value={recommendedDate}
                onChange={(event) => setRecommendedDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="custom-task-description">{t("dashboard.taskDescription")}</Label>
            <Textarea
              id="custom-task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              maxLength={240}
              rows={2}
            />
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label>{t("dashboard.phase")}</Label>
              <Select
                value={phase}
                onValueChange={(value) => setPhase(value as "before" | "after")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">{t("dashboard.beforeDeparture")}</SelectItem>
                  <SelectItem value="after">{t("dashboard.afterArrival")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.category")}</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value as TaskCategory)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TASK_CATEGORIES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {getCategoryLabel(item, language)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.priority")}</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">{t("common.highPriority")}</SelectItem>
                  <SelectItem value="medium">{t("dashboard.mediumPriority")}</SelectItem>
                  <SelectItem value="low">{t("dashboard.lowPriority")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-task-latest">{t("dashboard.latestDate")}</Label>
              <Input
                id="custom-task-latest"
                type="date"
                value={latestDate}
                onChange={(event) => setLatestDate(event.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" size="sm">
              {t("dashboard.saveTask")}
            </Button>
          </div>
        </form>
      )}

      {hiddenTasks.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("dashboard.hiddenTasks")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {hiddenTasks.map((task) => (
              <Button
                key={task.id}
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => onRestore(task.id)}
              >
                <Undo2 className="mr-1 h-3 w-3" />
                {getTaskText(task, language).title}
              </Button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function TaskCard({
  t,
  isDone,
  decision,
  toggle,
  docs,
  toggleDoc,
  hideTask,
  deleteCustomTask,
  canCustomize,
  university,
  arrival,
  hideGuide = false,
}: {
  t: Task;
  isDone: boolean;
  decision?: ActionDecision;
  toggle: (id: string) => void;
  docs: Record<string, boolean>;
  toggleDoc: (taskId: string, docId: string) => void;
  hideTask: (id: string) => void;
  deleteCustomTask: (id: string) => void;
  canCustomize: boolean;
  university: string;
  arrival: Date;
  hideGuide?: boolean;
}) {
  const { language, t: translate } = useI18n();
  const taskText = getTaskText(t, language);
  const recommended = dateMinusDays(arrival, t.recommendedDaysBefore);
  const latest = dateMinusDays(arrival, t.latestDaysBefore);
  const isCustom = t.id.startsWith("custom-");
  const removeLabel = isCustom
    ? translate("dashboard.deleteTask")
    : translate("dashboard.hideTask");
  const RemoveIcon = isCustom ? Trash2 : EyeOff;
  const guideTopic = getTaskGuideTopic(t);
  const guideSearch = getGuideSearch(university);
  const handleRemove = () => {
    if (isCustom) deleteCustomTask(t.id);
    else hideTask(t.id);
  };

  const status = decision?.status ?? (isDone ? "done" : "todo");
  return (
    <li className={`rounded-xl border p-4 sm:p-5 ${isDone ? "bg-muted/30" : "bg-card"}`}>
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isDone}
          onCheckedChange={() => toggle(t.id)}
          className="mt-1"
          id={t.id}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <label
              htmlFor={t.id}
              className={`cursor-pointer text-sm font-semibold ${isDone ? "text-muted-foreground line-through" : ""}`}
            >
              {taskText.title}
            </label>
            {canCustomize && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="-mt-1 h-8 w-8 shrink-0"
                    aria-label={`${language === "fr" ? "Options pour" : "Options for"} ${taskText.title}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={handleRemove}>
                    <RemoveIcon className="mr-2 h-4 w-4" />
                    {removeLabel}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {translate("common.latestSafe")} : {formatDate(latest, language)}
          </p>
          {status === "blocked" && (
            <p className="mt-2 text-xs text-muted-foreground">
              {language === "fr" ? "En attente de" : "Waiting for"} :{" "}
              {decision?.waitingFor.map((task) => getTaskText(task, language).title).join(", ")}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {status === "todo" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2"
                onClick={() => toggleDoc(STARTED_NAMESPACE, t.id)}
              >
                {language === "fr" ? "Commencer" : "Start"}
              </Button>
            )}
            {status === "in-progress" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2 text-primary"
                onClick={() => toggleDoc(STARTED_NAMESPACE, t.id)}
                aria-label={
                  language === "fr"
                    ? "En cours — remettre à commencer"
                    : "In progress — mark as not started"
                }
              >
                {actionStatusLabel(status, language === "fr")}
              </Button>
            )}
            {isDone && (
              <span className="text-xs text-muted-foreground">{translate("common.done")}</span>
            )}
            {guideTopic && !hideGuide && (
              <Button asChild variant="outline" size="sm" className="h-8">
                <Link to="/resources/$topic" params={{ topic: guideTopic }} search={guideSearch}>
                  {translate("resources.openGuide")}
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>
          <details className="group mt-3">
            <summary className="w-fit cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2">
              <span className="group-open:hidden">
                {language === "fr" ? "Voir les détails" : "View details"}
              </span>
              <span className="hidden group-open:inline">
                {language === "fr" ? "Fermer les détails" : "Hide details"}
              </span>
            </summary>
            <div className="mt-3 border-t pt-3">
              <p className="mt-1 text-xs text-muted-foreground">{taskText.description}</p>

              <div className="mt-3 grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {translate("common.recommended")}
                  </p>
                  <p className="text-xs font-semibold">{formatDate(recommended, language)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    {translate("common.latestSafe")}
                  </p>
                  <p className="text-xs font-semibold">{formatDate(latest, language)}</p>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <CategoryBadge category={t.category} />
                {t.effort && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> {formatEffort(t.effort, language)}
                  </span>
                )}
                {t.source && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ShieldCheck className="h-3 w-3" /> {translate("common.source")}: {t.source}
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
                  <span>{taskText.warning ?? t.warning}</span>
                </div>
              )}

              {t.requiredDocuments && t.requiredDocuments.length > 0 && (
                <div className="mt-3 rounded-md border bg-card p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-3 w-3" /> {translate("common.requiredDocuments")}
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
                            {taskText.docs?.[d.id] ?? d.label}
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </li>
  );
}

function ChecklistColumn({
  title,
  tasks,
  decisions,
  done,
  docs,
  toggle,
  toggleDoc,
  hideTask,
  deleteCustomTask,
  canCustomize,
  university,
  arrival,
}: {
  title: string;
  tasks: Task[];
  decisions: Map<string, ActionDecision>;
  done: Record<string, boolean>;
  docs: Record<string, boolean>;
  toggle: (id: string) => void;
  toggleDoc: (taskId: string, docId: string) => void;
  hideTask: (id: string) => void;
  deleteCustomTask: (id: string) => void;
  canCustomize: boolean;
  university: string;
  arrival: Date;
}) {
  const { language, t: translate } = useI18n();
  const fundingIds = ["scholarships-research", "scholarships-prepare", "scholarships-submit"];
  const funding = tasks.filter((task) => fundingIds.includes(task.id));
  const allFunding = [...decisions.values()].filter((d) => fundingIds.includes(d.task.id));
  const renderTask = (task: Task, hideGuide = false) => (
    <TaskCard
      key={task.id}
      t={task}
      isDone={!!done[task.id]}
      decision={decisions.get(task.id)}
      toggle={toggle}
      docs={docs}
      toggleDoc={toggleDoc}
      hideTask={hideTask}
      deleteCustomTask={deleteCustomTask}
      canCustomize={canCustomize}
      university={university}
      arrival={arrival}
      hideGuide={hideGuide}
    />
  );
  const completed = tasks.filter((t) => done[t.id]).length;
  return (
    <Card className="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-muted-foreground">
          {completed} / {tasks.length}
        </span>
      </div>
      <ul className="space-y-3">
        {funding.length > 0 && (
          <li className="rounded-xl border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">
                {language === "fr" ? "Préparer mon financement" : "Plan my funding"}
              </h3>
              {canCustomize && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={language === "fr" ? "Options du financement" : "Funding options"}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => allFunding.forEach((d) => hideTask(d.task.id))}
                    >
                      {language === "fr"
                        ? "Non concerné — masquer ces étapes"
                        : "Not applicable — hide these steps"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {allFunding.filter((d) => done[d.task.id]).length}/{allFunding.length}{" "}
              {language === "fr" ? "étapes terminées" : "steps completed"}
            </p>
            <Button asChild variant="outline" size="sm" className="mt-3 h-8">
              <Link
                to="/resources/$topic"
                params={{ topic: "scholarships" }}
                search={getGuideSearch(university)}
              >
                {translate("resources.openGuide")}
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <details className="group mt-3">
              <summary className="w-fit cursor-pointer text-xs font-medium text-muted-foreground">
                <span className="group-open:hidden">
                  {language === "fr" ? "Voir les étapes" : "View steps"}
                </span>
                <span className="hidden group-open:inline">
                  {language === "fr" ? "Fermer les étapes" : "Hide steps"}
                </span>
              </summary>
              <ul className="mt-3 space-y-2">{funding.map((task) => renderTask(task, true))}</ul>
            </details>
          </li>
        )}
        {tasks.filter((task) => !fundingIds.includes(task.id)).map((task) => renderTask(task))}
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
  const { language, t } = useI18n();
  const groups = getTimelineGroups(tasks);
  const completed = tasks.filter((task) => done[task.id]).length;
  const total = tasks.length;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("dashboard.timeline")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("timeline.description")}</p>
        </div>
        <Badge variant="outline" className="shrink-0">
          {completed} / {total} {t("common.done")}
        </Badge>
      </div>

      <div className="mt-4 flex gap-2 rounded-md border border-primary/30 bg-primary-soft/40 p-3 text-xs text-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>{t("timeline.note")}</p>
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
                                {formatDate(recommended, language)}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                              <CategoryLabel category={task.category} />
                              <span>{formatEffort(task.effort, language)}</span>
                              {task.priority === "high" && (
                                <span className="font-semibold text-destructive">
                                  {t("common.highPriority")}
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

function getDefaultDashboardProfile(): ProfileQuestionnaire {
  const arrival = new Date();
  arrival.setMonth(arrival.getMonth() + 6);

  return {
    country: "United States",
    university: "UC Berkeley",
    nationality: "International",
    startDate: toCalendarDate(arrival),
    duration: "one-semester",
  };
}

function getTaskGuideTopic(task: Task): ResourceGuideTopic | null {
  if (task.category === "visa") return "visa";
  if (task.category === "housing") return "housing";
  if (task.category === "insurance") return "insurance";
  if (task.category === "banking") return "banking";
  if (task.category === "phone") return "phone";
  if (task.category === "scholarship") return "scholarships";
  if (task.category === "travel" || task.category === "university") return "arrival";
  return null;
}

function getGuideSearch(university: string): { university?: SupportedUniversity } {
  return UNIVERSITY_OPTIONS.includes(university as SupportedUniversity)
    ? { university: university as SupportedUniversity }
    : {};
}

function getCategoryLabel(category: Task["category"], language: Language) {
  if (language !== "fr") return CATEGORY_META[category].label;
  return (
    {
      visa: "Visa",
      housing: "Logement",
      insurance: "Assurance",
      banking: "Banque",
      phone: "Téléphone",
      travel: "Voyage",
      university: "Université",
      scholarship: "Bourse",
    } satisfies Record<Task["category"], string>
  )[category];
}

function getPriorityLabel(priority: Task["priority"], language: Language) {
  if (language !== "fr") return PRIORITY_META[priority].label;
  return (
    {
      high: "Priorité élevée",
      medium: "Priorité moyenne",
      low: "Priorité basse",
    } satisfies Record<Task["priority"], string>
  )[priority];
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

function formatEffort(value: string | undefined, language: string) {
  if (!value || language !== "fr") return value;
  return value
    .replace(/\bhours\b/g, "heures")
    .replace(/\bhour\b/g, "heure")
    .replace(/\bdays\b/g, "jours")
    .replace(/\bday\b/g, "jour")
    .replace(/^Custom$/, "Personnalisé");
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, type FormEvent } from "react";
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
  TASKS,
  CATEGORY_META,
  PRIORITY_META,
  dateMinusDays,
  formatDate,
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
  const { profile, setProfile } = useProfile();
  const {
    done,
    docs,
    customTasks,
    hiddenTaskIds,
    toggle,
    toggleDoc,
    addCustomTask,
    deleteCustomTask,
    hideTask,
    restoreTask,
    reset,
  } = useProgress();
  const { configured: authConfigured, session } = useAuth();
  const { language, t } = useI18n();
  const [previewProfile, setPreviewProfile] = useState<ProfileQuestionnaire>(() =>
    getDefaultDashboardProfile(),
  );
  const savedProfile = session ? profile : null;
  const effectiveProfile = savedProfile ?? previewProfile;

  function updateDashboardProfile(next: ProfileQuestionnaire) {
    if (savedProfile) {
      setProfile(next);
    } else {
      setPreviewProfile(next);
    }
  }

  const arrival = useMemo(
    () => (effectiveProfile.startDate ? new Date(effectiveProfile.startDate) : new Date()),
    [effectiveProfile.startDate],
  );

  const personalizedTasks = useMemo(
    () => {
      const hidden = new Set(hiddenTaskIds);
      return [
        ...getPersonalizedTasks(effectiveProfile).filter((task) => !hidden.has(task.id)),
        ...customTasks.map((task) => customTaskToTask(task, arrival)),
      ];
    },
    [arrival, customTasks, effectiveProfile, hiddenTaskIds],
  );

  const hiddenStandardTasks = useMemo(() => {
    const hidden = new Set(hiddenTaskIds);
    return getPersonalizedTasks(effectiveProfile).filter((task) => hidden.has(task.id));
  }, [effectiveProfile, hiddenTaskIds]);

  const completed = personalizedTasks.filter((t) => done[t.id]).length;
  const total = personalizedTasks.length;
  const pct = Math.round((completed / total) * 100);

  const before = sortTasksByRecommendedDate(personalizedTasks.filter((t) => t.phase === "before"));
  const after = sortTasksByRecommendedDate(personalizedTasks.filter((t) => t.phase === "after"));

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="dashboard" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("dashboard.headingTo")}
            </p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl md:text-2xl">
              {effectiveProfile.university}, {effectiveProfile.country}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {effectiveProfile.nationality} {t("dashboard.student")} · {t("dashboard.arriving")}{" "}
              {arrival.toLocaleDateString(undefined, { dateStyle: "long" })} ·{" "}
              {translateDuration(effectiveProfile.duration, t)}
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

          <DashboardSettingsCard
            profile={effectiveProfile}
            onChange={updateDashboardProfile}
          />
        </div>

        {authConfigured && !session && <CloudSyncPrompt />}

        <Tabs defaultValue="checklist" className="mt-5 sm:mt-6">
          <TabsList>
            <TabsTrigger value="checklist">{t("dashboard.checklist")}</TabsTrigger>
            <TabsTrigger value="timeline">{t("dashboard.timeline")}</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="mt-5">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">{t("dashboard.checklist")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("dashboard.trackDone")}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={reset}>
                <RotateCcw className="mr-1 h-3.5 w-3.5" /> {t("common.resetChecklist")}
              </Button>
            </div>

            <ChecklistCustomization
              canSync={Boolean(session)}
              onAdd={addCustomTask}
              hiddenTasks={hiddenStandardTasks}
              onRestore={restoreTask}
            />

            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <ChecklistColumn
                title={t("dashboard.beforeDeparture")}
                tasks={before}
                done={done}
                docs={docs}
                toggle={toggle}
                toggleDoc={toggleDoc}
                hideTask={hideTask}
                deleteCustomTask={deleteCustomTask}
                canCustomize={Boolean(session)}
                university={effectiveProfile.university}
                arrival={arrival}
              />
              <ChecklistColumn
                title={t("dashboard.afterArrival")}
                tasks={after}
                done={done}
                docs={docs}
                toggle={toggle}
                toggleDoc={toggleDoc}
                hideTask={hideTask}
                deleteCustomTask={deleteCustomTask}
                canCustomize={Boolean(session)}
                university={effectiveProfile.university}
                arrival={arrival}
              />
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
          <p className="mt-1 text-xs text-muted-foreground">
            {t("dashboard.saveRoadmapDesc")}
          </p>
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
            value={profile.startDate}
            onChange={(event) => onChange({ ...profile, startDate: event.target.value })}
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
        <Button type="button" size="sm" variant="outline" onClick={() => setOpen((value) => !value)}>
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
              <Select value={phase} onValueChange={(value) => setPhase(value as "before" | "after")}>
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
              <Select value={category} onValueChange={(value) => setCategory(value as TaskCategory)}>
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
  toggle,
  docs,
  toggleDoc,
  hideTask,
  deleteCustomTask,
  canCustomize,
  university,
  arrival,
}: {
  t: Task;
  isDone: boolean;
  toggle: (id: string) => void;
  docs: Record<string, boolean>;
  toggleDoc: (taskId: string, docId: string) => void;
  hideTask: (id: string) => void;
  deleteCustomTask: (id: string) => void;
  canCustomize: boolean;
  university: string;
  arrival: Date;
}) {
  const { language, t: translate } = useI18n();
  const taskText = getTaskText(t, language);
  const recommended = dateMinusDays(arrival, t.recommendedDaysBefore);
  const latest = dateMinusDays(arrival, t.latestDaysBefore);
  const isCustom = t.id.startsWith("custom-");
  const removeLabel = isCustom ? translate("dashboard.deleteTask") : translate("dashboard.hideTask");
  const RemoveIcon = isCustom ? Trash2 : EyeOff;
  const guideTopic = getTaskGuideTopic(t);
  const guideSearch = getGuideSearch(university);
  const handleRemove = () => {
    if (isCustom) deleteCustomTask(t.id);
    else hideTask(t.id);
  };

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
                {taskText.title}
              </label>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="border-success/40 bg-success/10 text-[10px]">
                  <CheckCircle2 className="mr-1 h-3 w-3" /> {translate("common.done")}
                </Badge>
                {canCustomize && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] text-muted-foreground"
                    onClick={handleRemove}
                  >
                    <RemoveIcon className="mr-1 h-3 w-3" />
                    {removeLabel}
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
              <CategoryLabel category={t.category} />
              <span>
                {translate("common.recommended")}: {formatDate(recommended)}
              </span>
              <span>
                {translate("common.latestSafe")}: {formatDate(latest)}
              </span>
              {guideTopic && (
                <Link
                  to="/resources/$topic"
                  params={{ topic: guideTopic }}
                  search={guideSearch}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  {translate("resources.openGuide")} <ArrowRight className="h-3 w-3" />
                </Link>
              )}
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
              {taskText.title}
            </label>
            <div className="flex items-center gap-1">
              <PriorityBadge priority={t.priority} />
              {canCustomize && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] text-muted-foreground"
                  onClick={handleRemove}
                >
                  <RemoveIcon className="mr-1 h-3 w-3" />
                  {removeLabel}
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{taskText.description}</p>

          <div className="mt-3 grid gap-2 rounded-md border bg-muted/30 p-2 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {translate("common.recommended")}
              </p>
              <p className="text-xs font-semibold">{formatDate(recommended)}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {translate("common.latestSafe")}
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
            {guideTopic && (
              <Button asChild variant="outline" size="sm" className="h-7 px-2 text-[11px]">
                <Link to="/resources/$topic" params={{ topic: guideTopic }} search={guideSearch}>
                  {translate("resources.openGuide")} <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
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
  hideTask,
  deleteCustomTask,
  canCustomize,
  university,
  arrival,
}: {
  title: string;
  tasks: Task[];
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
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            t={t}
            isDone={!!done[t.id]}
            toggle={toggle}
            docs={docs}
            toggleDoc={toggleDoc}
            hideTask={hideTask}
            deleteCustomTask={deleteCustomTask}
            canCustomize={canCustomize}
            university={university}
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
  const { t } = useI18n();
  const groups = getTimelineGroups(tasks);
  const completed = tasks.filter((task) => done[task.id]).length;
  const total = tasks.length;

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{t("dashboard.timeline")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("timeline.description")}
          </p>
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
                                {formatDate(recommended)}
                              </span>
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                              <CategoryLabel category={task.category} />
                              <span>{task.effort}</span>
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

function getPersonalizedTasks(profile: ProfileQuestionnaire) {
  const university = getUniversityConfig(profile.university);
  const tasks = TASKS.map((task) => personalizeTaskForUniversity(task, university));

  if (isLikelyUsNational(profile.nationality)) {
    return tasks.filter((task) => task.category !== "visa");
  }

  return tasks;
}

function getDefaultDashboardProfile(): ProfileQuestionnaire {
  const arrival = new Date();
  arrival.setMonth(arrival.getMonth() + 3);

  return {
    country: "United States",
    university: "UC Berkeley",
    nationality: "International",
    startDate: arrival.toISOString().slice(0, 10),
    duration: "one-semester",
  };
}

function customTaskToTask(task: CustomChecklistTask, arrival: Date): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    phase: task.phase,
    recommendedDaysBefore: daysBefore(arrival, task.recommendedDate),
    latestDaysBefore: daysBefore(arrival, task.latestDate || task.recommendedDate),
    priority: task.priority,
    effort: "Custom",
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

function daysBefore(arrival: Date, isoDate: string) {
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((arrival.getTime() - target.getTime()) / msPerDay);
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

const FRENCH_TASK_TEXT: Record<
  string,
  {
    title: string;
    description: string;
    warning?: string;
    docs?: Record<string, string>;
  }
> = {
  sevis: {
    title: "Payer les frais SEVIS I-901",
    description: "Frais obligatoires pour tous les étudiants F-1 avant l'entretien visa.",
  },
  avits: {
    title: "Créer un compte AVITS",
    description: "Compte utilisé pour planifier votre rendez-vous visa à l'ambassade américaine.",
  },
  "ds-160": {
    title: "Compléter le formulaire DS-160",
    description: "Demande de visa non-immigrant en ligne requise pour le visa étudiant F-1.",
  },
  "visa-fee": {
    title: "Payer les frais de demande de visa (MRV)",
    description: "Paiement requis avant de planifier l'entretien à l'ambassade ou au consulat.",
  },
  "visa-schedule": {
    title: "Planifier l'entretien visa",
    description: "Réservez le premier créneau disponible : l'attente peut durer plusieurs semaines.",
    warning: "Les délais d'entretien visa peuvent varier fortement selon le pays.",
  },
  "visa-docs": {
    title: "Préparer les documents pour l'entretien visa",
    description: "Rassemblez tout ce qu'il faudra apporter au rendez-vous à l'ambassade.",
    docs: {
      passport: "Passeport valide au moins 6 mois",
      i20: "Formulaire I-20 signé",
      ds160: "Page de confirmation DS-160",
      "sevis-receipt": "Reçu de paiement SEVIS",
      photo: "Photo visa au format américain",
      financial: "Preuve de ressources financières",
      admission: "Lettre d'admission de l'université",
    },
  },
  "housing-search": {
    title: "Commencer la recherche de logement",
    description: "Logement universitaire, sous-location ou location privée. Explorez tôt les options.",
    warning: "Le logement près du campus est compétitif. Commencez les recherches tôt.",
  },
  "housing-secure": {
    title: "Sécuriser un logement",
    description: "Signez le bail ou confirmez votre attribution de logement universitaire.",
    warning: "N'envoyez jamais de dépôt avant d'avoir vérifié l'annonce : les arnaques existent.",
  },
  insurance: {
    title: "Vérifier l'assurance santé",
    description:
      "Les soins aux États-Unis coûtent cher. Vérifiez si l'assurance universitaire est obligatoire ou si une dispense est possible.",
    warning: "Les règles d'assurance varient selon l'université. Vérifiez les critères officiels.",
  },
  flights: {
    title: "Réserver les vols",
    description: "Essayez d'arriver quelques jours avant l'orientation pour vous installer.",
  },
  bank: {
    title: "Vérifier les paiements bancaires et cartes internationales",
    description:
      "Vérifiez les frais à l'étranger, augmentez les plafonds et prévenez votre banque du voyage.",
  },
  phone: {
    title: "Préparer une eSIM ou un forfait téléphone pour les États-Unis",
    description: "Commandez une eSIM ou activez une option internationale avant le départ.",
  },
  "student-card": {
    title: "Obtenir votre carte étudiante",
    description: "Votre carte officielle pour accéder aux services du campus.",
  },
  "register-classes": {
    title: "S'inscrire aux cours",
    description: "Utilisez le portail étudiant et surveillez les créneaux d'inscription.",
  },
  "open-bank": {
    title: "Ouvrir un compte bancaire américain si nécessaire",
    description: "Comparez les banques proches du campus et les alternatives comme Wise.",
  },
  "activate-sim": {
    title: "Activer le forfait téléphone ou l'eSIM",
    description: "Vérifiez que les données, appels et SMS fonctionnent pour les codes de sécurité.",
  },
  transport: {
    title: "Comprendre les transports locaux",
    description:
      "Repérez les options utiles autour du campus : bus, train, navettes et cartes de transport.",
  },
  emergency: {
    title: "Enregistrer les contacts d'urgence",
    description: "Sauvegardez police campus, ambassade, assurance, urgence médicale et contact local.",
  },
  "arrival-reqs": {
    title: "Vérifier les exigences d'arrivée de l'université",
    description: "Check-in obligatoire, vaccination, orientation et démarches campus.",
  },
  "scholarships-research": {
    title: "Chercher les bourses et options de financement",
    description:
      "Identifiez les aides de votre école, de l'université d'accueil, du gouvernement ou d'organismes privés.",
    warning:
      "Les deadlines de bourse sont souvent plus tôt que celles du visa ou du logement. Vérifiez-les dès que possible.",
  },
  "scholarships-prepare": {
    title: "Préparer les documents de candidature aux bourses",
    description:
      "Rassemblez relevés de notes, lettre de motivation, budget, recommandations et formulaires spécifiques.",
  },
  "scholarships-submit": {
    title: "Envoyer les candidatures de bourse avant les deadlines",
    description: "Soumettez chaque dossier en avance : beaucoup ferment 4 à 9 mois avant le départ.",
    warning:
      "Les deadlines de bourse sont souvent plus tôt que celles du visa ou du logement. Vérifiez-les dès que possible.",
  },
};

type DisplayTaskText = Task & { docs?: Record<string, string> };

function getTaskText(task: Task, language: Language): DisplayTaskText {
  if (language !== "fr") return task;
  return {
    ...task,
    ...FRENCH_TASK_TEXT[task.id],
  };
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

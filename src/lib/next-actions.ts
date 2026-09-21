import type { Task } from "./tasks";

export type ActionStatus = "todo" | "in-progress" | "blocked" | "done";
export const STARTED_NAMESPACE = "__predeparture_started_v1";
export const startedKey = (id: string) => `${STARTED_NAMESPACE}.${id}`;

// Suggested workflow order, not legal requirements. Hidden steps are ignored.
export const TASK_DEPENDENCIES: Readonly<Record<string, readonly string[]>> = {
  "scholarships-prepare": ["scholarships-research"],
  "scholarships-submit": ["scholarships-prepare"],
  "housing-secure": ["housing-search"],
  "activate-sim": ["phone"],
};
export type ActionDecision = {
  task: Task;
  status: ActionStatus;
  waitingFor: Task[];
  recommended: Date;
  latest: Date;
  daysToRecommended: number;
  daysToLatest: number;
  urgent: boolean;
  afterArrival: boolean;
};

// Count calendar days, not 24-hour periods: DST must not shift urgency.
function calendarDay(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
}
function subtractDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
export function planNextActions(
  tasks: Task[],
  arrival: Date,
  done: Record<string, boolean>,
  docs: Record<string, boolean>,
  today = new Date(),
) {
  if (!Number.isFinite(arrival.getTime()) || !Number.isFinite(today.getTime())) {
    return { decisions: [] as ActionDecision[], next: [] as ActionDecision[], urgentCount: 0 };
  }
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const decisions: ActionDecision[] = tasks.map((task) => {
    const waitingFor = (TASK_DEPENDENCIES[task.id] ?? []).flatMap((id) => {
      const prerequisite = byId.get(id);
      return prerequisite && !done[id] ? [prerequisite] : [];
    });
    const status: ActionStatus = done[task.id]
      ? "done"
      : waitingFor.length
        ? "blocked"
        : docs[startedKey(task.id)]
          ? "in-progress"
          : "todo";
    const recommended = subtractDays(arrival, task.recommendedDaysBefore);
    const latest = subtractDays(arrival, task.latestDaysBefore);
    const daysToRecommended = calendarDay(recommended) - calendarDay(today);
    const daysToLatest = calendarDay(latest) - calendarDay(today);
    const afterArrival = task.phase === "after" && calendarDay(today) < calendarDay(arrival);
    return {
      task,
      status,
      waitingFor,
      recommended,
      latest,
      daysToRecommended,
      daysToLatest,
      afterArrival,
      urgent: status !== "done" && !afterArrival && daysToLatest <= 7,
    };
  });
  const rank = (d: ActionDecision) =>
    d.daysToLatest < 0
      ? 0
      : d.daysToLatest <= 7
        ? 1
        : d.status === "in-progress"
          ? 2
          : d.daysToRecommended <= 0
            ? 3
            : 4;
  const priority = { high: 0, medium: 1, low: 2 };
  const next = decisions
    .filter((d) => d.status !== "done" && d.status !== "blocked" && !d.afterArrival)
    .sort(
      (a, b) =>
        rank(a) - rank(b) ||
        a.daysToLatest - b.daysToLatest ||
        priority[a.task.priority] - priority[b.task.priority] ||
        a.task.id.localeCompare(b.task.id),
    )
    .slice(0, 3);
  return { decisions, next, urgentCount: decisions.filter((d) => d.urgent).length };
}

export function actionStatusLabel(status: ActionStatus, fr: boolean) {
  return {
    todo: fr ? "À commencer" : "To start",
    "in-progress": fr ? "En cours" : "In progress",
    blocked: fr ? "En attente" : "Waiting",
    done: fr ? "Terminé" : "Done",
  }[status];
}
export function actionReason(d: ActionDecision, fr: boolean, title: (task: Task) => string) {
  if (d.status === "done")
    return fr ? "Vous avez terminé cette étape." : "You completed this step.";
  if (d.status === "blocked")
    return `${fr ? "Étape conseillée avant celle-ci" : "Suggested step to complete first"} : ${d.waitingFor.map(title).join(", ")}.`;
  if (d.afterArrival)
    return fr ? "À prévoir après votre arrivée." : "Plan this after your arrival.";
  if (d.daysToLatest < 0)
    return fr
      ? "La date cible de votre planning est dépassée : vérifiez où vous en êtes."
      : "Your planning target has passed: review your progress.";
  if (d.daysToLatest === 0)
    return fr
      ? "La date cible de votre planning est aujourd’hui."
      : "Your planning target is today.";
  if (d.daysToLatest <= 7)
    return fr
      ? `La date cible de votre planning arrive dans ${d.daysToLatest} jour(s).`
      : `Your planning target is in ${d.daysToLatest} day(s).`;
  if (d.status === "in-progress")
    return fr
      ? "Vous avez commencé cette étape : poursuivez-la avant d’en ouvrir une autre."
      : "You started this step: continue it before opening another.";
  if (d.daysToRecommended <= 0)
    return fr
      ? "La période conseillée pour commencer est déjà ouverte."
      : "The suggested time to start has arrived.";
  return fr
    ? "Prochaine étape à anticiper ; il n’est pas nécessaire de la faire aujourd’hui."
    : "An upcoming step to plan ahead; you do not need to do it today.";
}

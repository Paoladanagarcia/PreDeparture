import { useState } from "react";
import { CheckCircle2, RotateCcw, CalendarDays, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n";
import { actionReason, actionStatusLabel, planNextActions } from "@/lib/next-actions";
import {
  DEMO_TASKS,
  DEMO_VISIBLE_IDS,
  DEMO_INITIAL_DONE,
  DEMO_PROGRESS,
  demoArrival,
  isCalendarInput,
} from "@/lib/planning-demo";
import { formatDate, parseCalendarDate, type Task } from "@/lib/tasks";
import { getTaskText } from "@/lib/task-text";

export function PlanningDemo() {
  const { language, t } = useI18n();
  const fr = language === "fr";
  const [today] = useState(() => new Date());
  const [arrivalInput, setArrivalInput] = useState(() => demoArrival(today));
  const [arrivalDate, setArrivalDate] = useState(arrivalInput);
  const [done, setDone] = useState({ ...DEMO_INITIAL_DONE });
  const arrival = parseCalendarDate(arrivalDate);
  const plan = planNextActions(DEMO_TASKS, arrival, done, DEMO_PROGRESS, today);
  const title = (task: Task) => getTaskText(task, language).title;
  const completed = DEMO_VISIBLE_IDS.filter((id) => done[id]).length;
  const progress = Math.round((completed / DEMO_VISIBLE_IDS.length) * 100);
  const waiting = plan.decisions.find((d) => d.status === "blocked");
  const exchangeMonth = new Intl.DateTimeFormat(fr ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(arrival);
  function changeDate(value: string) {
    setArrivalInput(value);
    if (isCalendarInput(value)) setArrivalDate(value);
  }
  function reset() {
    const date = demoArrival(today);
    setArrivalInput(date);
    setArrivalDate(date);
    setDone({ ...DEMO_INITIAL_DONE });
  }
  return (
    <Card className="dashboard-preview relative overflow-hidden border-border/60 bg-card p-0 text-left shadow-soft">
      <div className="dashboard-preview__mesh" />
      <div className="dashboard-preview__glow" />
      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b bg-card/90 px-4 py-3 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {fr
            ? "Changez l’arrivée, puis cochez une étape : le planning s’adapte."
            : "Change the arrival date, then check off a step: the plan adapts."}
        </p>
        <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/5 px-3 py-2">
          <span className="dashboard-preview__live-dot h-2 w-2 shrink-0 rounded-full bg-success" />
          <span className="text-xs font-semibold">Live checklist</span>
        </div>
      </div>
      <div className="relative grid md:grid-cols-[1.05fr_1fr]">
        <div className="min-w-0 border-b p-4 sm:p-6 md:border-b-0 md:border-r">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/25 px-3 py-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                UC Berkeley
              </p>
              <p className="text-sm font-semibold">
                {fr ? "Échange" : "Exchange"} · {exchangeMonth}
              </p>
            </div>
            <span className="rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">
              {fr ? "Démo interactive" : "Interactive demo"}
            </span>
          </div>
          <div className="mb-3 flex justify-between gap-2">
            <p className="text-sm font-medium">{t("landing.readiness")}</p>
            <span className="font-semibold text-primary">{progress}%</span>
          </div>
          <div
            role="progressbar"
            aria-label={
              fr
                ? "Avancement des quatre étapes affichées"
                : "Progress for the four displayed steps"
            }
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="dashboard-preview__progress h-2 rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {fr ? `${completed} sur 4 étapes affichées` : `${completed} of 4 displayed steps`}
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {DEMO_VISIBLE_IDS.map((id) => {
              const task = DEMO_TASKS.find((task) => task.id === id)!;
              return (
                <li key={id}>
                  <button
                    type="button"
                    aria-pressed={!!done[id]}
                    onClick={() => setDone((current) => ({ ...current, [id]: !current[id] }))}
                    className={`dashboard-preview__task dashboard-preview__task--${done[id] ? "done" : "todo"} flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    <span className="dashboard-preview__check grid h-5 w-5 shrink-0 place-items-center rounded-full border">
                      {done[id] && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    <span className={done[id] ? "text-muted-foreground line-through" : ""}>
                      {title(task)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 rounded-lg border border-primary/10 bg-primary/5 p-3 text-xs leading-relaxed">
            <p className="font-semibold">
              {fr ? "Les étapes se suivent dans le bon ordre" : "Steps follow the right order"}
            </p>
            <p className="mt-1 text-muted-foreground">
              {waiting
                ? fr
                  ? "Cochez la recherche de logement : la confirmation du logement devient disponible."
                  : "Check off the housing search: securing housing becomes available."
                : fr
                  ? "Recherche terminée : vous pouvez maintenant confirmer votre logement."
                  : "Search completed: you can now secure housing."}
            </p>
          </div>
          <Button type="button" variant="ghost" size="sm" className="mt-3 text-xs" onClick={reset}>
            <RotateCcw className="mr-1 h-3 w-3" />
            {fr ? "Réinitialiser la démo" : "Reset demo"}
          </Button>
        </div>
        <div className="min-w-0 bg-muted/30 p-4 sm:p-6">
          <Label htmlFor="demo-arrival" className="flex items-center gap-2 text-sm">
            <CalendarDays className="h-4 w-4 text-primary" />
            {fr ? "Arrivée de l’exemple" : "Example arrival"}
          </Label>
          <Input
            id="demo-arrival"
            type="date"
            value={arrivalInput}
            onChange={(e) => changeDate(e.target.value)}
            aria-invalid={!isCalendarInput(arrivalInput)}
            className="mt-2 w-full min-w-0 bg-card"
          />
          {!isCalendarInput(arrivalInput) && (
            <p role="alert" className="mt-1 text-xs text-destructive">
              {fr
                ? "Choisissez une date complète pour recalculer."
                : "Choose a complete date to recalculate."}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {[30, 90, 180].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => changeDate(demoArrival(today, days))}
                aria-pressed={arrivalDate === demoArrival(today, days)}
                className="rounded-full border bg-card px-2.5 py-1 text-xs hover:border-primary aria-pressed:border-primary aria-pressed:bg-primary/10"
              >
                {fr ? `Dans ${days} jours` : `In ${days} days`}
              </button>
            ))}
          </div>
          <h3 className="mt-5 text-sm font-semibold">
            {fr ? "Les trois prochaines actions" : "The next three actions"}
          </h3>
          <p role="status" className="mt-1 text-xs text-muted-foreground">
            {fr
              ? `Exemple recalculé pour le ${formatDate(arrival, language)}.`
              : `Example recalculated for ${formatDate(arrival, language)}.`}
          </p>
          <ol className="mt-3 space-y-2">
            {plan.next.map((decision, index) => (
              <li key={decision.task.id} className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold">{title(decision.task)}</p>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {actionReason(decision, fr, title)}
                </p>
                <p className="mt-2 text-xs font-medium text-primary">
                  {fr ? "Date cible" : "Target"} : {formatDate(decision.latest, language)} ·{" "}
                  {actionStatusLabel(decision.status, fr)}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
            {fr
              ? "Dates indicatives et données fictives. Cette démo ne modifie pas votre planning."
              : "Illustrative dates and sample data. This demo does not change your plan."}
          </p>
        </div>
      </div>
    </Card>
  );
}

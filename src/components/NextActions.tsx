import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { formatDate, type Task } from "@/lib/tasks";
import {
  actionReason,
  actionStatusLabel,
  type ActionDecision,
  type AttentionFilter,
} from "@/lib/next-actions";

export function TaskStatusControl({
  decision,
  onToggleStarted,
  title,
}: {
  decision: ActionDecision;
  onToggleStarted: (id: string) => void;
  title: (task: Task) => string;
}) {
  const { language } = useI18n();
  const fr = language === "fr";
  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {decision.status !== "todo" && (
          <Badge
            variant="outline"
            className={decision.status === "in-progress" ? "border-primary/30 bg-primary/5" : ""}
          >
            {actionStatusLabel(decision.status, fr)}
          </Badge>
        )}
        {decision.status !== "done" && decision.status !== "blocked" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            aria-label={`${decision.status === "in-progress" ? (fr ? "Remettre à commencer" : "Move to to-start") : fr ? "Commencer" : "Start"} : ${title(decision.task)}`}
            onClick={() => onToggleStarted(decision.task.id)}
          >
            {decision.status === "in-progress"
              ? fr
                ? "Remettre à commencer"
                : "Move to to-start"
              : fr
                ? "Commencer"
                : "Start"}
          </Button>
        )}
      </div>
      {decision.status === "blocked" && (
        <p className="text-xs text-muted-foreground">
          {actionReason(decision, fr, title)}{" "}
          {fr
            ? "Vous pouvez tout de même la cocher si elle est déjà faite."
            : "You can still check it off if it is already complete."}
        </p>
      )}
    </div>
  );
}

export function NextActions({
  actions,
  urgentCount,
  actionableCount,
  waitingCount,
  onShowAttention,
  showTiming = true,
  example = false,
  remaining,
  onToggleStarted,
  onDone,
  title,
}: {
  actions: ActionDecision[];
  urgentCount: number;
  actionableCount: number;
  waitingCount: number;
  onShowAttention: (filter: AttentionFilter) => void;
  showTiming?: boolean;
  example?: boolean;
  remaining: number;
  onToggleStarted: (id: string) => void;
  onDone: (id: string) => void;
  title: (task: Task) => string;
}) {
  const { language } = useI18n();
  const fr = language === "fr";
  return (
    <section
      aria-labelledby="next-actions-title"
      className="mt-5 rounded-xl border border-primary/15 bg-primary/5 p-4 sm:p-5"
    >
      <h2 id="next-actions-title" className="text-lg font-semibold">
        {example
          ? fr
            ? "Trois prochaines actions · exemple"
            : "Next three actions · example"
          : fr
            ? "Vos trois prochaines actions"
            : "Your next three actions"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {fr
          ? "Jusqu’à trois étapes, classées selon vos dates, votre avancement et les étapes préalables."
          : "Up to three steps, ranked by your dates, progress and prerequisite steps."}
      </p>
      {!showTiming ? (
        <p className="mt-3 rounded-lg border bg-card p-3 text-sm">
          {fr
            ? "Choisissez votre date d’arrivée ci-dessus pour obtenir vos priorités. Les dates affichées sont celles d’un exemple."
            : "Choose your arrival date above to see your priorities. The displayed dates belong to an example."}
        </p>
      ) : urgentCount > 0 ? (
        <div className="mt-3 space-y-2">
          <Button
            type="button"
            variant="link"
            className="h-auto whitespace-normal p-0 text-left text-sm"
            onClick={() => onShowAttention("attention")}
          >
            {fr
              ? `${urgentCount} date(s) cible(s) proche(s) ou passée(s) — voir les étapes`
              : `${urgentCount} step(s) need attention — see all affected steps`}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!actionableCount}
              onClick={() => onShowAttention("attention-now")}
            >
              {fr ? "À faire maintenant" : "Act now"} · {actionableCount}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!waitingCount}
              onClick={() => onShowAttention("attention-waiting")}
            >
              {fr ? "À surveiller" : "Keep an eye on"} · {waitingCount}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {fr
              ? "Dates cibles dépassées ou dans les 7 jours. Les étapes à surveiller attendent une autre démarche."
              : "Planning targets passed or within 7 days. Steps to watch are waiting on another task."}
          </p>
        </div>
      ) : (
        <p role="status" className="mt-2 text-xs text-muted-foreground">
          {fr
            ? "Aucune date cible proche ou dépassée dans ce planning."
            : "No planning targets are close or overdue."}
        </p>
      )}
      {actions.length ? (
        <ol className="mt-4 grid gap-3 lg:grid-cols-3">
          {actions.map((d, index) => (
            <li key={d.task.id} className="min-w-0">
              <Card className="flex h-full flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{title(d.task)}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {showTiming
                    ? actionReason(d, fr, title)
                    : fr
                      ? "Étape proposée pour illustrer le fonctionnement du planning."
                      : "A sample step illustrating how the plan works."}
                </p>
                <p className="text-xs">
                  {showTiming && d.urgent
                    ? fr
                      ? "Date cible"
                      : "Planning target"
                    : fr
                      ? "Date conseillée"
                      : "Suggested date"}{" "}
                  : {formatDate(showTiming && d.urgent ? d.latest : d.recommended, language)}
                </p>
                <TaskStatusControl decision={d} onToggleStarted={onToggleStarted} title={title} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-auto"
                  aria-label={`${fr ? "Terminer" : "Complete"} : ${title(d.task)}`}
                  onClick={() => onDone(d.task.id)}
                >
                  {fr ? "Marquer comme terminé" : "Mark complete"}
                </Button>
              </Card>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm">
          {remaining === 0
            ? fr
              ? "Toutes vos étapes sont terminées. Bravo !"
              : "All your steps are complete. Well done!"
            : fr
              ? "Aucune étape disponible maintenant. Consultez les étapes en attente ou celles prévues après l’arrivée."
              : "No steps are available now. Review waiting steps or those planned after arrival."}
        </p>
      )}
    </section>
  );
}

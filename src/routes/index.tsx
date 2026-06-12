import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PublicHeader } from "@/components/PublicHeader";
import { PlanningLink } from "@/components/PlanningLink";
import { useI18n } from "@/lib/i18n";
import {
  CheckCircle2,
  Clock,
  Library,
  ListChecks,
  ShieldCheck,
  Users,
  Sparkles,
  Map,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PreDeparture — Your roadmap for studying abroad" },
      {
        name: "description",
        content:
          "PreDeparture helps international students prepare for their exchange: personalized roadmap, trusted resources and a student community.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const pillars = [
    {
      icon: Map,
      title: t("landing.pillarQuestionsTitle"),
      desc: t("landing.pillarQuestionsDesc"),
    },
    {
      icon: ShieldCheck,
      title: t("landing.pillarPlanTitle"),
      desc: t("landing.pillarPlanDesc"),
    },
    {
      icon: Users,
      title: t("landing.pillarSupportTitle"),
      desc: t("landing.pillarSupportDesc"),
    },
  ];

  const features = [
    {
      icon: ListChecks,
      title: t("landing.featureChecklistTitle"),
      desc: t("landing.featureChecklistDesc"),
    },
    {
      icon: Clock,
      title: t("landing.featureTimelineTitle"),
      desc: t("landing.featureTimelineDesc"),
    },
    {
      icon: Library,
      title: t("landing.featureLibraryTitle"),
      desc: t("landing.featureLibraryDesc"),
    },
    {
      icon: Sparkles,
      title: t("landing.featureAssistantTitle"),
      desc: t("landing.featureAssistantDesc"),
    },
  ];

  return (
    <div className="min-h-screen">
      <PublicHeader active="home" />

      <section className="bg-hero-gradient relative">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-8 text-center sm:px-6 sm:pb-20 sm:pt-14 md:pt-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            {t("landing.badge")}
          </div>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            {t("landing.title")}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            {t("landing.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Button asChild size="lg" className="h-10 px-5 text-sm sm:h-11 sm:px-6">
              <PlanningLink />
            </Button>
          </div>

          <div className="mx-auto mt-10 max-w-4xl sm:mt-16">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("landing.preview")}
            </p>
            <Card className="overflow-hidden border-border/60 p-0 text-left shadow-soft">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.2fr_1fr]">
                <div className="border-b p-4 sm:p-6 md:border-b-0 md:border-r">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium">{t("landing.readiness")}</p>
                    <span className="text-sm font-semibold text-primary">45%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[45%] rounded-full bg-primary" />
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {[
                      { t: t("task.sevis"), done: true },
                      { t: t("task.ds160"), done: true },
                      { t: t("task.interview"), done: false },
                      { t: t("task.housing"), done: false },
                    ].map((i) => (
                      <li key={i.t} className="flex items-center gap-3">
                        <CheckCircle2
                          className={`h-4 w-4 ${i.done ? "text-success" : "text-muted-foreground/40"}`}
                        />
                        <span className={i.done ? "text-muted-foreground line-through" : ""}>
                          {i.t}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-muted/40 p-4 sm:p-6">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("landing.nextDeadline")}
                  </p>
                  <p className="mt-2 text-lg font-semibold">{t("landing.scheduleInterview")}</p>
                  <p className="text-sm text-muted-foreground">{t("landing.beforeJune15")}</p>
                  <div className="mt-6 rounded-lg border bg-card p-4 text-sm">
                    <p className="font-medium">{t("landing.headsUp")}</p>
                    <p className="mt-1 text-muted-foreground">{t("landing.waitTimes")}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="pillars" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {t("landing.platformEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {t("landing.platformTitle")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t("landing.platformDesc")}
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title} className="p-4 transition-shadow hover:shadow-soft sm:p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-primary text-primary-foreground">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:mt-16 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} className="p-5">
              <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="how" className="bg-muted/40 py-12 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">{t("landing.howTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("landing.howDesc")}</p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "1", t: t("landing.step1Title"), d: t("landing.step1Desc") },
              { n: "2", t: t("landing.step2Title"), d: t("landing.step2Desc") },
              { n: "3", t: t("landing.step3Title"), d: t("landing.step3Desc") },
              { n: "4", t: t("landing.step4Title"), d: t("landing.step4Desc") },
            ].map((s) => (
              <Card key={s.n} className="p-4 sm:p-5">
                <div className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center sm:mt-12">
            <Button asChild size="lg" className="h-10 px-5 text-sm sm:h-11 sm:px-6">
              <PlanningLink startLabel={t("common.startPlanningFree")} />
            </Button>
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <Card className="p-5 sm:p-6 md:p-8">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {t("landing.storyEyebrow")}
          </p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            {t("landing.storyTitle")}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {t("landing.storyBody")}
          </p>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 sm:py-8 md:flex-row">
          <p>© {new Date().getFullYear()} PreDeparture</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground">
              {t("nav.aboutSources")}
            </Link>
            <p>{t("landing.footerCare")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

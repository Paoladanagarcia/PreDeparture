import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Info, Mail, Scale, ShieldCheck, University } from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { Card } from "@/components/ui/card";
import { useI18n, type TranslationKey } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About and sources - PreDeparture" },
      {
        name: "description",
        content:
          "Learn how PreDeparture uses official sources and why students should verify important exchange requirements directly with universities and embassies.",
      },
    ],
  }),
  component: AboutPage,
});

const sourceGroups = [
  {
    titleKey: "about.sourceUniversityTitle",
    descKey: "about.sourceUniversityDesc",
    links: [
      { label: "Berkeley International Office", url: "https://internationaloffice.berkeley.edu/" },
      { label: "Stanford Bechtel International Center", url: "https://bechtel.stanford.edu/" },
      { label: "Berkeley Housing", url: "https://housing.berkeley.edu/" },
      { label: "Stanford Student Housing", url: "https://rde.stanford.edu/studenthousing" },
    ],
  },
  {
    titleKey: "about.sourceVisaTitle",
    descKey: "about.sourceVisaDesc",
    links: [
      { label: "DS-160 portal", url: "https://ceac.state.gov/genniv/" },
      { label: "SEVIS fee payment", url: "https://www.fmjfee.com/" },
      {
        label: "US visa information",
        url: "https://travel.state.gov/content/travel/en/us-visas.html",
      },
    ],
  },
  {
    titleKey: "about.sourceSetupTitle",
    descKey: "about.sourceSetupDesc",
    links: [
      { label: "Berkeley Financial Aid", url: "https://financialaid.berkeley.edu/" },
      {
        label: "Stanford Cardinal Care",
        url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
      },
      { label: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/" },
    ],
  },
] satisfies Array<{
  titleKey: TranslationKey;
  descKey: TranslationKey;
  links: Array<{ label: string; url: string }>;
}>;

function AboutPage() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader active="sources" />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <section className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("about.badge")}
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {t("about.title")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t("about.intro")}
          </p>
        </section>

        <section className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-[1.4fr_0.8fr]">
          <Card className="p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {t("landing.storyEyebrow")}
            </p>
            <h2 className="mt-2 text-lg font-semibold">{t("landing.storyTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("landing.storyBody")}
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("about.contactTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("about.contactDesc")}
            </p>
            <a
              href="mailto:pao.dana.garcia@gmail.com"
              className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
            >
              pao.dana.garcia@gmail.com
            </a>
          </Card>
        </section>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Card className="p-4 sm:p-5">
            <University className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("about.cardOfficialTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("about.cardOfficialDesc")}
            </p>
          </Card>
          <Card className="p-4 sm:p-5">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("about.cardDeadlinesTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("about.cardDeadlinesDesc")}
            </p>
          </Card>
          <Card className="p-4 sm:p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("about.cardVerifyTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("about.cardVerifyDesc")}
            </p>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">{t("about.sourcesTitle")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {sourceGroups.map((group) => (
              <Card key={group.titleKey} className="p-5">
                <h3 className="text-sm font-semibold">{t(group.titleKey)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(group.descKey)}</p>
                <div className="mt-4 grid gap-2">
                  {group.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {link.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <Card className="mt-5 border-primary/20 bg-primary-soft/40 p-4 sm:mt-6 sm:p-5">
          <h2 className="text-sm font-semibold">{t("about.noteTitle")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {t("about.noteBody")}
          </p>
        </Card>

        <Card className="mt-5 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Scale className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-sm font-semibold">{t("about.legalTitle")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("about.legalDesc")}</p>
              </div>
            </div>
            <Link to="/legal" className="text-sm font-medium text-primary hover:underline">
              {t("about.legalLink")}
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}

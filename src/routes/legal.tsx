import { createFileRoute } from "@tanstack/react-router";
import { Cookie, Database, ShieldCheck } from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/legal")({
  head: () => ({
    meta: [
      { title: "Privacy and legal - PreDeparture" },
      {
        name: "description",
        content:
          "Privacy, cookies and legal information for PreDeparture users.",
      },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
        <section className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("legal.badge")}
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            {t("legal.title")}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            {t("legal.intro")}
          </p>
        </section>

        <div className="mt-6 grid gap-4 sm:mt-8">
          <Card className="p-4 sm:p-5">
            <Database className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("legal.dataTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("legal.dataDesc")}
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <Cookie className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("legal.cookiesTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("legal.cookiesDesc")}
            </p>
          </Card>

          <Card className="p-4 sm:p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">{t("legal.aiTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("legal.aiDesc")}
            </p>
          </Card>

          <Card className="border-primary/20 bg-primary-soft/40 p-4 sm:p-5">
            <h2 className="text-sm font-semibold">{t("legal.contactTitle")}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t("legal.contactDesc")}{" "}
              <a
                href="mailto:pao.dana.garcia@gmail.com"
                className="font-medium text-primary hover:underline"
              >
                pao.dana.garcia@gmail.com
              </a>
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}

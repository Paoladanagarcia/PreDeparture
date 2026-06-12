import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ArrowRight,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Plane,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { useI18n, type Language } from "@/lib/i18n";
import { getResourceGuides, type ResourceGuide } from "@/lib/resource-guides";
import { useProfile } from "@/lib/storage";
import { getUniversityConfig, type SupportedUniversity } from "@/lib/universities";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources — PreDeparture" },
      {
        name: "description",
        content: "Browse visa, housing, banking, phone, arrival, funding and insurance guides.",
      },
    ],
  }),
  component: ResourcesPage,
});

const guideIcons = {
  file: FileText,
  home: Home,
  card: CreditCard,
  phone: Smartphone,
  plane: Plane,
  money: DollarSign,
  shield: ShieldCheck,
} satisfies Record<ResourceGuide["icon"], typeof FileText>;

function ResourcesPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { profile } = useProfile();
  const { session } = useAuth();
  const { language, t } = useI18n();
  const university = getUniversityConfig(profile?.university);
  const showUniversitySpecificGuides = Boolean(session && profile?.university);
  const guides = getDisplayGuides(showUniversitySpecificGuides ? profile?.university : undefined);

  if (pathname.replace(/\/$/, "") !== "/resources") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="resources" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("resources.library")}
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-2xl">{t("resources.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {showUniversitySpecificGuides
              ? `${t("resources.profileDesc")} ${university.shortName}.`
              : t("resources.generalDesc")}{" "}
            {t("resources.verify")}
          </p>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guideIcons[guide.icon];
            return (
              <Card key={guide.key} className="p-5 transition-colors hover:bg-muted/40">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold">
                      {translateGuideText(guide.title, language)}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {translateGuideText(guide.desc, language)}
                    </p>
                    <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">
                      <Link
                        to="/resources/$topic"
                        params={{ topic: guide.topic }}
                        search={guide.university ? { university: guide.university } : undefined}
                      >
                        {t("resources.openGuide")} <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}

function translateGuideText(text: string, language: Language) {
  if (language !== "fr") return text;
  return GUIDE_FR[text] ?? text;
}

const GUIDE_FR: Record<string, string> = {
  "F-1 Visa": "Visa F-1",
  "DS-160, SEVIS, interview documents and common mistakes.":
    "DS-160, SEVIS, documents d'entretien et erreurs fréquentes.",
  "Berkeley Housing": "Logement Berkeley",
  "Stanford Housing": "Logement Stanford",
  "Berkeley Housing Guide": "Guide logement Berkeley",
  "Stanford Housing Guide": "Guide logement Stanford",
  "Campus housing, I-House, off-campus options, prices, neighborhoods and scam checks.":
    "Logement campus, I-House, options hors campus, prix, quartiers et vérifications anti-arnaques.",
  "Stanford R&DE housing, residential life, off-campus options and rental checks.":
    "Logement Stanford R&DE, vie résidentielle, options hors campus et vérifications de location.",
  Banking: "Banque",
  "Wise, US banks, cards, transfers and payment setup.":
    "Wise, banques américaines, cartes, transferts et paiements.",
  "Phone Plans": "Forfaits téléphone",
  "eSIMs, US numbers, prepaid plans and first-day connectivity.":
    "eSIM, numéros américains, forfaits prépayés et connexion dès l'arrivée.",
  "Arrival Guide": "Guide arrivée",
  "Berkeley Arrival Guide": "Guide arrivée Berkeley",
  "Stanford Arrival Guide": "Guide arrivée Stanford",
  "Cal 1 Card, CalCentral, transport, orientation, health and emergency contacts.":
    "Cal 1 Card, CalCentral, transports, orientation, santé et contacts d'urgence.",
  "Bechtel check-in, Axess, Stanford ID, Marguerite shuttle and safety contacts.":
    "Check-in Bechtel, Axess, carte Stanford, navette Marguerite et contacts sécurité.",
  Scholarships: "Bourses",
  "Funding options, deadlines and budget checklist.":
    "Options de financement, deadlines et checklist budget.",
  "Health Insurance": "Assurance santé",
  "University insurance, waiver criteria and health coverage reminders.":
    "Assurance universitaire, critères de dispense et rappels de couverture santé.",
};

type DisplayGuide = ResourceGuide & {
  key: string;
  university?: SupportedUniversity;
};

function getDisplayGuides(selectedUniversity?: string): DisplayGuide[] {
  if (selectedUniversity) {
    return getResourceGuides(getUniversityConfig(selectedUniversity)).map((guide) => ({
      ...guide,
      key: guide.topic,
    }));
  }

  const berkeley = getUniversityConfig("UC Berkeley");
  const stanford = getUniversityConfig("Stanford University");
  const baseGuides = getResourceGuides(berkeley).filter((guide) => guide.topic !== "housing");

  return [
    ...baseGuides.slice(0, 1).map((guide) => ({ ...guide, key: guide.topic })),
    {
      topic: "housing",
      icon: "home",
      title: "Berkeley Housing",
      desc: berkeley.housing.desc,
      key: "housing-berkeley",
      university: "UC Berkeley",
    },
    {
      topic: "housing",
      icon: "home",
      title: "Stanford Housing",
      desc: stanford.housing.desc,
      key: "housing-stanford",
      university: "Stanford University",
    },
    ...baseGuides.slice(1).map((guide) => ({ ...guide, key: guide.topic })),
  ];
}

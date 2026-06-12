import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppHeader } from "@/components/AppHeader";
import { useI18n, type Language } from "@/lib/i18n";
import { useProfile } from "@/lib/storage";
import {
  BANKING,
  PHONE_PLANS,
  SCHOLARSHIP_CHECKLIST,
  SCHOLARSHIP_RESOURCES,
  VISA_GUIDE,
} from "@/lib/berkeley";
import {
  getUniversityConfig,
  UNIVERSITY_OPTIONS,
  type SupportedUniversity,
} from "@/lib/universities";
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  HeartPulse,
  Home,
  Library,
  MapPin,
  Plane,
  Search,
  Smartphone,
} from "lucide-react";

const TOPICS = {
  visa: {
    title: "F-1 Visa Guide",
    desc: "DS-160, SEVIS, interview documents, processing times and common mistakes.",
    icon: FileText,
  },
  housing: {
    title: "Housing Guide",
    desc: "Campus housing, off-campus options, prices, neighborhoods and scam checks.",
    icon: Home,
  },
  banking: {
    title: "Banking Guide",
    desc: "US banks, Wise, payment setup, cards and transfer considerations.",
    icon: CreditCard,
  },
  phone: {
    title: "Phone Plans Guide",
    desc: "eSIM, US phone numbers, prepaid plans and first-day connectivity.",
    icon: Smartphone,
  },
  arrival: {
    title: "Arrival Guide",
    desc: "Campus setup, transport, orientation, health and emergency contacts.",
    icon: Plane,
  },
  scholarships: {
    title: "Scholarships & Funding",
    desc: "Funding options, deadlines and budget reminders.",
    icon: DollarSign,
  },
  insurance: {
    title: "Health Insurance Guide",
    desc: "University health insurance, waiver criteria and coverage reminders.",
    icon: HeartPulse,
  },
} as const;

type Topic = keyof typeof TOPICS;

const RESOURCE_SEARCH_ENTRIES = [
  {
    topic: "visa",
    title: "F-1 visa, DS-160 and SEVIS",
    desc: "Visa interview, embassy appointment, I-20, SEVIS I-901 fee, DS-160 documents.",
    keywords: ["visa", "f-1", "f1", "ds-160", "ds160", "sevis", "i-20", "i20", "embassy"],
  },
  {
    topic: "housing",
    title: "Housing",
    desc: "Campus housing, off-campus apartments, sublets, rent, neighborhoods, scams and leases.",
    keywords: [
      "housing",
      "rent",
      "lease",
      "ihouse",
      "sublet",
      "apartment",
      "roommate",
      "scam",
      "stanford",
      "berkeley",
    ],
  },
  {
    topic: "banking",
    title: "Banking and payments",
    desc: "Wise, Chase, Bank of America, Wells Fargo, cards, transfers and US bank setup.",
    keywords: ["bank", "banking", "wise", "card", "transfer", "payment", "chase", "bofa"],
  },
  {
    topic: "phone",
    title: "Phone plans and eSIM",
    desc: "Airalo, Holafly, T-Mobile, Mint Mobile, US phone number and data setup.",
    keywords: ["phone", "sim", "esim", "data", "roaming", "mobile", "t-mobile", "mint"],
  },
  {
    topic: "arrival",
    title: "Arrival and campus setup",
    desc: "Student ID, campus portal, transit, orientation and emergency contacts.",
    keywords: [
      "arrival",
      "airport",
      "bart",
      "bus",
      "calcentral",
      "axess",
      "cal 1",
      "stanford id",
      "marguerite",
      "orientation",
      "emergency",
    ],
  },
  {
    topic: "scholarships",
    title: "Scholarships and funding",
    desc: "Home university funding, Erasmus+, grants, financial aid, deadlines and budget.",
    keywords: ["scholarship", "funding", "erasmus", "grant", "financial", "aid", "budget"],
  },
  {
    topic: "insurance",
    title: "Health insurance and SHIP",
    desc: "University health insurance, waiver criteria, health coverage and medical requirements.",
    keywords: ["insurance", "ship", "cardinal care", "health", "waiver", "medical", "doctor"],
  },
] satisfies Array<{
  topic: Topic;
  title: string;
  desc: string;
  keywords: string[];
}>;

export const Route = createFileRoute("/resources/$topic")({
  validateSearch: (search: Record<string, unknown>): { university?: SupportedUniversity } => {
    const university =
      typeof search.university === "string" &&
      UNIVERSITY_OPTIONS.includes(search.university as SupportedUniversity)
        ? (search.university as SupportedUniversity)
        : undefined;

    return university ? { university } : {};
  },
  head: ({ params }) => {
    const topic = normalizeTopic(params.topic);
    return {
      meta: [
        { title: `${TOPICS[topic].title} - PreDeparture` },
        { name: "description", content: TOPICS[topic].desc },
      ],
    };
  },
  component: ResourcePage,
});

function ResourcePage() {
  const { topic: rawTopic } = Route.useParams();
  const search = Route.useSearch();
  const { profile } = useProfile();
  const { language } = useI18n();
  const university = getUniversityConfig(search.university ?? profile?.university);
  const topic = normalizeTopic(rawTopic);
  const meta = getTopicMeta(topic, university, language);
  const Icon = meta.icon;
  const [query, setQuery] = useState("");
  const searchResults = useMemo(() => searchResources(query, language), [language, query]);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="resources" />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5 flex items-start gap-3 sm:mb-5 sm:gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl md:text-2xl">{meta.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{meta.desc}</p>
          </div>
        </div>

        <ResourceSearch query={query} setQuery={setQuery} results={searchResults} language={language} />

        <div className="space-y-6">
          {topic === "visa" && <VisaGuide language={language} />}
          {topic === "housing" && <HousingGuide university={university} language={language} />}
          {topic === "banking" && <BankingGuide language={language} />}
          {topic === "phone" && <PhoneGuide language={language} />}
          {topic === "arrival" && <ArrivalGuide university={university} language={language} />}
          {topic === "scholarships" && <ScholarshipsGuide language={language} />}
          {topic === "insurance" && <InsuranceGuide university={university} language={language} />}
          <OfficialLinks links={university.linksByTopic[topic]} language={language} />
        </div>
      </main>
    </div>
  );
}

function ResourceSearch({
  query,
  setQuery,
  results,
  language,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: typeof RESOURCE_SEARCH_ENTRIES;
  language: Language;
}) {
  return (
    <Card className="mb-5 p-3 sm:mb-5 sm:p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={uiText(language, "Search visa, housing, SHIP, banking, arrival...", "Rechercher visa, logement, SHIP, banque, arrivée...")}
          className="pl-9"
        />
      </div>

      {query.trim() && (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {results.length > 0 ? (
            results.map((result) => (
              <Link
                key={result.topic}
                to="/resources/$topic"
                params={{ topic: result.topic }}
                className="rounded-md border bg-muted/30 p-3 transition-colors hover:bg-muted"
              >
                <p className="text-sm font-semibold">{translateResourceText(result.title, language)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {translateResourceText(result.desc, language)}
                </p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              {uiText(
                language,
                "No matching guide yet. Try visa, housing, insurance, banking, phone or arrival.",
                "Aucun guide correspondant. Essayez visa, logement, assurance, banque, téléphone ou arrivée.",
              )}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function VisaGuide({ language }: { language: Language }) {
  return (
    <ResourceSection title={uiText(language, "F-1 visa process", "Processus visa F-1")}>
      <SubSection title={uiText(language, "Step-by-step", "Étapes")}>
        <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
          {VISA_GUIDE.steps.map((step) => (
            <li key={step}>{translateResourceText(step, language)}</li>
          ))}
        </ol>
      </SubSection>

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock
          title={uiText(language, "Typical processing times", "Délais typiques")}
          items={VISA_GUIDE.processingTimes}
          language={language}
        />
        <ListBlock
          title={uiText(language, "Interview tips", "Conseils pour l'entretien")}
          items={VISA_GUIDE.interviewTips}
          language={language}
        />
      </div>

      <SubSection title={uiText(language, "Common mistakes to avoid", "Erreurs fréquentes à éviter")}>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {VISA_GUIDE.commonMistakes.map((item) => (
            <li key={item} className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>{translateResourceText(item, language)}</span>
            </li>
          ))}
        </ul>
      </SubSection>

      <Accordion type="multiple" className="rounded-lg border">
        <AccordionItem value="ds160" className="border-b px-4">
          <AccordionTrigger className="text-sm font-semibold">
            {uiText(language, "DS-160 explained", "DS-160 expliqué")}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {translateResourceText(VISA_GUIDE.ds160.what, language)}
            </p>
            <ListBlock items={VISA_GUIDE.ds160.keyPoints} language={language} />
            <ExternalLinkRow label={uiText(language, "DS-160 portal", "Portail DS-160")} url={VISA_GUIDE.ds160.url} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sevis" className="px-4">
          <AccordionTrigger className="text-sm font-semibold">
            {uiText(language, "SEVIS explained", "SEVIS expliqué")}
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              {translateResourceText(VISA_GUIDE.sevis.what, language)}
            </p>
            <ListBlock items={VISA_GUIDE.sevis.keyPoints} language={language} />
            <ExternalLinkRow label={uiText(language, "SEVIS payment", "Paiement SEVIS")} url={VISA_GUIDE.sevis.url} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SubSection title={uiText(language, "Required documents", "Documents requis")}>
        <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          {VISA_GUIDE.requiredDocuments.map((doc) => (
            <li key={doc} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{translateResourceText(doc, language)}</span>
            </li>
          ))}
        </ul>
      </SubSection>
    </ResourceSection>
  );
}

function HousingGuide({
  university,
  language,
}: {
  university: ReturnType<typeof getUniversityConfig>;
  language: Language;
}) {
  return (
    <ResourceSection title={uiText(language, "Housing options", "Options de logement")}>
      <div className="grid gap-4 md:grid-cols-2">
        {university.housing.options.map((housing) => (
          <Card key={housing.name} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-base font-semibold">{housing.name}</h3>
              {housing.popularWithExchange && (
                <Badge variant="outline" className="border-accent/50 bg-accent/15 text-[10px]">
                  {uiText(language, "Popular with exchange students", "Populaire chez les étudiants en échange")}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {translateResourceText(housing.description, language)}
            </p>
            <div className="mt-3 grid gap-2 rounded-md border bg-muted/30 p-3 text-xs sm:grid-cols-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" /> {housing.distanceFromCampus}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-muted-foreground" /> {housing.priceRange}
              </span>
              <span>
                {housing.furnished
                  ? uiText(language, "Furnished", "Meublé")
                  : uiText(language, "Unfurnished", "Non meublé")}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MiniList title={uiText(language, "Pros", "Avantages")} items={housing.pros} language={language} />
              <MiniList title={uiText(language, "Cons", "Inconvénients")} items={housing.cons} warning language={language} />
            </div>
            <ExternalLinkRow label={uiText(language, "Official website", "Site officiel")} url={housing.url} />
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30 p-5">
        <h3 className="text-sm font-semibold">{uiText(language, "Off-campus tips", "Conseils hors campus")}</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <MiniList
            title={uiText(language, "Common mistakes", "Erreurs fréquentes")}
            items={university.housing.offCampusTips.commonMistakes}
            warning
            language={language}
          />
          <MiniList
            title={uiText(language, "Average prices", "Prix moyens")}
            items={university.housing.offCampusTips.averagePrices}
            language={language}
          />
          <MiniList
            title={uiText(language, "Best neighborhoods", "Quartiers utiles")}
            items={university.housing.offCampusTips.bestNeighborhoods}
            language={language}
          />
        </div>
      </Card>
    </ResourceSection>
  );
}

function BankingGuide({ language }: { language: Language }) {
  return (
    <ResourceSection title={uiText(language, "Banking comparison", "Comparatif banque")}>
      <ComparisonTable
        headers={[
          "Option",
          uiText(language, "Advantages", "Avantages"),
          uiText(language, "Disadvantages", "Inconvénients"),
          uiText(language, "Best use case", "Meilleur usage"),
          uiText(language, "Link", "Lien"),
        ]}
        rows={BANKING.map((bank) => [
          <span className="font-semibold">{bank.name}</span>,
          <MiniList items={bank.advantages} language={language} />,
          <MiniList items={bank.disadvantages} warning language={language} />,
          <span className="text-muted-foreground">
            {translateResourceText(bank.bestUseCase, language)}
          </span>,
          <ExternalLinkRow label={uiText(language, "Open", "Ouvrir")} url={bank.url} compact />,
        ])}
      />
    </ResourceSection>
  );
}

function PhoneGuide({ language }: { language: Language }) {
  return (
    <ResourceSection title={uiText(language, "Phone plan comparison", "Comparatif forfait téléphone")}>
      <ComparisonTable
        headers={[
          "Option",
          uiText(language, "Price", "Prix"),
          "eSIM",
          uiText(language, "Pros", "Avantages"),
          uiText(language, "Cons", "Inconvénients"),
          uiText(language, "Best use case", "Meilleur usage"),
          uiText(language, "Link", "Lien"),
        ]}
        rows={PHONE_PLANS.map((plan) => [
          <span className="font-semibold">{plan.name}</span>,
          <span>{plan.priceRange}</span>,
          <span>{plan.esim ? uiText(language, "Yes", "Oui") : uiText(language, "No", "Non")}</span>,
          <MiniList items={plan.pros} language={language} />,
          <MiniList items={plan.cons} warning language={language} />,
          <span className="text-muted-foreground">
            {translateResourceText(plan.bestUseCase, language)}
          </span>,
          <ExternalLinkRow label={uiText(language, "Open", "Ouvrir")} url={plan.url} compact />,
        ])}
      />
    </ResourceSection>
  );
}

function ArrivalGuide({
  university,
  language,
}: {
  university: ReturnType<typeof getUniversityConfig>;
  language: Language;
}) {
  return (
    <ResourceSection title={uiText(language, "Arrival essentials", "Essentiels à l'arrivée")}>
      <div className="grid gap-4 md:grid-cols-2">
        {university.arrival.items.map((item) => (
          <Card key={item.title} className="p-5">
            <h3 className="text-sm font-semibold">{translateResourceText(item.title, language)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {translateResourceText(item.description, language)}
            </p>
            <div className="mt-3 rounded-md border bg-primary-soft/40 p-2 text-xs">
              {uiText(language, "Tip", "Conseil")}: {translateResourceText(item.tip, language)}
            </div>
            <ExternalLinkRow label={uiText(language, "Official website", "Site officiel")} url={item.url} />
          </Card>
        ))}
      </div>
    </ResourceSection>
  );
}

function ScholarshipsGuide({ language }: { language: Language }) {
  return (
    <ResourceSection title={uiText(language, "Funding options", "Options de financement")}>
      <Card className="bg-muted/30 p-5">
        <h3 className="text-sm font-semibold">{uiText(language, "Scholarship checklist", "Checklist bourses")}</h3>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {SCHOLARSHIP_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{translateResourceText(item, language)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {SCHOLARSHIP_RESOURCES.map((resource) => (
          <Card key={resource.title} className="p-5">
            <h3 className="text-sm font-semibold">{translateResourceText(resource.title, language)}</h3>
            <div className="mt-2 space-y-1.5 text-sm">
              <p>
                <span className="font-medium">{uiText(language, "What:", "Quoi :")}</span>{" "}
                <span className="text-muted-foreground">
                  {translateResourceText(resource.what, language)}
                </span>
              </p>
              <p>
                <span className="font-medium">{uiText(language, "Who for:", "Pour qui :")}</span>{" "}
                <span className="text-muted-foreground">
                  {translateResourceText(resource.whoFor, language)}
                </span>
              </p>
              <p>
                <span className="font-medium">{uiText(language, "When:", "Quand :")}</span>{" "}
                <span className="text-muted-foreground">
                  {translateResourceText(resource.whenToApply, language)}
                </span>
              </p>
            </div>
            {resource.url !== "#" ? (
              <ExternalLinkRow label={uiText(language, "Official source", "Source officielle")} url={resource.url} />
            ) : (
              <p className="mt-3 text-xs italic text-muted-foreground">
                {uiText(
                  language,
                  "Check with your home university's international office for the official link.",
                  "Vérifiez le lien officiel auprès du bureau international de votre école d'origine.",
                )}
              </p>
            )}
          </Card>
        ))}
      </div>
    </ResourceSection>
  );
}

function InsuranceGuide({
  university,
  language,
}: {
  university: ReturnType<typeof getUniversityConfig>;
  language: Language;
}) {
  return (
    <ResourceSection title={translateResourceText(university.insurance.title, language)}>
      <p className="text-sm text-muted-foreground">
        {translateResourceText(university.insurance.body, language)}
      </p>
      <div className="flex flex-wrap gap-2">
        {university.insurance.links.map((link) => (
          <ExternalLinkRow key={link.url} label={link.label} url={link.url} />
        ))}
      </div>
    </ResourceSection>
  );
}

function OfficialLinks({ links, language }: { links: { label: string; url: string }[]; language: Language }) {
  return (
    <ResourceSection title={uiText(language, "Official links", "Liens officiels")}>
      <div className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <a
            key={link.url}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-between gap-3 rounded-md border bg-muted/20 px-3 py-2 text-sm text-primary transition-colors hover:bg-muted hover:underline"
          >
            <span>{link.label}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        ))}
      </div>
    </ResourceSection>
  );
}

function getTopicMeta(
  topic: Topic,
  university: ReturnType<typeof getUniversityConfig>,
  language: Language,
) {
  if (topic === "housing") {
    return {
      ...TOPICS.housing,
      title: translateResourceText(university.housing.title, language),
      desc: translateResourceText(university.housing.desc, language),
    };
  }

  if (topic === "arrival") {
    return {
      ...TOPICS.arrival,
      title: translateResourceText(university.arrival.title, language),
      desc: translateResourceText(university.arrival.desc, language),
    };
  }

  if (topic === "insurance") {
    return {
      ...TOPICS.insurance,
      title: translateResourceText(university.insurance.title, language),
      desc: translateResourceText(university.insurance.body, language),
    };
  }

  return {
    ...TOPICS[topic],
    title: translateResourceText(TOPICS[topic].title, language),
    desc: translateResourceText(TOPICS[topic].desc, language),
  };
}

function ResourceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 sm:p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Separator className="my-4" />
      <div className="space-y-4">{children}</div>
    </Card>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

function ListBlock({
  title,
  items,
  language,
}: {
  title?: string;
  items: string[];
  language: Language;
}) {
  return (
    <SubSection title={title ?? ""}>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{translateResourceText(item, language)}</span>
          </li>
        ))}
      </ul>
    </SubSection>
  );
}

function MiniList({
  title,
  items,
  warning,
  language,
}: {
  title?: string;
  items: string[];
  warning?: boolean;
  language: Language;
}) {
  return (
    <div>
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
      )}
      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5">
            <span>{warning ? "!" : "•"}</span>
            <span>{translateResourceText(item, language)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExternalLinkRow({
  label,
  url,
  compact,
}: {
  label: string;
  url: string;
  compact?: boolean;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`${compact ? "" : "mt-3"} inline-flex items-center gap-1 text-sm text-primary hover:underline`}
    >
      {label} <ExternalLink className="h-3 w-3" />
    </a>
  );
}

function ComparisonTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-xs">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeTopic(topic: string): Topic {
  return topic in TOPICS ? (topic as Topic) : "visa";
}

function searchResources(query: string, language: Language) {
  const value = query.trim().toLowerCase();

  if (!value) return [];

  return RESOURCE_SEARCH_ENTRIES.filter((entry) => {
    const haystack = [
      entry.title,
      entry.desc,
      translateResourceText(entry.title, language),
      translateResourceText(entry.desc, language),
      ...entry.keywords,
      ...FRENCH_SEARCH_KEYWORDS[entry.topic],
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(value);
  });
}

function uiText(language: Language, en: string, fr: string) {
  return language === "fr" ? fr : en;
}

function translateResourceText(text: string, language: Language) {
  if (language !== "fr") return text;
  return RESOURCE_FR[text] ?? text;
}

const RESOURCE_FR: Record<string, string> = {
  "F-1 Visa Guide": "Guide visa F-1",
  "DS-160, SEVIS, interview documents, processing times and common mistakes.":
    "DS-160, SEVIS, documents d'entretien, délais et erreurs fréquentes.",
  "Housing Guide": "Guide logement",
  "Campus housing, off-campus options, prices, neighborhoods and scam checks.":
    "Logement campus, options hors campus, prix, quartiers et vérifications anti-arnaques.",
  "Banking Guide": "Guide banque",
  "US banks, Wise, payment setup, cards and transfer considerations.":
    "Banques américaines, Wise, paiements, cartes et transferts.",
  "Phone Plans Guide": "Guide forfait téléphone",
  "eSIM, US phone numbers, prepaid plans and first-day connectivity.":
    "eSIM, numéro américain, forfaits prépayés et connexion dès l'arrivée.",
  "Arrival Guide": "Guide arrivée",
  "Campus setup, transport, orientation, health and emergency contacts.":
    "Installation campus, transports, orientation, santé et contacts d'urgence.",
  "Scholarships & Funding": "Bourses & financement",
  "Funding options, deadlines and budget reminders.":
    "Options de financement, deadlines et rappels budget.",
  "Health Insurance Guide": "Guide assurance santé",
  "University health insurance, waiver criteria and coverage reminders.":
    "Assurance santé universitaire, critères de dispense et points de couverture.",
  "F-1 visa, DS-160 and SEVIS": "Visa F-1, DS-160 et SEVIS",
  "Visa interview, embassy appointment, I-20, SEVIS I-901 fee, DS-160 documents.":
    "Entretien visa, rendez-vous ambassade, I-20, frais SEVIS I-901 et documents DS-160.",
  Housing: "Logement",
  "Campus housing, off-campus apartments, sublets, rent, neighborhoods, scams and leases.":
    "Logement campus, appartements hors campus, sous-locations, loyer, quartiers, arnaques et baux.",
  "Banking and payments": "Banque et paiements",
  "Wise, Chase, Bank of America, Wells Fargo, cards, transfers and US bank setup.":
    "Wise, Chase, Bank of America, Wells Fargo, cartes, transferts et compte bancaire américain.",
  "Phone plans and eSIM": "Forfaits téléphone et eSIM",
  "Airalo, Holafly, T-Mobile, Mint Mobile, US phone number and data setup.":
    "Airalo, Holafly, T-Mobile, Mint Mobile, numéro américain et données mobiles.",
  "Arrival and campus setup": "Arrivée et installation campus",
  "Student ID, campus portal, transit, orientation and emergency contacts.":
    "Carte étudiante, portail campus, transports, orientation et contacts d'urgence.",
  "Scholarships and funding": "Bourses et financement",
  "Home university funding, Erasmus+, grants, financial aid, deadlines and budget.":
    "Aides de l'école d'origine, Erasmus+, bourses, aides financières, deadlines et budget.",
  "Health insurance and SHIP": "Assurance santé et SHIP",
  "University health insurance, waiver criteria, health coverage and medical requirements.":
    "Assurance santé universitaire, dispense, couverture médicale et exigences santé.",

  "Berkeley Housing Guide": "Guide logement Berkeley",
  "Campus housing, I-House, off-campus options, prices, neighborhoods and scam checks.":
    "Logement campus, I-House, options hors campus, prix, quartiers et vérifications anti-arnaques.",
  "Stanford Housing Guide": "Guide logement Stanford",
  "Stanford R&DE housing, residential life, off-campus options and rental checks.":
    "Logement Stanford R&DE, vie résidentielle, options hors campus et vérifications de location.",
  "Berkeley Arrival Guide": "Guide arrivée Berkeley",
  "Cal 1 Card, CalCentral, transport, orientation, health and emergency contacts.":
    "Cal 1 Card, CalCentral, transports, orientation, santé et contacts d'urgence.",
  "Stanford Arrival Guide": "Guide arrivée Stanford",
  "Bechtel check-in, Axess, Stanford ID, Marguerite shuttle and safety contacts.":
    "Check-in Bechtel, Axess, carte Stanford, navette Marguerite et contacts sécurité.",
  "UC Berkeley Health Insurance Guide": "Guide assurance santé UC Berkeley",
  "Stanford Health Insurance Guide": "Guide assurance santé Stanford",
  "Berkeley requires SHIP unless you waive with an equivalent plan. Check the waiver criteria carefully because many international plans do not qualify. Confirm your plan covers repatriation, mental health and care in the United States.":
    "Berkeley exige SHIP sauf si vous obtenez une dispense avec une assurance équivalente. Vérifiez attentivement les critères de dispense, car beaucoup d'assurances internationales ne suffisent pas. Confirmez que votre plan couvre le rapatriement, la santé mentale et les soins aux États-Unis.",
  "Stanford students may be subject to Cardinal Care health insurance requirements unless they qualify for a waiver. Check Stanford's current insurance and waiver rules before relying on an outside plan.":
    "Les étudiants Stanford peuvent être soumis aux exigences Cardinal Care sauf s'ils obtiennent une dispense. Vérifiez les règles actuelles d'assurance et de waiver avant de compter sur une assurance externe.",

  "Receive your I-20 from Berkeley International Office":
    "Recevoir votre I-20 du Berkeley International Office",
  "Pay the SEVIS I-901 fee (~$350)": "Payer les frais SEVIS I-901 (~350 $)",
  "Complete the DS-160 online application": "Compléter la demande DS-160 en ligne",
  "Pay the MRV visa application fee (~$185)": "Payer les frais de demande de visa MRV (~185 $)",
  "Create an AVITS account and schedule your interview":
    "Créer un compte AVITS et planifier votre entretien",
  "Attend your F-1 visa interview at the US embassy or consulate":
    "Passer l'entretien visa F-1 à l'ambassade ou au consulat américain",
  "Receive your passport with the F-1 visa stamp (1–10 business days)":
    "Recevoir votre passeport avec le visa F-1 (1 à 10 jours ouvrés)",
  "Enter the US up to 30 days before your program start date":
    "Entrer aux États-Unis jusqu'à 30 jours avant le début du programme",
  "Interview wait times: 1 day to 12+ weeks depending on country":
    "Délais de rendez-vous : de 1 jour à plus de 12 semaines selon le pays",
  "Visa issuance after interview: 3–10 business days typically":
    "Émission du visa après l'entretien : généralement 3 à 10 jours ouvrés",
  "Administrative processing (rare): 4–8 additional weeks":
    "Traitement administratif (rare) : 4 à 8 semaines supplémentaires",
  "Dress professionally — business casual minimum":
    "Habillez-vous correctement, au minimum business casual",
  "Bring originals AND copies of every document":
    "Apportez les originaux ET des copies de chaque document",
  "Be ready to explain why Berkeley, why this program, and your ties to home":
    "Préparez-vous à expliquer pourquoi Berkeley, pourquoi ce programme et vos attaches dans votre pays",
  "Speak clearly and answer only what's asked — no extra information":
    "Répondez clairement et seulement à la question posée",
  "Show clear intent to return home after your exchange":
    "Montrez clairement votre intention de rentrer après l'échange",
  "Submitting an incomplete DS-160 (missing previous travel, employment)":
    "Envoyer un DS-160 incomplet (voyages ou emplois précédents manquants)",
  "Forgetting to pay the SEVIS fee before the interview":
    "Oublier de payer les frais SEVIS avant l'entretien",
  "Not bringing proof of financial support":
    "Ne pas apporter de preuve de ressources financières",
  "Waiting too long to schedule — wait times can be months":
    "Attendre trop longtemps pour réserver : les délais peuvent durer des mois",
  "Showing dual intent (saying you want to stay in the US after)":
    "Montrer une double intention, par exemple dire que vous voulez rester aux États-Unis après",
  "DS-160 is the official Online Nonimmigrant Visa Application required for all US visa applicants.":
    "Le DS-160 est la demande officielle de visa non-immigrant en ligne requise pour les visas américains.",
  "Completed entirely online at ceac.state.gov/genniv":
    "À compléter entièrement en ligne sur ceac.state.gov/genniv",
  "Requires a US-format photo (2x2 inches, white background)":
    "Nécessite une photo au format américain (2x2 pouces, fond blanc)",
  "Save your application ID — you'll need it to resume":
    "Gardez votre application ID : il permet de reprendre le formulaire",
  "Print the confirmation page (with barcode) to bring to your interview":
    "Imprimez la page de confirmation avec code-barres pour l'entretien",
  "SEVIS (Student and Exchange Visitor Information System) tracks F-1 and J-1 students. The I-901 fee funds the system.":
    "SEVIS suit les étudiants F-1 et J-1. Les frais I-901 financent ce système.",
  "Fee: ~$350 for F-1 (subject to change)":
    "Frais : environ 350 $ pour F-1, montant susceptible de changer",
  "Must be paid BEFORE the visa interview": "À payer AVANT l'entretien visa",
  "Print the receipt — required at the interview and at the US port of entry":
    "Imprimez le reçu : il peut être demandé à l'entretien et à l'entrée aux États-Unis",
  "Pay at fmjfee.com using your SEVIS ID (on your I-20)":
    "Payez sur fmjfee.com avec votre SEVIS ID indiqué sur l'I-20",
  "Valid passport (6+ months beyond stay)": "Passeport valide au moins 6 mois après le séjour",
  "Signed I-20 from Berkeley": "I-20 signé de Berkeley",
  "DS-160 confirmation page (with barcode)": "Page de confirmation DS-160 avec code-barres",
  "SEVIS I-901 payment receipt": "Reçu de paiement SEVIS I-901",
  "MRV visa fee receipt": "Reçu des frais visa MRV",
  "Visa interview appointment confirmation": "Confirmation du rendez-vous visa",
  "Passport-style photo (US format, 2x2 inches)": "Photo d'identité au format américain",
  "Proof of financial support (bank statements, scholarship letters)":
    "Preuve de ressources financières (relevés bancaires, lettres de bourse)",
  "Berkeley admission/exchange acceptance letter": "Lettre d'admission ou d'acceptation Berkeley",
  "Academic transcripts and diplomas": "Relevés de notes et diplômes",
  "Evidence of ties to home country (optional but useful)":
    "Preuve d'attaches dans le pays d'origine (optionnel mais utile)",

  "An iconic residence hall dedicated to mixing international and American students. Includes meal plan, programming, and a strong community feel.":
    "Une résidence emblématique qui mélange étudiants internationaux et américains. Inclut repas, événements et forte vie communautaire.",
  "Modern private student housing on Telegraph Avenue with single rooms, shared apartments and amenities like a gym and study lounges.":
    "Résidence étudiante privée moderne sur Telegraph Avenue, avec chambres individuelles, appartements partagés, salle de sport et espaces d'étude.",
  "Upscale student apartments south of campus with private bedrooms in shared units and full amenities (pool, gym, study rooms).":
    "Appartements étudiants haut de gamme au sud du campus, avec chambres privées en colocation et équipements complets.",
  "Newer purpose-built student housing with single and shared rooms, in-unit laundry and a rooftop lounge.":
    "Résidence étudiante récente avec chambres simples ou partagées, buanderie dans le logement et rooftop.",
  "Private rentals via Craigslist, Facebook groups, Zillow or local agencies. Best for budget-conscious students or longer stays.":
    "Locations privées via Craigslist, groupes Facebook, Zillow ou agences locales. Intéressant pour budgets serrés ou séjours longs.",
  "Stanford's official student housing system. Start here for eligibility, application processes and assignment information.":
    "Système officiel de logement étudiant de Stanford. Commencez ici pour vérifier l'éligibilité, les candidatures et les attributions.",
  "Overview of Stanford residential life, communities and student support within campus residences.":
    "Présentation de la vie résidentielle Stanford, des communautés et du support étudiant en résidence.",
  "Use Stanford's official off-campus resources and verify listings carefully before paying deposits or signing contracts.":
    "Utilisez les ressources officielles hors campus de Stanford et vérifiez les annonces avant tout dépôt ou signature.",
  "Built-in international community": "Communauté internationale intégrée",
  "Meals included": "Repas inclus",
  "Walking distance to campus": "Campus accessible à pied",
  "Cultural events and dinners": "Événements culturels et dîners",
  "Expensive compared to private rentals": "Cher par rapport aux locations privées",
  "Shared bathrooms in most rooms": "Salles de bain souvent partagées",
  "High demand — apply early": "Très demandé : candidater tôt",
  "Modern facilities": "Installations modernes",
  Furnished: "Meublé",
  "Close to campus": "Proche du campus",
  "Flexible lease lengths": "Durées de bail plus flexibles",
  Expensive: "Cher",
  "Less community feel than I-House": "Moins communautaire que I-House",
  "High-end amenities": "Équipements haut de gamme",
  "Private bedrooms": "Chambres privées",
  "Individual leases": "Baux individuels",
  "Premium pricing": "Prix élevés",
  "10–15 min walk to central campus": "10 à 15 min à pied du centre du campus",
  "Modern and clean": "Moderne et propre",
  "Central location": "Emplacement central",
  "All-inclusive utilities": "Charges souvent incluses",
  "One of the priciest options": "Une des options les plus chères",
  "Limited availability": "Places limitées",
  "Cheaper if you share with roommates": "Moins cher en colocation",
  "More flexibility on location": "Plus de flexibilité sur l'emplacement",
  "Great for full-year students": "Bien pour les séjours d'une année",
  "Often unfurnished": "Souvent non meublé",
  "Risk of scams — never pay before viewing or video tour":
    "Risque d'arnaques : ne payez jamais avant visite ou vidéo fiable",
  "Leases can be 12 months": "Les baux peuvent être de 12 mois",
  "Official university source": "Source officielle de l'université",
  "Closest to campus life": "Au plus près de la vie campus",
  "Best starting point": "Meilleur point de départ",
  "Eligibility can depend on your program": "L'éligibilité peut dépendre du programme",
  "Availability and deadlines vary": "Les places et deadlines varient",
  "Good for understanding residential life": "Utile pour comprendre la vie résidentielle",
  "Official Stanford resource": "Ressource officielle Stanford",
  "Not a housing application portal": "Ce n'est pas un portail de candidature logement",
  "Useful backup option": "Option de secours utile",
  "More flexibility": "Plus flexible",
  "Good for longer stays": "Bien pour les longs séjours",
  "Palo Alto is expensive": "Palo Alto est cher",
  "Scams and lease terms require careful checks":
    "Les annonces et conditions de bail doivent être vérifiées attentivement",
  "Sending a deposit before verifying the listing or landlord":
    "Envoyer un dépôt avant de vérifier l'annonce ou le propriétaire",
  "Signing a 12-month lease for a one-semester exchange":
    "Signer un bail de 12 mois pour un échange d'un semestre",
  "Forgetting to ask about utilities, internet and furniture":
    "Oublier de demander si charges, internet et meubles sont inclus",
  "Underestimating the cost of furnishing an empty apartment":
    "Sous-estimer le coût pour meubler un appartement vide",
  "Studio: $1,800 – $2,400 / month": "Studio : 1 800 à 2 400 $ / mois",
  "Shared room in a house: $900 – $1,400 / month":
    "Chambre partagée en maison : 900 à 1 400 $ / mois",
  "Private room in shared apartment: $1,200 – $2,000 / month":
    "Chambre privée en colocation : 1 200 à 2 000 $ / mois",
  "Northside — quiet, close to campus, popular with grad students":
    "Northside : calme, proche du campus, populaire chez les graduate students",
  "Southside / Telegraph — vibrant, walk to campus, more students":
    "Southside / Telegraph : animé, proche à pied, très étudiant",
  "Downtown Berkeley — close to BART, restaurants, slightly cheaper":
    "Downtown Berkeley : proche BART/restaurants, parfois un peu moins cher",
  "Elmwood — residential and safe, ~15 min walk":
    "Elmwood : résidentiel et calme, environ 15 min à pied",
  "Assuming all exchange students automatically get campus housing":
    "Penser que tous les étudiants en échange obtiennent automatiquement un logement campus",
  "Underestimating Palo Alto and Menlo Park rent levels":
    "Sous-estimer les loyers à Palo Alto et Menlo Park",
  "Sending deposits before verifying the landlord or listing":
    "Envoyer un dépôt avant de vérifier le propriétaire ou l'annonce",
  "Signing a lease that is longer than your exchange stay":
    "Signer un bail plus long que la durée de votre échange",
  "Campus housing: check Stanford R&DE rates":
    "Logement campus : vérifier les tarifs Stanford R&DE",
  "Private room near Palo Alto: often expensive; verify current listings":
    "Chambre privée près de Palo Alto : souvent chère, vérifier les annonces actuelles",
  "Shared housing can reduce cost but requires careful lease checks":
    "La colocation peut réduire les coûts mais le bail doit être vérifié",
  "Stanford campus housing when eligible": "Logement campus Stanford si vous êtes éligible",
  "Palo Alto for campus proximity": "Palo Alto pour la proximité du campus",
  "Menlo Park for nearby off-campus options": "Menlo Park pour des options proches hors campus",
  "Mountain View / Redwood City when commuting is acceptable":
    "Mountain View / Redwood City si le trajet est acceptable",

  "Branch near campus": "Agence près du campus",
  "Largest US ATM network": "Grand réseau de distributeurs aux États-Unis",
  "Easy to open with student ID and visa":
    "Ouverture souvent possible avec carte étudiante et visa",
  "Monthly fees unless requirements are met":
    "Frais mensuels si les conditions ne sont pas remplies",
  "Foreign wire transfers can be slow": "Les virements internationaux peuvent être lents",
  "Students staying a full year who need a reliable US daily-use account.":
    "Étudiants qui restent une année et veulent un compte américain quotidien fiable.",
  "Branch on Shattuck Ave": "Agence sur Shattuck Ave",
  "Good mobile app": "Bonne application mobile",
  "Student-friendly checking": "Compte courant adapté aux étudiants",
  "Monthly fees if balance is low": "Frais mensuels si le solde est bas",
  "Mediocre foreign exchange rates": "Taux de change moyens",
  "Students wanting a traditional bank with US-wide presence.":
    "Étudiants qui veulent une banque traditionnelle présente partout aux États-Unis.",
  "Branches close to campus": "Agences proches du campus",
  "Clear Access Banking with no overdraft fees":
    "Compte Clear Access sans frais de découvert",
  "Reputation issues": "Réputation parfois critiquée",
  "Some accounts have monthly fees": "Certains comptes ont des frais mensuels",
  "Backup option if Chase or BofA appointments are unavailable.":
    "Option de secours si Chase ou Bank of America ne sont pas disponibles.",
  "Real exchange rate with low fees": "Taux de change réel avec frais bas",
  "Multi-currency account with US routing details":
    "Compte multi-devises avec coordonnées bancaires américaines",
  "Open online before arrival": "Ouverture en ligne avant l'arrivée",
  "Not a real US bank — can't take checks easily":
    "Pas une vraie banque américaine : les chèques peuvent être compliqués",
  "No physical branches": "Pas d'agences physiques",
  "Most exchange students for one semester — receive USD, pay rent, transfer EUR↔USD cheaply.":
    "Très utile pour un semestre : recevoir des USD, payer le loyer et transférer EUR↔USD à moindre coût.",

  "Activate before arrival": "Activation avant l'arrivée",
  "No commitment": "Sans engagement",
  "Coverage in 200+ countries": "Couverture dans plus de 200 pays",
  "Data only — no US phone number": "Données seulement, pas de numéro américain",
  "Smaller data packages can run out fast": "Les petits forfaits data se vident vite",
  "First few days after arrival to stay connected before activating a local plan.":
    "Pratique les premiers jours avant d'activer un forfait local.",
  "Truly unlimited data": "Data vraiment illimitée",
  "Easy install": "Installation simple",
  "24/7 support": "Support 24/7",
  "No US phone number": "Pas de numéro américain",
  "More expensive than competitors": "Plus cher que certains concurrents",
  "Heavy data users who want to skip US carriers entirely.":
    "Pour gros consommateurs de data qui veulent éviter les opérateurs américains.",
  "Real US phone number": "Vrai numéro américain",
  "Unlimited data, calls, texts": "Data, appels et SMS illimités",
  "Free roaming in many countries": "Roaming gratuit dans de nombreux pays",
  "Requires SSN or passport in store": "Peut demander SSN ou passeport en boutique",
  "Monthly commitment": "Engagement mensuel",
  "Full-year students who need a US number for banking, Uber, Venmo, deliveries.":
    "Pour une année complète si vous avez besoin d'un numéro US pour banque, Uber, Venmo, livraisons.",
  "Cheap prepaid plans": "Forfaits prépayés peu chers",
  "US number included": "Numéro américain inclus",
  "Runs on T-Mobile network": "Fonctionne sur le réseau T-Mobile",
  "Pay 3, 6 or 12 months upfront": "Paiement de 3, 6 ou 12 mois à l'avance",
  "Customer service limited": "Service client limité",
  "Budget-conscious one-semester students who still need a US number.":
    "Pour un semestre avec budget serré mais besoin d'un numéro américain.",

  "Cal 1 Card": "Cal 1 Card",
  "Your official UC Berkeley photo ID. Required for library access, gym, dining and many campus events.":
    "Carte d'identité officielle UC Berkeley. Nécessaire pour bibliothèque, sport, repas et événements campus.",
  "Upload your photo online before arrival to skip the queue.":
    "Ajoutez votre photo en ligne avant l'arrivée pour éviter l'attente.",
  CalCentral: "CalCentral",
  "The Berkeley student portal — enroll in classes, view your schedule, pay fees and access your academic record.":
    "Portail étudiant Berkeley pour cours, emploi du temps, frais et dossier académique.",
  "Set up Duo two-factor authentication the same day you get your CalNet ID.":
    "Configurez Duo dès que vous recevez votre CalNet ID.",
  "International Student Orientation": "Orientation des étudiants internationaux",
  "Mandatory orientation run by the Berkeley International Office covering visa status, check-in and academic life.":
    "Orientation obligatoire du Berkeley International Office sur visa, check-in et vie académique.",
  "Mandatory immigration check-in must be completed within 30 days of arrival.":
    "Le check-in immigration obligatoire doit être fait dans les 30 jours après l'arrivée.",
  "Local bus network in the Bay Area. Berkeley students get unlimited rides with the Class Pass on Cal 1 Card.":
    "Réseau de bus local. Les étudiants Berkeley ont des trajets illimités avec le Class Pass sur la Cal 1 Card.",
  "The Class Pass is included in your tuition — no extra signup needed.":
    "Le Class Pass est inclus dans les frais : pas d'inscription supplémentaire.",
  "Bay Area Rapid Transit — fast trains to San Francisco, Oakland and SFO airport. Downtown Berkeley station is 10 min from campus.":
    "Train rapide vers San Francisco, Oakland et l'aéroport SFO. La station Downtown Berkeley est à environ 10 min du campus.",
  "Use a Clipper card (or Apple Wallet) for the easiest tap-to-pay experience.":
    "Utilisez une carte Clipper ou Apple Wallet pour payer facilement.",
  "Berkeley International Office (BIO)": "Berkeley International Office (BIO)",
  "Your primary contact for anything visa- or immigration-related during your stay.":
    "Votre contact principal pour les questions visa ou immigration pendant le séjour.",
  "Schedule advising appointments early — slots fill fast around deadlines.":
    "Prenez rendez-vous tôt : les créneaux partent vite près des deadlines.",
  "University Health Services (Tang Center)": "University Health Services (Tang Center)",
  "On-campus health center covered by SHIP. Primary care, mental health and urgent care.":
    "Centre de santé du campus couvert par SHIP : soins, santé mentale et urgences.",
  "Save the after-hours nurse line in your phone: +1 (510) 643-7197.":
    "Enregistrez la ligne infirmière hors horaires : +1 (510) 643-7197.",
  "Emergency contacts": "Contacts d'urgence",
  "UCPD (campus police): +1 (510) 642-3333 · National emergency: 911 · Tang Center after-hours: +1 (510) 643-7197 · Your embassy / consulate.":
    "UCPD : +1 (510) 642-3333 · Urgence nationale : 911 · Tang Center hors horaires : +1 (510) 643-7197 · Votre ambassade / consulat.",
  "Save these in your phone before you land.":
    "Enregistrez ces contacts avant d'atterrir.",
  "Check in with Bechtel International Center": "Faire le check-in avec Bechtel International Center",
  "Use Stanford's international office guidance for immigration check-in, visa status and required arrival steps.":
    "Suivez les consignes du bureau international Stanford pour check-in immigration, statut visa et démarches d'arrivée.",
  "Do this early after arrival so your immigration record stays in good standing.":
    "Faites-le rapidement après l'arrivée pour garder votre dossier immigration en règle.",
  "Set up Axess": "Configurer Axess",
  "Axess is Stanford's portal for student records, enrollment, finances and key university services.":
    "Axess est le portail Stanford pour dossier étudiant, inscription, finances et services clés.",
  "Make sure you can log in before registration or administrative deadlines.":
    "Vérifiez que vous pouvez vous connecter avant les inscriptions ou deadlines administratives.",
  "Get your Stanford ID Card": "Obtenir votre carte Stanford ID",
  "Your Stanford ID card is used for identification, campus access and university services.":
    "Votre Stanford ID sert d'identification, d'accès campus et aux services universitaires.",
  "Check the official card office instructions for pickup or setup requirements.":
    "Vérifiez les consignes officielles pour la récupération ou configuration de la carte.",
  "Understand Marguerite shuttle and local transport": "Comprendre la navette Marguerite et les transports",
  "Stanford's Marguerite shuttle and local transit options are useful for moving around campus and Palo Alto.":
    "La navette Marguerite et les transports locaux aident à circuler sur le campus et autour de Palo Alto.",
  "Plan your first campus trips before classes start.":
    "Préparez vos premiers trajets avant le début des cours.",
  "Save Stanford emergency contacts": "Enregistrer les contacts d'urgence Stanford",
  "Save Stanford public safety, emergency, insurance and embassy contacts.":
    "Enregistrez sécurité Stanford, urgences, assurance et ambassade.",
  "Keep contacts offline in your phone in case data is not working.":
    "Gardez les contacts hors ligne dans votre téléphone si la data ne marche pas.",

  "Check home university exchange scholarships":
    "Vérifier les bourses d'échange de votre école d'origine",
  "Check host university funding options":
    "Vérifier les financements de l'université d'accueil",
  "Check government scholarships": "Vérifier les bourses gouvernementales",
  "Check regional or city-level grants": "Vérifier les aides régionales ou locales",
  "Check Erasmus+ if applicable": "Vérifier Erasmus+ si applicable",
  "Check private foundations": "Vérifier les fondations privées",
  "Check deadlines early": "Vérifier les deadlines tôt",
  "Home university scholarships": "Bourses de l'école d'origine",
  "Mobility grants offered directly by your home institution to outgoing exchange students.":
    "Aides à la mobilité proposées par votre établissement d'origine aux étudiants partant en échange.",
  "All students officially nominated for an exchange by their home university.":
    "Étudiants officiellement nommés pour un échange par leur école d'origine.",
  "Usually 6–9 months before departure — check your international office.":
    "Souvent 6 à 9 mois avant le départ : vérifiez auprès du bureau international.",
  "Host university scholarships": "Bourses de l'université d'accueil",
  "Need-based or merit-based aid offered by UC Berkeley or program-specific funds.":
    "Aides sur critères sociaux ou mérite proposées par l'université d'accueil ou certains programmes.",
  "Admitted exchange students, sometimes restricted to certain programs.":
    "Étudiants admis en échange, parfois selon le programme.",
  "At the time of acceptance — deadlines often align with course registration.":
    "Au moment de l'acceptation : les deadlines peuvent suivre le calendrier d'inscription.",
  "Government grants": "Bourses gouvernementales",
  "Country-level mobility grants (e.g. French CROUS Aide à la mobilité internationale, DAAD for German students).":
    "Aides nationales à la mobilité, par exemple CROUS AMI en France ou DAAD en Allemagne.",
  "Students meeting residency and academic criteria in their home country.":
    "Étudiants remplissant les critères de résidence et académiques du pays d'origine.",
  "4–8 months before departure — deadlines are strict.":
    "4 à 8 mois avant le départ : les deadlines sont strictes.",
  "Erasmus+ / international mobility grants": "Erasmus+ / aides à la mobilité internationale",
  "EU-funded grants for students from European institutions, also for non-EU exchanges in some cases.":
    "Bourses financées par l'UE pour des étudiants d'établissements européens, parfois aussi hors UE.",
  "Students enrolled at an Erasmus+ partner institution.":
    "Étudiants inscrits dans un établissement partenaire Erasmus+.",
  "Apply through your home university's Erasmus office, typically 4–6 months in advance.":
    "Candidature via le bureau Erasmus de votre école, souvent 4 à 6 mois à l'avance.",
  "Private foundations": "Fondations privées",
  "Scholarships from foundations, banks, alumni networks and non-profits (Fulbright, Zellidja, Rotary, etc.).":
    "Bourses de fondations, banques, réseaux alumni ou associations.",
  "Varies — often merit-based, sometimes restricted by field or origin.":
    "Variable : souvent au mérite, parfois selon domaine ou origine.",
  "6–12 months in advance — deadlines are often very early.":
    "6 à 12 mois à l'avance : les deadlines peuvent être très tôt.",
  "Emergency funding options": "Aides d'urgence",
  "Short-term aid in case of unexpected hardship during your exchange.":
    "Aides ponctuelles en cas de difficulté imprévue pendant l'échange.",
  "Currently enrolled students facing financial emergencies.":
    "Étudiants inscrits confrontés à une urgence financière.",
  "As soon as a need arises — contact your home and host international offices immediately.":
    "Dès qu'un besoin apparaît : contactez rapidement les bureaux internationaux d'origine et d'accueil.",
  "5 min walk": "5 min à pied",
  "5–10 min walk": "5 à 10 min à pied",
  "10–15 min walk": "10 à 15 min à pied",
  "Varies (Northside, Southside, Downtown)": "Variable (Northside, Southside, Downtown)",
  "On or near campus": "Sur ou près du campus",
  "On campus": "Sur le campus",
  "Varies around Palo Alto / Menlo Park": "Variable autour de Palo Alto / Menlo Park",
  "Check Stanford R&DE rates": "Vérifier les tarifs Stanford R&DE",
  "Varies by assignment": "Variable selon l'attribution",
  "Often high; verify current listings": "Souvent élevé ; vérifier les annonces actuelles",
};

const FRENCH_SEARCH_KEYWORDS: Record<Topic, string[]> = {
  visa: ["visa", "ambassade", "entretien", "documents", "i-20", "sevis", "ds-160"],
  housing: ["logement", "loyer", "bail", "colocation", "sous-location", "quartier", "arnaque"],
  banking: ["banque", "paiement", "carte", "virement", "wise", "compte bancaire"],
  phone: ["téléphone", "forfait", "esim", "sim", "data", "numéro américain"],
  arrival: ["arrivée", "transport", "orientation", "urgence", "carte étudiante", "campus"],
  scholarships: ["bourse", "financement", "aide", "budget", "erasmus"],
  insurance: ["assurance", "santé", "ship", "waiver", "dispense", "soins"],
};

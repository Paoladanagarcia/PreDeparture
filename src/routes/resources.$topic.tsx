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
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { useProfile } from "@/lib/storage";
import {
  BANKING,
  PHONE_PLANS,
  SCHOLARSHIP_CHECKLIST,
  SCHOLARSHIP_RESOURCES,
  VISA_GUIDE,
} from "@/lib/berkeley";
import { getUniversityConfig } from "@/lib/universities";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
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
  const { profile } = useProfile();
  const university = getUniversityConfig(profile?.university);
  const topic = normalizeTopic(rawTopic);
  const meta = getTopicMeta(topic, university);
  const Icon = meta.icon;
  const [query, setQuery] = useState("");
  const searchResults = useMemo(() => searchResources(query), [query]);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/community">
                <MessageCircle className="mr-1 h-4 w-4" /> Community
              </Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">{meta.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{meta.desc}</p>
          </div>
        </div>

        <ResourceSearch query={query} setQuery={setQuery} results={searchResults} />

        <div className="space-y-6">
          {topic === "visa" && <VisaGuide />}
          {topic === "housing" && <HousingGuide university={university} />}
          {topic === "banking" && <BankingGuide />}
          {topic === "phone" && <PhoneGuide />}
          {topic === "arrival" && <ArrivalGuide university={university} />}
          {topic === "scholarships" && <ScholarshipsGuide />}
          {topic === "insurance" && <InsuranceGuide university={university} />}
          <OfficialLinks links={university.linksByTopic[topic]} />
        </div>
      </main>
    </div>
  );
}

function ResourceSearch({
  query,
  setQuery,
  results,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: typeof RESOURCE_SEARCH_ENTRIES;
}) {
  return (
    <Card className="mb-5 p-3 sm:mb-6 sm:p-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search visa, housing, SHIP, banking, arrival..."
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
                <p className="text-sm font-semibold">{result.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{result.desc}</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No matching guide yet. Try visa, housing, insurance, banking, phone or arrival.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function VisaGuide() {
  return (
    <ResourceSection title="F-1 visa process">
      <SubSection title="Step-by-step">
        <ol className="ml-4 list-decimal space-y-1 text-sm text-muted-foreground">
          {VISA_GUIDE.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </SubSection>

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock title="Typical processing times" items={VISA_GUIDE.processingTimes} />
        <ListBlock title="Interview tips" items={VISA_GUIDE.interviewTips} />
      </div>

      <SubSection title="Common mistakes to avoid">
        <ul className="space-y-1 text-sm text-muted-foreground">
          {VISA_GUIDE.commonMistakes.map((item) => (
            <li key={item} className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SubSection>

      <Accordion type="multiple" className="rounded-lg border">
        <AccordionItem value="ds160" className="border-b px-4">
          <AccordionTrigger className="text-sm font-semibold">DS-160 explained</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{VISA_GUIDE.ds160.what}</p>
            <ListBlock items={VISA_GUIDE.ds160.keyPoints} />
            <ExternalLinkRow label="DS-160 portal" url={VISA_GUIDE.ds160.url} />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sevis" className="px-4">
          <AccordionTrigger className="text-sm font-semibold">SEVIS explained</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{VISA_GUIDE.sevis.what}</p>
            <ListBlock items={VISA_GUIDE.sevis.keyPoints} />
            <ExternalLinkRow label="SEVIS payment" url={VISA_GUIDE.sevis.url} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <SubSection title="Required documents">
        <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          {VISA_GUIDE.requiredDocuments.map((doc) => (
            <li key={doc} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{doc}</span>
            </li>
          ))}
        </ul>
      </SubSection>
    </ResourceSection>
  );
}

function HousingGuide({ university }: { university: ReturnType<typeof getUniversityConfig> }) {
  return (
    <ResourceSection title="Housing options">
      <div className="grid gap-4 md:grid-cols-2">
        {university.housing.options.map((housing) => (
          <Card key={housing.name} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-base font-semibold">{housing.name}</h3>
              {housing.popularWithExchange && (
                <Badge variant="outline" className="border-accent/50 bg-accent/15 text-[10px]">
                  Popular with exchange students
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{housing.description}</p>
            <div className="mt-3 grid gap-2 rounded-md border bg-muted/30 p-3 text-xs sm:grid-cols-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3 w-3 text-muted-foreground" /> {housing.distanceFromCampus}
              </span>
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3 w-3 text-muted-foreground" /> {housing.priceRange}
              </span>
              <span>{housing.furnished ? "Furnished" : "Unfurnished"}</span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <MiniList title="Pros" items={housing.pros} />
              <MiniList title="Cons" items={housing.cons} warning />
            </div>
            <ExternalLinkRow label="Official website" url={housing.url} />
          </Card>
        ))}
      </div>

      <Card className="bg-muted/30 p-5">
        <h3 className="text-sm font-semibold">Off-campus tips</h3>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          <MiniList
            title="Common mistakes"
            items={university.housing.offCampusTips.commonMistakes}
            warning
          />
          <MiniList title="Average prices" items={university.housing.offCampusTips.averagePrices} />
          <MiniList
            title="Best neighborhoods"
            items={university.housing.offCampusTips.bestNeighborhoods}
          />
        </div>
      </Card>
    </ResourceSection>
  );
}

function BankingGuide() {
  return (
    <ResourceSection title="Banking comparison">
      <ComparisonTable
        headers={["Option", "Advantages", "Disadvantages", "Best use case", "Link"]}
        rows={BANKING.map((bank) => [
          <span className="font-semibold">{bank.name}</span>,
          <MiniList items={bank.advantages} />,
          <MiniList items={bank.disadvantages} warning />,
          <span className="text-muted-foreground">{bank.bestUseCase}</span>,
          <ExternalLinkRow label="Open" url={bank.url} compact />,
        ])}
      />
    </ResourceSection>
  );
}

function PhoneGuide() {
  return (
    <ResourceSection title="Phone plan comparison">
      <ComparisonTable
        headers={["Option", "Price", "eSIM", "Pros", "Cons", "Best use case", "Link"]}
        rows={PHONE_PLANS.map((plan) => [
          <span className="font-semibold">{plan.name}</span>,
          <span>{plan.priceRange}</span>,
          <span>{plan.esim ? "Yes" : "No"}</span>,
          <MiniList items={plan.pros} />,
          <MiniList items={plan.cons} warning />,
          <span className="text-muted-foreground">{plan.bestUseCase}</span>,
          <ExternalLinkRow label="Open" url={plan.url} compact />,
        ])}
      />
    </ResourceSection>
  );
}

function ArrivalGuide({ university }: { university: ReturnType<typeof getUniversityConfig> }) {
  return (
    <ResourceSection title="Arrival essentials">
      <div className="grid gap-4 md:grid-cols-2">
        {university.arrival.items.map((item) => (
          <Card key={item.title} className="p-5">
            <h3 className="text-sm font-semibold">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
            <div className="mt-3 rounded-md border bg-primary-soft/40 p-2 text-xs">
              Tip: {item.tip}
            </div>
            <ExternalLinkRow label="Official website" url={item.url} />
          </Card>
        ))}
      </div>
    </ResourceSection>
  );
}

function ScholarshipsGuide() {
  return (
    <ResourceSection title="Funding options">
      <Card className="bg-muted/30 p-5">
        <h3 className="text-sm font-semibold">Scholarship checklist</h3>
        <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
          {SCHOLARSHIP_CHECKLIST.map((item) => (
            <li key={item} className="flex gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {SCHOLARSHIP_RESOURCES.map((resource) => (
          <Card key={resource.title} className="p-5">
            <h3 className="text-sm font-semibold">{resource.title}</h3>
            <div className="mt-2 space-y-1.5 text-sm">
              <p>
                <span className="font-medium">What:</span>{" "}
                <span className="text-muted-foreground">{resource.what}</span>
              </p>
              <p>
                <span className="font-medium">Who for:</span>{" "}
                <span className="text-muted-foreground">{resource.whoFor}</span>
              </p>
              <p>
                <span className="font-medium">When:</span>{" "}
                <span className="text-muted-foreground">{resource.whenToApply}</span>
              </p>
            </div>
            {resource.url !== "#" ? (
              <ExternalLinkRow label="Official source" url={resource.url} />
            ) : (
              <p className="mt-3 text-xs italic text-muted-foreground">
                Check with your home university's international office for the official link.
              </p>
            )}
          </Card>
        ))}
      </div>
    </ResourceSection>
  );
}

function InsuranceGuide({ university }: { university: ReturnType<typeof getUniversityConfig> }) {
  return (
    <ResourceSection title={university.insurance.title}>
      <p className="text-sm text-muted-foreground">{university.insurance.body}</p>
      <div className="flex flex-wrap gap-2">
        {university.insurance.links.map((link) => (
          <ExternalLinkRow key={link.url} label={link.label} url={link.url} />
        ))}
      </div>
    </ResourceSection>
  );
}

function OfficialLinks({ links }: { links: { label: string; url: string }[] }) {
  return (
    <ResourceSection title="Official links">
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

function getTopicMeta(topic: Topic, university: ReturnType<typeof getUniversityConfig>) {
  if (topic === "housing") {
    return { ...TOPICS.housing, title: university.housing.title, desc: university.housing.desc };
  }

  if (topic === "arrival") {
    return { ...TOPICS.arrival, title: university.arrival.title, desc: university.arrival.desc };
  }

  if (topic === "insurance") {
    return {
      ...TOPICS.insurance,
      title: university.insurance.title,
      desc: university.insurance.body,
    };
  }

  return TOPICS[topic];
}

function ResourceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 sm:p-6">
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

function ListBlock({ title, items }: { title?: string; items: string[] }) {
  return (
    <SubSection title={title ?? ""}>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-primary">•</span>
            <span>{item}</span>
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
}: {
  title?: string;
  items: string[];
  warning?: boolean;
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
            <span>{item}</span>
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

function searchResources(query: string) {
  const value = query.trim().toLowerCase();

  if (!value) return [];

  return RESOURCE_SEARCH_ENTRIES.filter((entry) => {
    const haystack = [entry.title, entry.desc, ...entry.keywords].join(" ").toLowerCase();
    return haystack.includes(value);
  });
}

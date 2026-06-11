import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Info, ShieldCheck, University } from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { Card } from "@/components/ui/card";

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
    title: "University sources",
    desc: "University pages are used for campus-specific topics such as international student guidance, housing, health insurance, student portals and arrival logistics.",
    links: [
      { label: "Berkeley International Office", url: "https://internationaloffice.berkeley.edu/" },
      { label: "Stanford Bechtel International Center", url: "https://bechtel.stanford.edu/" },
      { label: "Berkeley Housing", url: "https://housing.berkeley.edu/" },
      { label: "Stanford Student Housing", url: "https://rde.stanford.edu/studenthousing" },
    ],
  },
  {
    title: "Government and visa sources",
    desc: "Visa-related guidance points students toward official US government systems and embassy information whenever possible.",
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
    title: "Funding and local setup",
    desc: "Funding, banking, phone and local transport resources are curated as starting points, not as official financial advice.",
    links: [
      { label: "Berkeley Financial Aid", url: "https://financialaid.berkeley.edu/" },
      {
        label: "Stanford Cardinal Care",
        url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
      },
      { label: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/" },
    ],
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader active="sources" />

      <main className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-6">
        <section className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Source-aware guidance
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl">
            About and sources
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            PreDeparture helps students organize exchange preparation in one place. The checklist,
            timeline and resources are based on official university pages, embassy or government
            websites, and practical student preparation patterns.
          </p>
        </section>

        <div className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-3">
          <Card className="p-4 sm:p-5">
            <University className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">Official-first resources</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The app links back to official sources whenever a requirement, document or campus
              process matters.
            </p>
          </Card>
          <Card className="p-4 sm:p-5">
            <Info className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">Indicative deadlines</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dates are planning estimates calculated from your arrival date. Real deadlines can
              vary by program, embassy, nationality and university office.
            </p>
          </Card>
          <Card className="p-4 sm:p-5">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h2 className="mt-3 text-sm font-semibold">Verify before acting</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Before paying fees, booking appointments, signing housing or submitting forms, verify
              details directly with your host university, your home university or the relevant
              embassy.
            </p>
          </Card>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Main source categories</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {sourceGroups.map((group) => (
              <Card key={group.title} className="p-5">
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{group.desc}</p>
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
          <h2 className="text-sm font-semibold">Important note</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            PreDeparture is a preparation tool, not an official university, immigration, legal,
            medical or financial authority. It is designed to help you stay organized, ask better
            questions and find the right official pages faster.
          </p>
        </Card>
      </main>
    </div>
  );
}

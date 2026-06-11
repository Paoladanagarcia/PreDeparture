import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
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

const pillars = [
  {
    icon: Map,
    title: "Personalized roadmap",
    desc: "A complete checklist and timeline tailored to your destination, university and arrival date.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted resources",
    desc: "Curated, university-specific guides for visa, housing, insurance, banking and arrival — verified from official sources.",
  },
  {
    icon: Users,
    title: "Student community",
    desc: "Connect with other students going to the same university and semester. Coming soon.",
  },
];

const features = [
  {
    icon: ListChecks,
    title: "Personalized checklist",
    desc: "Tasks tailored to your destination — nothing forgotten.",
  },
  { icon: Clock, title: "Smart timeline", desc: "Deadlines calculated from your arrival date." },
  {
    icon: Library,
    title: "Campus resource library",
    desc: "Detailed guides on housing, banking, phone plans and arrival.",
  },
  {
    icon: Sparkles,
    title: "AI assistant",
    desc: "Ask questions and get answers grounded in official sources.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#pillars" className="hover:text-foreground">
              Product
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <Link to="/about" className="hover:text-foreground">
              Sources
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
              <Link to="/auth">Account</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/onboarding">Start Planning</Link>
            </Button>
            <MobileNav />
          </div>
        </div>
      </header>

      <section className="bg-hero-gradient relative">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 text-center sm:px-6 sm:pb-24 sm:pt-16 md:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Built for international students — starting with UC Berkeley and Stanford
          </div>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-6xl">
            Your roadmap for studying abroad.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            PreDeparture centralizes everything you need before and after arrival — visa, housing,
            insurance, banking, arrival logistics and funding — into one personalized plan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Button asChild size="lg" className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base">
              <Link to="/onboarding">Start Planning</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base"
            >
              <a href="#pillars">See what's inside</a>
            </Button>
          </div>

          <div className="mx-auto mt-10 max-w-4xl sm:mt-16">
            <Card className="overflow-hidden border-border/60 p-0 text-left shadow-soft">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.2fr_1fr]">
                <div className="border-b p-4 sm:p-6 md:border-b-0 md:border-r">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-medium">Your readiness</p>
                    <span className="text-sm font-semibold text-primary">45%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 w-[45%] rounded-full bg-primary" />
                  </div>
                  <ul className="mt-6 space-y-3 text-sm">
                    {[
                      { t: "Pay the SEVIS fee", done: true },
                      { t: "Complete DS-160", done: true },
                      { t: "Schedule visa interview", done: false },
                      { t: "Find housing near campus", done: false },
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
                    Next deadline
                  </p>
                  <p className="mt-2 text-lg font-semibold">Schedule visa interview</p>
                  <p className="text-sm text-muted-foreground">Before June 15</p>
                  <div className="mt-6 rounded-lg border bg-card p-4 text-sm">
                    <p className="font-medium">Heads up 👋</p>
                    <p className="mt-1 text-muted-foreground">
                      Wait times at the US embassy can reach several weeks. Book early.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="pillars" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">The platform</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">
            Three pillars to prepare with confidence
          </h2>
          <p className="mt-3 text-muted-foreground">
            A complete exchange preparation platform — not just a checklist.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3">
          {pillars.map((p) => (
            <Card key={p.title} className="p-4 transition-shadow hover:shadow-soft sm:p-6">
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
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">
              Three minutes to set up. Months of peace of mind.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:mt-12 md:grid-cols-3">
            {[
              {
                n: "1",
                t: "Tell us about your exchange",
                d: "Destination, university, dates, nationality.",
              },
              {
                n: "2",
                t: "Get your roadmap",
                d: "A personalized checklist with deadlines based on your arrival date.",
              },
              {
                n: "3",
                t: "Tick things off",
                d: "Track your progress and feel ready when you board the plane.",
              },
            ].map((s) => (
              <Card key={s.n} className="p-4 sm:p-6">
                <div className="mb-3 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center sm:mt-12">
            <Button asChild size="lg" className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base">
              <Link to="/onboarding">Start Planning — it's free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-20">
        <Card className="p-5 sm:p-8 md:p-10">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Our story</p>
          <h2 className="mt-2 text-2xl font-bold md:text-3xl">
            Built from a real student experience
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            PreDeparture was inspired by the challenges of preparing for an international exchange.
            Information was spread across university websites, embassy pages, PDFs, emails and
            student groups. The goal is to centralize everything into one personalized roadmap that
            helps students know what to do, when to do it and what documents they need.
          </p>
        </Card>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6 sm:py-8 md:flex-row">
          <p>© {new Date().getFullYear()} PreDeparture</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-foreground">
              About / Sources
            </Link>
            <p>Made for students, with care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

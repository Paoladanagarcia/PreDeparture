import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  Plane,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getResourceGuides, type ResourceGuide } from "@/lib/resource-guides";
import { useProfile } from "@/lib/storage";
import { getUniversityConfig } from "@/lib/universities";

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
  const university = getUniversityConfig(profile?.university);
  const guides = getResourceGuides(university);

  if (pathname.replace(/\/$/, "") !== "/resources") {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/assistant">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> AI Assistant
              </Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Resource library
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Guides for your exchange</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Browse all preparation guides for {university.shortName}. Resources are starting points;
            verify important requirements directly with official sources.
          </p>
        </div>

        <Card className="border-primary/30 bg-primary-soft/40 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h2 className="text-sm font-semibold">Need help choosing a guide?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ask the assistant about visa, housing, insurance, banking or arrival at{" "}
                  {university.shortName}.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="shrink-0">
              <Link to="/assistant">Open assistant</Link>
            </Button>
          </div>
        </Card>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {guides.map((guide) => {
            const Icon = guideIcons[guide.icon];
            return (
              <Card key={guide.topic} className="p-5 transition-colors hover:bg-muted/40">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold">{guide.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{guide.desc}</p>
                    <Button asChild variant="link" className="mt-2 h-auto p-0 text-xs">
                      <Link to="/resources/$topic" params={{ topic: guide.topic }}>
                        Open guide <ArrowRight className="ml-1 h-3 w-3" />
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

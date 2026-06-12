import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/storage";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { label: "Home", to: "/" },
  { label: "AI Assistant", to: "/assistant" },
  { label: "Community", to: "/community" },
  { label: "About / Sources", to: "/about" },
] as const;

const resourceItems = [
  { label: "Visa guide", topic: "visa" },
  { label: "Banking guide", topic: "banking" },
  { label: "Phone guide", topic: "phone" },
  { label: "Arrival guide", topic: "arrival" },
  { label: "Scholarships guide", topic: "scholarships" },
  { label: "Insurance guide", topic: "insurance" },
] as const;

export function MobileNav() {
  const { profile } = useProfile();
  const dashboardItem = profile
    ? { label: "Dashboard", to: "/dashboard" as const }
    : { label: "Dashboard", to: "/onboarding" as const };
  const profileItem = profile
    ? { label: "Profile", to: "/profile" as const }
    : { label: "Profile", to: "/auth" as const };
  const items = [
    navItems[0],
    dashboardItem,
    navItems[1],
    navItems[2],
    profileItem,
    navItems[3],
  ];
  const hasUniversityProfile = Boolean(profile?.university);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[82vw] max-w-xs">
        <SheetHeader>
          <SheetTitle>PreDeparture</SheetTitle>
          <SheetDescription>Navigate your exchange preparation.</SheetDescription>
        </SheetHeader>

        <nav className="mt-6 grid gap-1">
          {items.map((item) => (
            <SheetClose asChild key={item.to}>
              <Link
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {item.label}
              </Link>
            </SheetClose>
          ))}
        </nav>

        <div className="mt-6 border-t pt-4">
          <SheetClose asChild>
            <Link
              to="/resources"
              className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Guides
            </Link>
          </SheetClose>
          <nav className="mt-2 grid gap-1">
            {resourceItems.slice(0, 1).map((item) => (
              <ResourceTopicLink key={item.topic} label={item.label} topic={item.topic} />
            ))}

            {hasUniversityProfile ? (
              <ResourceTopicLink label="Housing guide" topic="housing" />
            ) : (
              <>
                <ResourceTopicLink
                  label="Berkeley housing guide"
                  topic="housing"
                  university="UC Berkeley"
                />
                <ResourceTopicLink
                  label="Stanford housing guide"
                  topic="housing"
                  university="Stanford University"
                />
              </>
            )}

            {resourceItems.map((item) => (
              item.topic === "visa" ? null : (
                <ResourceTopicLink key={item.topic} label={item.label} topic={item.topic} />
              )
            ))}
          </nav>
        </div>

        <div className="mt-6 border-t pt-4">
          <SheetClose asChild>
            <a
              href="/#story"
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              Our story
            </a>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ResourceTopicLink({
  label,
  topic,
  university,
}: {
  label: string;
  topic: "visa" | "housing" | "banking" | "phone" | "arrival" | "scholarships" | "insurance";
  university?: "UC Berkeley" | "Stanford University";
}) {
  return (
    <SheetClose asChild>
      <Link
        to="/resources/$topic"
        params={{ topic }}
        search={university ? { university } : undefined}
        className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {label}
      </Link>
    </SheetClose>
  );
}

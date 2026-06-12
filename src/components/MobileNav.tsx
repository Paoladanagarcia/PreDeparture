import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
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
  { labelKey: "nav.home", to: "/" },
  { labelKey: "nav.aiAssistant", to: "/assistant" },
  { labelKey: "nav.community", to: "/community" },
] as const;

const resourceItems = [
  { labelKey: "resources.visaGuide", topic: "visa" },
  { labelKey: "resources.bankingGuide", topic: "banking" },
  { labelKey: "resources.phoneGuide", topic: "phone" },
  { labelKey: "resources.arrivalGuide", topic: "arrival" },
  { labelKey: "resources.scholarshipsGuide", topic: "scholarships" },
  { labelKey: "resources.insuranceGuide", topic: "insurance" },
] as const;

export function MobileNav() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const dashboardItem = profile
    ? { labelKey: "nav.dashboard" as const, to: "/dashboard" as const }
    : { labelKey: "nav.dashboard" as const, to: "/onboarding" as const };
  const profileItem = profile
    ? { labelKey: "nav.profile" as const, to: "/profile" as const }
    : { labelKey: "nav.profile" as const, to: "/auth" as const };
  const items = [
    navItems[0],
    dashboardItem,
    navItems[1],
    navItems[2],
    profileItem,
  ];
  const hasUniversityProfile = Boolean(profile?.university);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label={t("nav.openMenu")}>
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[82vw] max-w-xs">
        <SheetHeader>
          <SheetTitle>PreDeparture</SheetTitle>
          <SheetDescription>{t("nav.mobileDescription")}</SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <LanguageSwitcher />
        </div>

        <nav className="mt-6 grid gap-1">
          {items.map((item) => (
            <SheetClose asChild key={item.to}>
              <Link
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
              >
                {t(item.labelKey)}
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
              {t("nav.resources")}
            </Link>
          </SheetClose>
          <nav className="mt-2 grid gap-1">
            {resourceItems.slice(0, 1).map((item) => (
              <ResourceTopicLink key={item.topic} label={t(item.labelKey)} topic={item.topic} />
            ))}

            {hasUniversityProfile ? (
              <ResourceTopicLink label={t("resources.housingGuide")} topic="housing" />
            ) : (
              <>
                <ResourceTopicLink
                  label={t("resources.berkeleyHousingGuide")}
                  topic="housing"
                  university="UC Berkeley"
                />
                <ResourceTopicLink
                  label={t("resources.stanfordHousingGuide")}
                  topic="housing"
                  university="Stanford University"
                />
              </>
            )}

            {resourceItems.map((item) => (
              item.topic === "visa" ? null : (
                <ResourceTopicLink key={item.topic} label={t(item.labelKey)} topic={item.topic} />
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
              {t("nav.ourStory")}
            </a>
          </SheetClose>
          <SheetClose asChild>
            <Link
              to="/about"
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("nav.aboutSources")}
            </Link>
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

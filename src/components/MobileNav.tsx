import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useAuth } from "@/lib/auth";
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
  { labelKey: "nav.aiAssistant", to: "/assistant" },
  { labelKey: "nav.community", to: "/community" },
  { labelKey: "nav.tips", to: "/tips" },
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
  const { session } = useAuth();
  const { t } = useI18n();
  const dashboardItem = { label: t("nav.dashboard"), to: "/dashboard" as const };
  const profileItem = session
    ? { label: getProfileLabel(session.user.user_metadata, true, t), to: "/profile" as const }
    : { label: getProfileLabel(undefined, false, t), to: "/auth" as const };
  const items = [
    dashboardItem,
    { label: t(navItems[0].labelKey), to: navItems[0].to },
    { label: t(navItems[1].labelKey), to: navItems[1].to },
    { label: t(navItems[2].labelKey), to: navItems[2].to },
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
            <Link
              to="/about"
              className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
            >
              {t("nav.sources")}
            </Link>
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getProfileLabel(
  metadata: { first_name?: string; last_name?: string; full_name?: string } | undefined,
  hasProfile: boolean,
  t: (key: "nav.profile" | "nav.identify") => string,
) {
  const fullName = metadata?.full_name?.trim();
  const firstLast = [metadata?.first_name, metadata?.last_name].filter(Boolean).join(" ").trim();

  if (fullName) return fullName;
  if (firstLast) return firstLast;
  if (hasProfile) return t("nav.profile");
  return t("nav.identify");
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

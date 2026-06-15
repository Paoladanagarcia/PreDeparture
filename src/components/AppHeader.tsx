import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import {
  Library,
  Lightbulb,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { PlanningLink } from "@/components/PlanningLink";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";

type ActiveNav =
  | "home"
  | "dashboard"
  | "assistant"
  | "community"
  | "resources"
  | "tips"
  | "profile"
  | "sources";

type AppHeaderProps = {
  active?: ActiveNav;
};

const activeClass =
  "relative inline-flex items-center rounded-md px-2 py-1.5 text-xs font-semibold text-foreground after:absolute after:left-2 after:right-2 after:-bottom-2 after:h-0.5 after:rounded-full after:bg-primary lg:px-3 lg:text-sm lg:after:left-3 lg:after:right-3";

const inactiveClass =
  "inline-flex items-center rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:px-3 lg:text-sm";

export function AppHeader({ active }: AppHeaderProps) {
  const { session } = useAuth();
  const { t } = useI18n();
  const profileLabel = getProfileLabel(session?.user.user_metadata, Boolean(session), t);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <Logo />
        <nav className="hidden min-w-0 items-center gap-1 md:flex">
          <HeaderPlanningLink active={active === "dashboard"} />
          <HeaderLink active={active === "resources"} to="/resources">
            <Library className="mr-1 h-3.5 w-3.5" /> <span>{t("nav.resources")}</span>
          </HeaderLink>
          <HeaderLink active={active === "assistant"} to="/assistant">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> <span>{t("nav.aiAssistant")}</span>
          </HeaderLink>
          <HeaderLink active={active === "community"} to="/community">
            <MessageCircle className="mr-1 h-3.5 w-3.5" /> <span>{t("nav.community")}</span>
          </HeaderLink>
          <HeaderLink active={active === "tips"} to="/tips">
            <Lightbulb className="mr-1 h-3.5 w-3.5" /> <span>{t("nav.tips")}</span>
          </HeaderLink>
          <HeaderLink active={active === "sources"} to="/about">
            {t("nav.sources")}
          </HeaderLink>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <HeaderLink
            active={active === "profile"}
            to={session ? "/profile" : "/auth"}
            className="border bg-background shadow-sm"
          >
            <User className="mr-1 h-3.5 w-3.5" /> <span>{profileLabel}</span>
          </HeaderLink>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}

function HeaderPlanningLink({ active }: { active?: boolean }) {
  const { t } = useI18n();
  return (
    <PlanningLink
      dashboardLabel={t("nav.dashboard")}
      className={active ? activeClass : inactiveClass}
    />
  );
}

function HeaderLink({
  active,
  className,
  ...props
}: ComponentProps<typeof Link> & { active?: boolean }) {
  return <Link {...props} className={`${active ? activeClass : inactiveClass} ${className ?? ""}`} />;
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

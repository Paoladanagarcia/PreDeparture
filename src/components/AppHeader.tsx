import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";
import {
  Library,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { PlanningLink } from "@/components/PlanningLink";
import { useProfile } from "@/lib/storage";

type ActiveNav =
  | "home"
  | "dashboard"
  | "assistant"
  | "community"
  | "resources"
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
  const { profile } = useProfile();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 sm:py-3">
        <Logo />
        <nav className="hidden min-w-0 items-center gap-1 md:flex">
          <HeaderLink active={active === "home"} to="/">
            Home
          </HeaderLink>
          <HeaderPlanningLink active={active === "dashboard"} />
          <HeaderLink active={active === "assistant"} to="/assistant">
            <Sparkles className="mr-1 h-3.5 w-3.5" /> <span>AI Assistant</span>
          </HeaderLink>
          <HeaderLink active={active === "community"} to="/community">
            <MessageCircle className="mr-1 h-3.5 w-3.5" /> <span>Community</span>
          </HeaderLink>
          <HeaderLink active={active === "resources"} to="/resources">
            <Library className="mr-1 h-3.5 w-3.5" /> <span>Resources</span>
          </HeaderLink>
          <HeaderLink active={active === "profile"} to={profile ? "/profile" : "/auth"}>
            <User className="mr-1 h-3.5 w-3.5" /> <span>Profile</span>
          </HeaderLink>
          <a href="/#story" className={inactiveClass}>
            Our story
          </a>
          <HeaderLink active={active === "sources"} to="/about">
            Sources
          </HeaderLink>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}

function HeaderPlanningLink({ active }: { active?: boolean }) {
  return (
    <PlanningLink
      startLabel="Dashboard"
      dashboardLabel="Dashboard"
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

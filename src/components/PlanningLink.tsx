import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/storage";

type LinkProps = ComponentProps<typeof Link>;

export function PlanningLink({
  children,
  dashboardLabel = "Dashboard",
  startLabel = "Start Planning",
  ...props
}: Omit<LinkProps, "to"> & {
  dashboardLabel?: string;
  startLabel?: string;
}) {
  const { profile } = useProfile();
  const { t } = useI18n();
  const goesToDashboard = Boolean(profile);
  const resolvedDashboardLabel = dashboardLabel === "Dashboard" ? t("nav.dashboard") : dashboardLabel;
  const resolvedStartLabel = startLabel === "Start Planning" ? t("common.startPlanning") : startLabel;

  return (
    <Link to={goesToDashboard ? "/dashboard" : "/onboarding"} {...props}>
      {children ?? (goesToDashboard ? resolvedDashboardLabel : resolvedStartLabel)}
    </Link>
  );
}

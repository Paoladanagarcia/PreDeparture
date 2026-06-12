import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { useI18n } from "@/lib/i18n";

type LinkProps = ComponentProps<typeof Link>;

export function PlanningLink({
  children,
  dashboardLabel = "Dashboard",
  ...props
}: Omit<LinkProps, "to"> & {
  dashboardLabel?: string;
}) {
  const { t } = useI18n();
  const resolvedDashboardLabel = dashboardLabel === "Dashboard" ? t("nav.dashboard") : dashboardLabel;

  return (
    <Link to="/dashboard" {...props}>
      {children ?? resolvedDashboardLabel}
    </Link>
  );
}

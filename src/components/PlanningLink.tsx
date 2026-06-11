import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

import { useAuth } from "@/lib/auth";
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
  const { session } = useAuth();
  const { profile } = useProfile();
  const goesToDashboard = Boolean(session && profile);

  return (
    <Link to={goesToDashboard ? "/dashboard" : "/onboarding"} {...props}>
      {children ?? (goesToDashboard ? dashboardLabel : startLabel)}
    </Link>
  );
}

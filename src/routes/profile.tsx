import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useMemo } from "react";
import {
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  LogOut,
  MapPin,
  RotateCcw,
  User,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/auth";
import { translateDuration, useI18n } from "@/lib/i18n";
import { clearLocalRoadmap, useProfile, useProgress } from "@/lib/storage";
import { TASKS } from "@/lib/tasks";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile - PreDeparture" },
      {
        name: "description",
        content: "Review and update your exchange profile and preparation progress.",
      },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const { profile, loaded } = useProfile();
  const { done, reset } = useProgress();
  const { session, signOut } = useAuth();
  const { t } = useI18n();

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  const completed = useMemo(() => TASKS.filter((task) => done[task.id]).length, [done]);
  const pct = Math.round((completed / TASKS.length) * 100);

  if (!profile) return null;

  const arrival = new Date(profile.startDate);
  const signedInEmail = session?.user.email;

  async function logout() {
    await signOut();
    clearLocalRoadmap();
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="profile" />

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {t("profile.eyebrow")}
          </p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl md:text-2xl">{t("profile.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("profile.description")}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {signedInEmail ? `${t("profile.signedInAs")} ${signedInEmail}` : t("profile.guest")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card className="p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileItem
                icon={MapPin}
                label={t("profile.destination")}
                value={`${profile.university}, ${profile.country}`}
              />
              <ProfileItem icon={User} label={t("profile.nationality")} value={profile.nationality} />
              <ProfileItem
                icon={CalendarClock}
                label={t("profile.arrivalDate")}
                value={arrival.toLocaleDateString(undefined, { dateStyle: "long" })}
              />
              <ProfileItem
                icon={GraduationCap}
                label={t("profile.duration")}
                value={translateDuration(profile.duration, t)}
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/onboarding" search={{ mode: "edit" }}>
                  {t("common.editProfile")}
                </Link>
              </Button>
              {!session && (
                <Button asChild variant="outline">
                  <Link to="/auth">{t("common.signIn")}</Link>
                </Button>
              )}
              {session && (
                <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-1 h-3.5 w-3.5" /> {t("common.logOut")}
                </Button>
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">{t("profile.progress")}</h2>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">
                  {pct}% {t("profile.ready")}
                </span>
                <span className="text-muted-foreground">
                  {completed} / {TASKS.length}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
            <Button variant="outline" size="sm" className="mt-5" onClick={reset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> {t("common.resetProgress")}
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}

function ProfileItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { useEffect, useMemo } from "react";
import {
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  Library,
  MapPin,
  RotateCcw,
  User,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProfile, useProgress } from "@/lib/storage";
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

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  const completed = useMemo(() => TASKS.filter((task) => done[task.id]).length, [done]);
  const pct = Math.round((completed / TASKS.length) * 100);

  if (!profile) return null;

  const arrival = new Date(profile.startDate);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/assistant">Assistant</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/community">Community</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/resources">
                <Library className="mr-1 h-3.5 w-3.5" /> Resources
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Account</Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">Your profile</p>
          <h1 className="mt-1 text-xl font-bold sm:text-2xl md:text-3xl">Exchange details</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep this information accurate so your roadmap stays relevant.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
          <Card className="p-4 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileItem
                icon={MapPin}
                label="Destination"
                value={`${profile.university}, ${profile.country}`}
              />
              <ProfileItem icon={User} label="Nationality" value={profile.nationality} />
              <ProfileItem
                icon={CalendarClock}
                label="Arrival date"
                value={arrival.toLocaleDateString(undefined, { dateStyle: "long" })}
              />
              <ProfileItem
                icon={GraduationCap}
                label="Duration"
                value={durationLabel(profile.duration)}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/onboarding" search={{ mode: "edit" }}>
                  Edit profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Preparation progress</h2>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium">{pct}% ready</span>
                <span className="text-muted-foreground">
                  {completed} / {TASKS.length}
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
            <Button variant="outline" size="sm" className="mt-5" onClick={reset}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset progress
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

function durationLabel(d: string) {
  return (
    {
      "one-semester": "One semester",
      "two-semesters": "Two semesters / full academic year",
      "full-year": "Two semesters / full academic year",
      other: "Custom duration",
    }[d] ?? d
  );
}

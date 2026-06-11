import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Library, Sparkles } from "lucide-react";

import { CommunityCard } from "@/components/CommunityCard";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/lib/storage";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community — PreDeparture" },
      {
        name: "description",
        content: "Join your study abroad cohort groups and chat with other students.",
      },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { profile, loaded } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (loaded && !profile) navigate({ to: "/onboarding" });
  }, [loaded, profile, navigate]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Dashboard
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/assistant">
                <Sparkles className="mr-1 h-3.5 w-3.5" /> AI Assistant
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/resources">
                <Library className="mr-1 h-3.5 w-3.5" /> Resources
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/profile">Profile</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Account</Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your cohort
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Community</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Join groups for your destination and arrival term. You can be in several groups at the
            same time.
          </p>
        </div>

        <CommunityCard profile={profile} />
      </main>
    </div>
  );
}

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProfile } from "@/lib/storage";
import { useAuth } from "@/lib/auth";
import type { ProfileQuestionnaire } from "@/lib/tasks";
import { UNIVERSITY_OPTIONS } from "@/lib/universities";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeft, ArrowRight, Cloud, UserRound } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Get started — PreDeparture" },
      {
        name: "description",
        content: "Tell us about your exchange to generate your personalized roadmap.",
      },
    ],
  }),
  component: Onboarding,
});

const steps = ["Destination", "University", "About you", "Dates"] as const;
const NATIONALITY_OPTIONS = [
  "French",
  "American",
  "Belgian",
  "Canadian",
  "German",
  "Italian",
  "Spanish",
  "British",
  "Dutch",
  "Portuguese",
  "Other",
] as const;

type OnboardingForm = {
  country: string;
  university: string;
  nationality: string;
  startDate: string;
  duration: ProfileQuestionnaire["duration"] | "";
};

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  const { session } = useAuth();
  const [choiceMade, setChoiceMade] = useState(Boolean(session));
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({
    country: "",
    university: "",
    nationality: "",
    startDate: "",
    duration: "",
  });

  useEffect(() => {
    if (session) setChoiceMade(true);
  }, [session]);

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      if (!isCompleteForm(form)) return;
      setProfile(form);
      navigate({ to: "/dashboard" });
    }
  };
  const back = () =>
    step > 0 ? setStep(step - 1) : choiceMade ? setChoiceMade(false) : navigate({ to: "/" });
  const displayStep = choiceMade ? step + 1 : 0;
  const totalSteps = steps.length + 1;
  const canContinue = isStepComplete(step, form);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Step {displayStep + 1} of {totalSteps}
            </span>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 sm:pb-20">
        <div className="mb-6 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((displayStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {!choiceMade ? (
          <StartModeChoice
            onGuest={() => setChoiceMade(true)}
            onAccount={() => navigate({ to: "/auth" })}
            onBack={() => navigate({ to: "/" })}
          />
        ) : (
          <Card className="p-5 sm:p-8">
            <h1 className="text-xl font-bold sm:text-2xl">{stepTitle(step)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{stepSub(step)}</p>

            <div className="mt-6 space-y-4">
              {step === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="country">Destination country</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => setForm({ ...form, country: v })}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Choose your destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">🇺🇸 United States</SelectItem>
                      <SelectItem value="other" disabled>
                        More countries coming soon
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Select
                    value={form.university}
                    onValueChange={(v) => setForm({ ...form, university: v })}
                  >
                    <SelectTrigger id="university">
                      <SelectValue placeholder="Choose your host university" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIVERSITY_OPTIONS.map((university) => (
                        <SelectItem key={university} value={university}>
                          {university}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="nationality">Your nationality</Label>
                  <Select
                    value={form.nationality}
                    onValueChange={(v) => setForm({ ...form, nationality: v })}
                  >
                    <SelectTrigger id="nationality">
                      <SelectValue placeholder="Choose your nationality" />
                    </SelectTrigger>
                    <SelectContent>
                      {NATIONALITY_OPTIONS.map((nationality) => (
                        <SelectItem key={nationality} value={nationality}>
                          {nationality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    We use this to tailor visa advice to your country.
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Arrival / start date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Exchange duration</Label>
                    <Select
                      value={form.duration}
                      onValueChange={(v) =>
                        setForm({ ...form, duration: v as ProfileQuestionnaire["duration"] })
                      }
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder="Choose your exchange duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-semester">One semester</SelectItem>
                        <SelectItem value="two-semesters">
                          Two semesters / full academic year
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between sm:mt-8">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button onClick={next} disabled={!canContinue}>
                {step === steps.length - 1 ? "Generate my roadmap" : "Continue"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function StartModeChoice({
  onGuest,
  onAccount,
  onBack,
}: {
  onGuest: () => void;
  onAccount: () => void;
  onBack: () => void;
}) {
  return (
    <Card className="p-5 sm:p-8">
      <h1 className="text-xl font-bold sm:text-2xl">How do you want to start?</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You can create an account to sync your roadmap, or continue as a guest and keep everything
        only in this browser.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onAccount}
          className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40"
        >
          <Cloud className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">Create or sign in</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Save your profile and checklist online, then access them across devices.
          </p>
        </button>

        <button
          type="button"
          onClick={onGuest}
          className="rounded-lg border bg-card p-4 text-left transition-colors hover:bg-muted/40"
        >
          <UserRound className="h-5 w-5 text-primary" />
          <p className="mt-3 text-sm font-semibold">Continue as guest</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try PreDeparture now. Your roadmap stays locally in this browser.
          </p>
        </button>
      </div>

      <div className="mt-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
      </div>
    </Card>
  );
}

function stepTitle(s: number) {
  return ["Where are you going?", "Which university?", "Tell us about you", "When do you arrive?"][
    s
  ];
}
function stepSub(s: number) {
  return [
    "We'll tailor your roadmap to your destination.",
    "Choose your host university so resources and links match your campus.",
    "Your nationality changes some visa steps.",
    "We'll build your timeline backwards from this date.",
  ][s];
}

function isStepComplete(step: number, form: OnboardingForm) {
  if (step === 0) return Boolean(form.country);
  if (step === 1) return Boolean(form.university);
  if (step === 2) return Boolean(form.nationality);
  if (step === 3) return Boolean(form.startDate && form.duration);
  return false;
}

function isCompleteForm(form: OnboardingForm): form is ProfileQuestionnaire {
  return Boolean(
    form.country && form.university && form.nationality && form.startDate && form.duration,
  );
}

void Link;

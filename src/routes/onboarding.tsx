import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
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
import type { ProfileQuestionnaire } from "@/lib/tasks";
import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

function Onboarding() {
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileQuestionnaire>({
    country: "United States",
    university: "UC Berkeley",
    nationality: "French",
    startDate: "2026-08-18",
    duration: "one-semester",
  });

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      setProfile(form);
      navigate({ to: "/dashboard" });
    }
  };
  const back = () => (step > 0 ? setStep(step - 1) : navigate({ to: "/" }));

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <Logo />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Step {step + 1} of {steps.length}
            </span>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20">
        <div className="mb-6 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <Card className="p-8">
          <h1 className="text-2xl font-bold">{stepTitle(step)}</h1>
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
                    <SelectValue />
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                    <SelectItem value="other" disabled>
                      More universities coming soon
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-2">
                <Label htmlFor="nationality">Your nationality</Label>
                <Input
                  id="nationality"
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  placeholder="e.g. French"
                />
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-semester">One semester</SelectItem>
                      <SelectItem value="two-semesters">Two semesters</SelectItem>
                      <SelectItem value="full-year">Full academic year</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={back}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button onClick={next}>
              {step === steps.length - 1 ? "Generate my roadmap" : "Continue"}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
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
    "More universities coming soon — we're starting with Berkeley.",
    "Your nationality changes some visa steps.",
    "We'll build your timeline backwards from this date.",
  ][s];
}

void Link;

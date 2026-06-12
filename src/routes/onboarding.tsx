import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import type { ProfileQuestionnaire } from "@/lib/tasks";
import { UNIVERSITY_OPTIONS } from "@/lib/universities";
import { DURATION_OPTIONS, NATIONALITY_OPTIONS } from "@/lib/profile-options";
import { AppHeader } from "@/components/AppHeader";
import { translateDuration, useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): { mode?: "edit" } =>
    search.mode === "edit"
      ? { mode: search.mode }
      : {},
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
type OnboardingForm = {
  country: string;
  university: string;
  nationality: string;
  startDate: string;
  duration: ProfileQuestionnaire["duration"] | "";
};

function Onboarding() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { profile, setProfile } = useProfile();
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<OnboardingForm>({
    country: profile?.country ?? "",
    university: profile?.university ?? "",
    nationality: profile?.nationality ?? "",
    startDate: profile?.startDate ?? "",
    duration: profile?.duration ?? "",
  });

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else {
      if (!isCompleteForm(form)) return;
      setProfile(form);
      navigate({ to: "/dashboard" });
    }
  };
  const back = () =>
    step > 0
      ? setStep(step - 1)
      : search.mode === "edit"
        ? navigate({ to: "/dashboard" })
        : navigate({ to: "/" });
  const displayStep = step;
  const totalSteps = steps.length;
  const canContinue = isStepComplete(step, form);

  useEffect(() => {
    if (search.mode !== "edit" || !profile) return;
    setForm(profile);
  }, [profile, search.mode]);

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 pb-12 sm:px-6 sm:pb-20">
        <div className="mb-2 pt-5 text-right text-sm text-muted-foreground sm:pt-8">
          {t("onboarding.step")} {displayStep + 1} {t("onboarding.of")} {totalSteps}
        </div>
        <div className="mb-5 h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-1.5 rounded-full bg-primary transition-all"
            style={{ width: `${((displayStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <Card className="p-5 sm:p-5">
            <h1 className="text-xl font-bold sm:text-2xl">{stepTitle(step, t)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{stepSub(step, t)}</p>

            <div className="mt-5 space-y-4">
              {step === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="country">{t("onboarding.countryLabel")}</Label>
                  <Select
                    value={form.country}
                    onValueChange={(v) => setForm({ ...form, country: v })}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder={t("onboarding.countryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="United States">🇺🇸 United States</SelectItem>
                      <SelectItem value="other" disabled>
                        {t("onboarding.moreCountries")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="university">{t("onboarding.universityLabel")}</Label>
                  <Select
                    value={form.university}
                    onValueChange={(v) => setForm({ ...form, university: v })}
                  >
                    <SelectTrigger id="university">
                      <SelectValue placeholder={t("onboarding.universityPlaceholder")} />
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
                  <Label htmlFor="nationality">{t("onboarding.nationalityLabel")}</Label>
                  <Select
                    value={form.nationality}
                    onValueChange={(v) => setForm({ ...form, nationality: v })}
                  >
                    <SelectTrigger id="nationality">
                      <SelectValue placeholder={t("onboarding.nationalityPlaceholder")} />
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
                    {t("onboarding.nationalityHelp")}
                  </p>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t("onboarding.arrivalLabel")}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">{t("onboarding.durationLabel")}</Label>
                    <Select
                      value={form.duration}
                      onValueChange={(v) =>
                        setForm({ ...form, duration: v as ProfileQuestionnaire["duration"] })
                      }
                    >
                      <SelectTrigger id="duration">
                        <SelectValue placeholder={t("onboarding.durationPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATION_OPTIONS.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {translateDuration(duration.value, t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between sm:mt-6">
              <Button variant="ghost" onClick={back}>
                <ArrowLeft className="mr-1 h-4 w-4" /> {t("onboarding.back")}
              </Button>
              <Button onClick={next} disabled={!canContinue}>
                {step === steps.length - 1 ? t("onboarding.generate") : t("onboarding.continue")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
        </Card>
      </main>
    </div>
  );
}

function stepTitle(s: number, t: ReturnType<typeof useI18n>["t"]) {
  return [t("onboarding.title0"), t("onboarding.title1"), t("onboarding.title2"), t("onboarding.title3")][s];
}
function stepSub(s: number, t: ReturnType<typeof useI18n>["t"]) {
  return [
    t("onboarding.sub0"),
    t("onboarding.sub1"),
    t("onboarding.sub2"),
    t("onboarding.sub3"),
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

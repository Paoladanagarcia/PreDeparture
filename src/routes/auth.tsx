import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, LogOut, ShieldCheck } from "lucide-react";

import { PublicHeader } from "@/components/PublicHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { translateDuration, useI18n } from "@/lib/i18n";
import { DURATION_OPTIONS, NATIONALITY_OPTIONS } from "@/lib/profile-options";
import { clearLocalRoadmap, hasLocalRoadmap, useProfile } from "@/lib/storage";
import type { ProfileQuestionnaire } from "@/lib/tasks";
import { UNIVERSITY_OPTIONS } from "@/lib/universities";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account - PreDeparture" },
      {
        name: "description",
        content: "Create or access your PreDeparture account to sync your profile and checklist.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const {
    configured,
    recoveryMode,
    requestPasswordReset,
    session,
    signIn,
    signOut,
    signUp,
    updatePassword,
  } = useAuth();
  const { profile, setProfile } = useProfile();
  const { t } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [exchangeProfile, setExchangeProfile] = useState<AuthProfileForm>({
    country: "",
    university: "",
    nationality: "",
    startDate: "",
    duration: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localRoadmap, setLocalRoadmap] = useState(() => hasLocalRoadmap());

  async function submit() {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (recoveryMode) {
        await updatePassword(newPassword);
        setMessage(t("auth.passwordUpdated"));
        navigate({ to: "/dashboard" });
      } else if (mode === "signin") {
        await signIn(email, password);
        navigate({ to: "/dashboard" });
      } else if (mode === "reset") {
        await requestPasswordReset(email);
        setMessage(t("auth.resetSent"));
      } else {
        await signUp(email, password, { firstName, lastName });
        if (isCompleteProfile(exchangeProfile)) {
          setProfile(exchangeProfile);
          setLocalRoadmap(true);
        }
        setMessage(t("auth.accountCreated"));
      }
    } catch (err) {
      setError(err instanceof Error ? cleanAuthError(err.message) : t("auth.failed"));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await signOut();
    clearLocalRoadmap();
    setLocalRoadmap(false);
    navigate({ to: "/" });
  }

  function clearGuestRoadmap() {
    clearLocalRoadmap();
    setLocalRoadmap(false);
    setMessage(t("auth.guestCleared"));
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader active="profile" />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-5 max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            {t("auth.badge")}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-2xl">{t("auth.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("auth.description")}
          </p>
        </div>

        {!configured && (
          <Alert className="mb-5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("auth.supabaseTitle")}</AlertTitle>
            <AlertDescription>
              {t("auth.supabaseDesc")}
            </AlertDescription>
          </Alert>
        )}

        {recoveryMode ? (
          <Card className="max-w-xl p-5 sm:p-5">
            <h2 className="font-semibold">{t("auth.newPasswordTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("auth.newPasswordDesc")}
            </p>
            <div className="mt-5 space-y-2">
              <Label htmlFor="new-password">{t("auth.newPassword")}</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
              />
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {message && <p className="mt-4 text-sm text-success">{message}</p>}
            <Button
              className="mt-5 w-full"
              disabled={!configured || loading || newPassword.length < 6}
              onClick={submit}
            >
              {loading ? t("auth.pleaseWait") : t("auth.updatePassword")}
            </Button>
          </Card>
        ) : session ? (
          <Card className="max-w-xl p-5 sm:p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <h2 className="font-semibold">{t("auth.signedIn")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {session.user.email ?? t("auth.title")} {t("auth.syncing")}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/dashboard">{t("auth.goDashboard")}</Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-1 h-4 w-4" />
                {t("auth.signOut")}
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="max-w-xl p-5 sm:p-5">
            <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
              <TabsList className="mb-5">
                <TabsTrigger value="signin">{t("common.signIn")}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.createAccount")}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <AuthFields
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  mode={mode}
                />
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs font-medium text-primary hover:underline"
                    onClick={() => {
                      setMode("reset");
                      setError(null);
                      setMessage(null);
                    }}
                  >
                    {t("auth.forgotPassword")}
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="reset" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">{t("auth.email")}</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@university.edu"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("auth.resetHelp")}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <NameFields
                  firstName={firstName}
                  lastName={lastName}
                  setFirstName={setFirstName}
                  setLastName={setLastName}
                />
                <AuthFields
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  mode={mode}
                />
                <ExchangeFields profile={exchangeProfile} setProfile={setExchangeProfile} />
              </TabsContent>
            </Tabs>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {message && <p className="mt-4 text-sm text-success">{message}</p>}

            <Button
              className="mt-5 w-full"
              disabled={
                !configured ||
                loading ||
                !email ||
                (mode !== "reset" && password.length < 6) ||
                (mode === "signup" &&
                  (!firstName.trim() || !lastName.trim() || !isCompleteProfile(exchangeProfile)))
              }
              onClick={submit}
            >
                {loading
                ? t("auth.pleaseWait")
                : mode === "signin"
                  ? t("common.signIn")
                  : mode === "reset"
                    ? t("auth.sendReset")
                    : t("auth.createAccount")}
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/onboarding" search={{ mode: "guest" }}>
                {t("auth.continueGuest")}
              </Link>
            </Button>
          </Card>
        )}

        {!session && localRoadmap && (
          <Card className="mt-4 max-w-xl p-4">
            <p className="text-sm font-medium">{t("auth.guestFound")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("auth.guestFoundDesc")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/dashboard">{t("auth.continueGuestRoadmap")}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={clearGuestRoadmap}>
                {t("auth.clearGuestRoadmap")}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

type AuthProfileForm = Omit<ProfileQuestionnaire, "duration"> & {
  duration: ProfileQuestionnaire["duration"] | "";
};

function NameFields({
  firstName,
  lastName,
  setFirstName,
  setLastName,
}: {
  firstName: string;
  lastName: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="first-name">{t("auth.firstName")}</Label>
        <Input
          id="first-name"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder={t("auth.firstName")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">{t("auth.lastName")}</Label>
        <Input
          id="last-name"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder={t("auth.lastName")}
        />
      </div>
    </div>
  );
}

function AuthFields({
  email,
  password,
  setEmail,
  setPassword,
  mode,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  mode: "signin" | "signup" | "reset";
}) {
  const { t } = useI18n();
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">{t("auth.email")}</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@university.edu"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("auth.password")}</Label>
        <PasswordInput
          id="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={t("auth.passwordPlaceholder")}
        />
      </div>
    </>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        aria-label={visible ? t("auth.hidePassword") : t("auth.showPassword")}
        className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

function ExchangeFields({
  profile,
  setProfile,
}: {
  profile: AuthProfileForm;
  setProfile: (value: AuthProfileForm) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-semibold">{t("auth.exchangeTitle")}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {t("auth.exchangeDesc")}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-country">{t("onboarding.countryLabel")}</Label>
          <Select
            value={profile.country}
            onValueChange={(country) => setProfile({ ...profile, country })}
          >
            <SelectTrigger id="signup-country">
              <SelectValue placeholder={t("auth.chooseCountry")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="other" disabled>
                {t("onboarding.moreCountries")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-university">{t("auth.hostUniversity")}</Label>
          <Select
            value={profile.university}
            onValueChange={(university) => setProfile({ ...profile, university })}
          >
            <SelectTrigger id="signup-university">
              <SelectValue placeholder={t("auth.chooseUniversity")} />
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

        <div className="space-y-2">
          <Label htmlFor="signup-nationality">{t("profile.nationality")}</Label>
          <Select
            value={profile.nationality}
            onValueChange={(nationality) => setProfile({ ...profile, nationality })}
          >
            <SelectTrigger id="signup-nationality">
              <SelectValue placeholder={t("auth.chooseNationality")} />
            </SelectTrigger>
            <SelectContent>
              {NATIONALITY_OPTIONS.map((nationality) => (
                <SelectItem key={nationality} value={nationality}>
                  {nationality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-start-date">{t("onboarding.arrivalLabel")}</Label>
          <Input
            id="signup-start-date"
            type="date"
            value={profile.startDate}
            onChange={(event) => setProfile({ ...profile, startDate: event.target.value })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="signup-duration">{t("onboarding.durationLabel")}</Label>
          <Select
            value={profile.duration}
            onValueChange={(duration) =>
              setProfile({ ...profile, duration: duration as ProfileQuestionnaire["duration"] })
            }
          >
            <SelectTrigger id="signup-duration">
              <SelectValue placeholder={t("auth.chooseDuration")} />
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
    </div>
  );
}

function isCompleteProfile(profile: AuthProfileForm): profile is ProfileQuestionnaire {
  return Boolean(
    profile.country &&
      profile.university &&
      profile.nationality &&
      profile.startDate &&
      profile.duration,
  );
}

function cleanAuthError(message: string) {
  try {
    const parsed = JSON.parse(message) as { msg?: string; error_description?: string };
    const parsedMessage = parsed.msg ?? parsed.error_description ?? message;
    if (parsedMessage.toLowerCase().includes("rate limit")) {
      return "Too many emails were sent recently. Please wait a few minutes before trying again.";
    }
    return parsedMessage;
  } catch {
    if (message.toLowerCase().includes("rate limit")) {
      return "Too many emails were sent recently. Please wait a few minutes before trying again.";
    }
    return message;
  }
}

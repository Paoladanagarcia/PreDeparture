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
        setMessage("Password updated. You can now use your new password.");
        navigate({ to: "/dashboard" });
      } else if (mode === "signin") {
        await signIn(email, password);
        navigate({ to: "/dashboard" });
      } else if (mode === "reset") {
        await requestPasswordReset(email);
        setMessage("If this email exists, a password reset link has been sent.");
      } else {
        await signUp(email, password, { firstName, lastName });
        if (isCompleteProfile(exchangeProfile)) {
          setProfile(exchangeProfile);
          setLocalRoadmap(true);
        }
        setMessage("Account created. Check your email to confirm your account.");
      }
    } catch (err) {
      setError(err instanceof Error ? cleanAuthError(err.message) : "Authentication failed.");
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
    setMessage("Guest roadmap cleared from this browser.");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <PublicHeader active="profile" />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6 max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Cloud sync
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to save your profile and checklist in the database. Without an
            account, guest mode keeps your roadmap only in this browser.
          </p>
        </div>

        {!configured && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase is not configured yet</AlertTitle>
            <AlertDescription>
              Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your environment variables to
              enable sign in and cloud sync.
            </AlertDescription>
          </Alert>
        )}

        {recoveryMode ? (
          <Card className="max-w-xl p-5 sm:p-6">
            <h2 className="font-semibold">Choose a new password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter a new password for your PreDeparture account.
            </p>
            <div className="mt-5 space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {message && <p className="mt-4 text-sm text-success">{message}</p>}
            <Button
              className="mt-5 w-full"
              disabled={!configured || loading || newPassword.length < 6}
              onClick={submit}
            >
              {loading ? "Please wait..." : "Update password"}
            </Button>
          </Card>
        ) : session ? (
          <Card className="max-w-xl p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" />
              <div>
                <h2 className="font-semibold">Signed in</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {session.user.email ?? "Your account"} is syncing profile and checklist progress.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/dashboard">Go to dashboard</Link>
              </Button>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-1 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="max-w-xl p-5 sm:p-6">
            <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)}>
              <TabsList className="mb-5">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Create account</TabsTrigger>
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
                    Forgot password?
                  </button>
                </div>
              </TabsContent>
              <TabsContent value="reset" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@university.edu"
                  />
                  <p className="text-xs text-muted-foreground">
                    We'll send a secure link to choose a new password.
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
                ? "Please wait..."
                : mode === "signin"
                  ? "Sign in"
                  : mode === "reset"
                    ? "Send reset link"
                    : "Create account"}
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/onboarding" search={{ mode: "guest" }}>
                Continue as guest
              </Link>
            </Button>
          </Card>
        )}

        {!session && localRoadmap && (
          <Card className="mt-4 max-w-xl p-4">
            <p className="text-sm font-medium">Guest roadmap found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This browser still has a local guest roadmap. You can continue it or clear it before
              starting fresh.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to="/dashboard">Continue guest roadmap</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={clearGuestRoadmap}>
                Clear guest roadmap
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
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="first-name">First name</Label>
        <Input
          id="first-name"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="First name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last name</Label>
        <Input
          id="last-name"
          type="text"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Last name"
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
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
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
        <Label htmlFor="password">Password</Label>
        <PasswordInput
          id="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
        />
      </div>
    </>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-10" />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
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
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-semibold">Your exchange</p>
      <p className="mt-1 text-xs text-muted-foreground">
        These details create your dashboard immediately after your account is ready.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="signup-country">Destination country</Label>
          <Select
            value={profile.country}
            onValueChange={(country) => setProfile({ ...profile, country })}
          >
            <SelectTrigger id="signup-country">
              <SelectValue placeholder="Choose country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="other" disabled>
                More countries coming soon
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="signup-university">Host university</Label>
          <Select
            value={profile.university}
            onValueChange={(university) => setProfile({ ...profile, university })}
          >
            <SelectTrigger id="signup-university">
              <SelectValue placeholder="Choose university" />
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
          <Label htmlFor="signup-nationality">Nationality</Label>
          <Select
            value={profile.nationality}
            onValueChange={(nationality) => setProfile({ ...profile, nationality })}
          >
            <SelectTrigger id="signup-nationality">
              <SelectValue placeholder="Choose nationality" />
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
          <Label htmlFor="signup-start-date">Arrival / start date</Label>
          <Input
            id="signup-start-date"
            type="date"
            value={profile.startDate}
            onChange={(event) => setProfile({ ...profile, startDate: event.target.value })}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="signup-duration">Exchange duration</Label>
          <Select
            value={profile.duration}
            onValueChange={(duration) =>
              setProfile({ ...profile, duration: duration as ProfileQuestionnaire["duration"] })
            }
          >
            <SelectTrigger id="signup-duration">
              <SelectValue placeholder="Choose duration" />
            </SelectTrigger>
            <SelectContent>
              {DURATION_OPTIONS.map((duration) => (
                <SelectItem key={duration.value} value={duration.value}>
                  {duration.label}
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

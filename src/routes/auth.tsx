import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, CheckCircle2, LogOut, ShieldCheck } from "lucide-react";

import { Logo } from "@/components/Logo";
import { MobileNav } from "@/components/MobileNav";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { clearLocalRoadmap, hasLocalRoadmap } from "@/lib/storage";

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
  const { configured, session, signIn, signOut, signUp } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localRoadmap, setLocalRoadmap] = useState(() => hasLocalRoadmap());

  async function submit() {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signin") {
        await signIn(email, password);
        navigate({ to: "/dashboard" });
      } else {
        await signUp(email, password);
        setMessage("Account created. If email confirmation is enabled, check your inbox.");
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
      <header className="sticky top-0 z-50 border-b bg-card/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <Logo />
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/onboarding">Start Planning</Link>
            </Button>
          </div>
          <MobileNav />
        </div>
      </header>

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

        {session ? (
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
                />
              </TabsContent>
              <TabsContent value="signup" className="space-y-4">
                <AuthFields
                  email={email}
                  password={password}
                  setEmail={setEmail}
                  setPassword={setPassword}
                />
              </TabsContent>
            </Tabs>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            {message && <p className="mt-4 text-sm text-success">{message}</p>}

            <Button
              className="mt-5 w-full"
              disabled={!configured || loading || !email || password.length < 6}
              onClick={submit}
            >
              {loading ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <Button asChild variant="ghost" className="mt-2 w-full">
              <Link to="/onboarding">Continue as guest</Link>
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

function AuthFields({
  email,
  password,
  setEmail,
  setPassword,
}: {
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
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
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
        />
      </div>
    </>
  );
}

function cleanAuthError(message: string) {
  try {
    const parsed = JSON.parse(message) as { msg?: string; error_description?: string };
    return parsed.msg ?? parsed.error_description ?? message;
  } catch {
    return message;
  }
}

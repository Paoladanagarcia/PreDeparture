import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { initialMemberDetails, loadMemberProfiles, saveMemberProfile } from "@/lib/member-profile";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function MemberProfileEditor() {
  const { session } = useAuth();
  const { language } = useI18n();
  const fr = language === "fr";
  const [details, setDetails] = useState({ first_name: "", last_name: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"" | "error" | "saved">("");
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setStatus("");
    if (!session) return;
    loadMemberProfiles(session, [session.user.id])
      .then((rows) => {
        if (cancelled) return;
        setDetails(
          rows[0]
            ? { first_name: rows[0].first_name, last_name: rows[0].last_name, bio: rows[0].bio }
            : initialMemberDetails(session),
        );
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // Renewing the access token must not discard unsaved name or bio edits.
    // Requests resolve the latest token through the shared session manager.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id, reload]);
  if (!session) return null;
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!session || saving) return;
    setSaving(true);
    setStatus("");
    try {
      const saved = await saveMemberProfile(session, details);
      setDetails(saved);
      setStatus("saved");
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <Card className="mb-4 p-4 sm:p-5">
      <h2 className="font-semibold">
        {fr ? "Mon identité et ma fiche communauté" : "My name and community profile"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {fr
          ? "Votre prénom, nom complet et bio seront visibles aux membres avec qui vous partagez un groupe. Votre e-mail reste privé."
          : "Your first name, full surname and bio are visible to members who share a group with you. Your email stays private."}
      </p>
      <form onSubmit={save} className="mt-4 space-y-4">
        <fieldset disabled={loading || saving} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="member-first-name">{fr ? "Prénom" : "First name"}</Label>
              <Input
                id="member-first-name"
                autoComplete="given-name"
                required
                maxLength={60}
                value={details.first_name}
                onChange={(e) => {
                  setDetails({ ...details, first_name: e.target.value });
                  setStatus("");
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-last-name">{fr ? "Nom" : "Last name"}</Label>
              <Input
                id="member-last-name"
                autoComplete="family-name"
                required
                maxLength={60}
                value={details.last_name}
                onChange={(e) => {
                  setDetails({ ...details, last_name: e.target.value });
                  setStatus("");
                }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-bio">{fr ? "Bio (facultative)" : "Bio (optional)"}</Label>
            <Textarea
              id="member-bio"
              maxLength={280}
              rows={3}
              value={details.bio}
              onChange={(e) => {
                setDetails({ ...details, bio: e.target.value });
                setStatus("");
              }}
            />
            <p className="text-xs text-muted-foreground">{details.bio.length}/280</p>
          </div>
          <Button type="submit">
            {saving
              ? fr
                ? "Enregistrement…"
                : "Saving…"
              : fr
                ? "Enregistrer mes informations"
                : "Save my details"}
          </Button>
        </fieldset>
        {loading && status !== "error" && <p role="status">{fr ? "Chargement…" : "Loading…"}</p>}
        {status === "saved" && (
          <p role="status" className="text-sm text-success">
            {fr ? "Vos informations ont été enregistrées." : "Your details have been saved."}
          </p>
        )}
        {status === "error" && (
          <div role="alert" className="text-sm text-destructive">
            {fr
              ? "Impossible de charger ou d’enregistrer votre fiche. Vos modifications restent dans le formulaire."
              : "Your profile could not be loaded or saved. Your edits remain in the form."}
            {loading && (
              <Button
                type="button"
                variant="outline"
                className="ml-2"
                onClick={() => setReload(reload + 1)}
              >
                {fr ? "Réessayer" : "Retry"}
              </Button>
            )}
          </div>
        )}
      </form>
    </Card>
  );
}

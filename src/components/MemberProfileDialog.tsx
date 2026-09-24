import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import type { AuthSession } from "@/lib/auth";
import { loadMemberProfiles, type MemberProfile } from "@/lib/member-profile";

export function MemberProfileDialog({
  session,
  userId,
  cohortLabel,
  onClose,
}: {
  session: AuthSession;
  userId: string | null;
  cohortLabel: string;
  onClose: () => void;
}) {
  const { language } = useI18n();
  const fr = language === "fr";
  const [result, setResult] = useState<{
    id: string;
    member?: MemberProfile;
    error?: boolean;
  } | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setResult(null);
    if (!userId) return;
    loadMemberProfiles(session, [userId])
      .then((rows) => {
        if (!cancelled) setResult({ id: userId, member: rows[0] });
      })
      .catch(() => {
        if (!cancelled) setResult({ id: userId, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [session, userId, retry]);
  const current = result?.id === userId ? result : null;
  return (
    <Dialog
      open={!!userId}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="break-words">
            {current?.member?.full_name || (fr ? "Fiche membre" : "Member profile")}
          </DialogTitle>
          <DialogDescription>
            {fr
              ? "Visible uniquement entre membres partageant un groupe."
              : "Visible only to members who share a group."}
          </DialogDescription>
        </DialogHeader>
        {!current ? (
          <p role="status">{fr ? "Chargement…" : "Loading…"}</p>
        ) : current.error ? (
          <div role="alert">
            <p>{fr ? "Impossible de charger cette fiche." : "Unable to load this profile."}</p>
            <Button variant="outline" onClick={() => setRetry((value) => value + 1)}>
              {fr ? "Réessayer" : "Retry"}
            </Button>
          </div>
        ) : current.member ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {fr
                  ? "Université et cohorte de cet échange"
                  : "University and cohort for this conversation"}
              </p>
              <p className="mt-1 font-medium">{cohortLabel}</p>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm">
              {current.member.bio ||
                (fr
                  ? "Ce membre n’a pas encore ajouté de bio."
                  : "This member hasn’t added a bio yet.")}
            </p>
          </div>
        ) : (
          <p>
            {fr
              ? "Cette fiche n’est pas disponible ou vous ne partagez plus de groupe avec ce membre."
              : "This profile is unavailable or you no longer share a group with this member."}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

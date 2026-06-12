import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppHeader";
import { CommunityCard } from "@/components/CommunityCard";
import { useI18n } from "@/lib/i18n";
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
  const { t } = useI18n();

  if (!loaded) return null;

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="community" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {t("community.eyebrow")}
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-2xl">{t("community.title")}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t("community.description")}
          </p>
        </div>

        <CommunityCard profile={profile} />
      </main>
    </div>
  );
}

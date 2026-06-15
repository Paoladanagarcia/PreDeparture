import { createFileRoute } from "@tanstack/react-router";
import {
  ExternalLink,
  Lightbulb,
  Mail,
  MapPinned,
  Plane,
  ShoppingBasket,
  Sparkles,
  Utensils,
} from "lucide-react";

import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n, type Language } from "@/lib/i18n";
import { useProfile } from "@/lib/storage";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Student tips — PreDeparture" },
      {
        name: "description",
        content:
          "Student-sourced practical tips for groceries, going out and trips around Berkeley.",
      },
    ],
  }),
  component: TipsPage,
});

const BERKELEY_TIPS = {
  groceries: [
    {
      place: "Trader Joe's",
      bestFor: ["Bread", "cheese", "chicken", "pasta", "tomato sauce"],
    },
    {
      place: "Berkeley Bowl",
      bestFor: [
        "Fruit and vegetables",
        "red meat",
        "eggs",
        "dairy",
        "international products and sauces",
      ],
    },
    {
      place: "Safeway",
      bestFor: [
        "Toilet paper",
        "paper towels",
        "dish soap",
        "shampoo",
        "shower gel",
        "basic pantry items",
      ],
    },
  ],
  outings: [
    {
      area: "Berkeley",
      items: [
        "Raleigh's on Tuesdays is a popular student meetup.",
        "Tap Haus is useful for pool and late evenings in Berkeley.",
        "Kip's is one of the main nightclub-style options in Berkeley.",
        "The karaoke place under Tap Haus can be fun for groups.",
        "Freehouse is a cosy bar with a large terrace.",
      ],
    },
    {
      area: "San Francisco",
      items: [
        "Monroe has Friday evening events with changing prices and decade-themed music.",
        "Audio is known for electronic music events.",
        "The Midway hosts larger electronic music events with a strong sound and light setup.",
        "1015 Folsom often hosts touring artists and club nights.",
      ],
    },
  ],
  trips: [
    {
      length: "One day",
      items: ["San Francisco", "Santa Cruz", "Pinnacles National Park", "Muir Woods", "Ocean Beach / Pacifica surf spots"],
    },
    {
      length: "One weekend",
      items: [
        "Big Sur, Monterey and Carmel-by-the-Sea",
        "Los Angeles",
        "San Diego",
        "Las Vegas",
        "Lake Tahoe",
        "Yosemite",
        "Sequoia National Park",
      ],
    },
    {
      length: "One week",
      items: [
        "Grand Canyon road trip",
        "Zion and Bryce Canyon",
        "Horseshoe Bend and Antelope Canyon",
        "Death Valley",
        "Mammoth Lakes hot springs",
        "Joshua Tree",
      ],
    },
  ],
};

const COPY = {
  en: {
    eyebrow: "Student-sourced tips",
    title: "Berkeley student tips",
    intro:
      "Practical notes shared by former Berkeley exchange students. These tips are not official and can change quickly.",
    disclaimer:
      "Always verify prices, opening hours, age restrictions, transport, reservations and safety information before going.",
    berkeleyOnly:
      "For now, student tips are available for UC Berkeley only. Stanford tips can be added when students share reliable notes.",
    groceries: "Groceries",
    groceriesDesc: "Where former students tended to buy everyday items.",
    bestFor: "Best for",
    outings: "Going out",
    outingsDesc:
      "Student notes for Berkeley and San Francisco. US alcohol venues are generally 21+.",
    trips: "Trips",
    tripsDesc: "Ideas for day trips, weekends and longer breaks from Berkeley.",
    suggestTitle: "Have better or newer tips?",
    suggestDesc:
      "Students can suggest updates, corrections or new tips. I will review them before adding anything to the app.",
    suggestButton: "Suggest a tip",
    comingTitle: "Stanford tips are coming later",
    comingDesc:
      "I only have student-verified tips for Berkeley right now. You can still suggest Stanford tips if you studied there.",
  },
  fr: {
    eyebrow: "Tips d'étudiants",
    title: "Tips étudiants Berkeley",
    intro:
      "Notes pratiques partagées par d'anciens étudiants partis à Berkeley. Ces conseils ne sont pas officiels et peuvent changer vite.",
    disclaimer:
      "Vérifiez toujours prix, horaires, restrictions d'âge, transports, réservations et sécurité avant d'y aller.",
    berkeleyOnly:
      "Pour l'instant, les tips étudiants existent seulement pour UC Berkeley. Les tips Stanford pourront être ajoutés quand des étudiants partageront des notes fiables.",
    groceries: "Courses",
    groceriesDesc: "Où les anciens étudiants avaient tendance à acheter les produits du quotidien.",
    bestFor: "Pratique pour",
    outings: "Sorties",
    outingsDesc:
      "Notes étudiantes pour Berkeley et San Francisco. Les lieux avec alcool aux États-Unis sont généralement réservés aux 21 ans et plus.",
    trips: "Voyages",
    tripsDesc: "Idées pour une journée, un week-end ou une semaine depuis Berkeley.",
    suggestTitle: "Vous avez de meilleurs tips ?",
    suggestDesc:
      "Les étudiants peuvent proposer des ajouts ou corrections. Je les vérifierai avant d'ajouter quoi que ce soit dans l'app.",
    suggestButton: "Proposer un tip",
    comingTitle: "Les tips Stanford arriveront plus tard",
    comingDesc:
      "Pour l'instant, je n'ai des tips vérifiés par étudiants que pour Berkeley. Vous pouvez proposer des tips Stanford si vous y êtes allé.",
  },
} satisfies Record<Language, Record<string, string>>;

function TipsPage() {
  const { language } = useI18n();
  const { profile } = useProfile();
  const copy = COPY[language];
  const university = profile?.university;
  const isStanford = university === "Stanford University";

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="tips" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {copy.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-2xl">{copy.title}</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{copy.intro}</p>
        </div>

        <Card className="mb-5 border-primary/20 bg-primary-soft/50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-primary">{copy.disclaimer}</p>
          </div>
        </Card>

        {isStanford && (
          <Card className="mb-5 p-5">
            <Badge variant="secondary" className="mb-3">
              Stanford
            </Badge>
            <h2 className="text-lg font-semibold">{copy.comingTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{copy.comingDesc}</p>
            <SuggestTipButton label={copy.suggestButton} className="mt-4" />
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <ShoppingBasket className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{copy.groceries}</h2>
                <p className="text-sm text-muted-foreground">{copy.groceriesDesc}</p>
              </div>
            </div>
            <div className="space-y-3">
              {BERKELEY_TIPS.groceries.map((store) => (
                <div key={store.place} className="rounded-lg border bg-background p-3">
                  <h3 className="font-semibold">{store.place}</h3>
                  <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {copy.bestFor}
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {store.bestFor.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Utensils className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{copy.outings}</h2>
                <p className="text-sm text-muted-foreground">{copy.outingsDesc}</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {BERKELEY_TIPS.outings.map((group) => (
                <div key={group.area} className="rounded-lg border bg-background p-3">
                  <h3 className="font-semibold">{group.area}</h3>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-4 p-5">
          <div className="mb-4 flex items-start gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{copy.trips}</h2>
              <p className="text-sm text-muted-foreground">{copy.tripsDesc}</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {BERKELEY_TIPS.trips.map((trip) => (
              <div key={trip.length} className="rounded-lg border bg-background p-3">
                <h3 className="flex items-center gap-2 font-semibold">
                  <MapPinned className="h-4 w-4 text-primary" />
                  {trip.length}
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                  {trip.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="mt-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">{copy.suggestTitle}</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{copy.suggestDesc}</p>
              <p className="mt-2 text-xs text-muted-foreground">{copy.berkeleyOnly}</p>
            </div>
            <SuggestTipButton label={copy.suggestButton} />
          </div>
        </Card>
      </main>
    </div>
  );
}

function SuggestTipButton({ label, className }: { label: string; className?: string }) {
  const subject = encodeURIComponent("PreDeparture student tip suggestion");
  const body = encodeURIComponent(
    [
      "Hi,",
      "",
      "I would like to suggest a student tip for PreDeparture.",
      "",
      "University:",
      "Category: groceries / housing / going out / trips / arrival / other",
      "Tip:",
      "Source or personal context:",
      "",
      "Thanks!",
    ].join("\n"),
  );

  return (
    <Button asChild className={className}>
      <a href={`mailto:pao.dana.garcia@gmail.com?subject=${subject}&body=${body}`}>
        <Mail className="h-4 w-4" /> {label} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}

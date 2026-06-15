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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n, type Language } from "@/lib/i18n";
import { useProfile } from "@/lib/storage";
import type { SupportedUniversity } from "@/lib/universities";

export const Route = createFileRoute("/tips")({
  head: () => ({
    meta: [
      { title: "Student tips — PreDeparture" },
      {
        name: "description",
        content:
          "Student-sourced practical tips for groceries, nights out and trips.",
      },
    ],
  }),
  component: TipsPage,
});

type LocalizedText = Record<Language, string>;
type LocalizedList = Record<Language, string[]>;

type PlaceTip = {
  name: string;
  usefulFor: LocalizedText;
  distance: LocalizedText;
  price: "$" | "$$" | "$$$" | "$-$$";
  note: LocalizedText;
  items?: LocalizedList;
};

type OutingGroup = {
  area: string;
  vibe: LocalizedText;
  items: LocalizedList;
};

type TripGroup = {
  length: LocalizedText;
  items: LocalizedList;
};

type TipsData = {
  title: LocalizedText;
  intro: LocalizedText;
  disclaimer: LocalizedText;
  groceries: PlaceTip[];
  outings: OutingGroup[];
  trips: TripGroup[];
};

const UNIVERSITY_TIPS = {
  "UC Berkeley": {
    title: {
      en: "Berkeley student tips",
      fr: "Tips étudiants Berkeley",
    },
    intro: {
      en: "Practical notes shared by former Berkeley exchange students. These tips are student-sourced, not official, and can change quickly.",
      fr: "Notes pratiques partagées par d'anciens étudiants partis à Berkeley. Ces conseils viennent d'étudiants, ne sont pas officiels et peuvent changer vite.",
    },
    disclaimer: {
      en: "Always verify prices, opening hours, age restrictions, transport, reservations and safety information before going.",
      fr: "Vérifiez toujours prix, horaires, restrictions d'âge, transports, réservations et sécurité avant d'y aller.",
    },
    groceries: [
      {
        name: "Trader Joe's",
        usefulFor: { en: "weekly groceries, quick meals", fr: "courses de la semaine, repas rapides" },
        distance: { en: "Close to campus by bus or bike", fr: "Proche du campus en bus ou vélo" },
        price: "$-$$",
        note: {
          en: "Good for affordable basics, snacks and simple student meals.",
          fr: "Pratique pour les basiques, snacks et repas étudiants simples.",
        },
        items: {
          en: ["Bread", "cheese", "chicken", "tomato sauce", "pasta", "alcohol"],
          fr: ["Pain", "fromage", "poulet", "sauce tomate", "pâtes", "alcool"],
        },
      },
      {
        name: "Berkeley Bowl",
        usefulFor: { en: "fresh food, international products", fr: "produits frais, produits internationaux" },
        distance: { en: "Bike, bus or short ride from campus", fr: "Vélo, bus ou petit trajet depuis le campus" },
        price: "$$",
        note: {
          en: "Often useful when you want better produce or more variety than a small supermarket.",
          fr: "Souvent utile pour de meilleurs produits frais ou plus de choix qu'un petit supermarché.",
        },
        items: {
          en: [
            "Fruit",
            "vegetables",
            "red meat",
            "eggs",
            "cream",
            "milk",
            "yogurt",
            "noodles",
            "sauces",
            "international products",
          ],
          fr: [
            "Fruits",
            "légumes",
            "viande rouge",
            "œufs",
            "crème",
            "lait",
            "yaourts",
            "nouilles",
            "sauces",
            "produits internationaux",
          ],
        },
      },
      {
        name: "Safeway",
        usefulFor: { en: "household products, toiletries, basics", fr: "maison, hygiène, basiques" },
        distance: { en: "Usually reachable by bus, bike or short ride", fr: "Souvent accessible en bus, vélo ou petit trajet" },
        price: "$$",
        note: {
          en: "Useful for household products and toiletries.",
          fr: "Pratique pour les produits maison et hygiène.",
        },
        items: {
          en: ["Toilet paper", "beer", "paper towels", "dish soap", "Nutella", "shampoo", "shower gel"],
          fr: ["Papier toilette", "bières", "sopalin", "produit vaisselle", "Nutella", "shampoing", "gel douche"],
        },
      },
    ],
    outings: [
      {
        area: "Berkeley",
        vibe: { en: "student-friendly and close to campus", fr: "étudiant et proche du campus" },
        items: {
          en: [
            "Raleigh's on Tuesdays is a popular student meetup.",
            "Tap Haus is useful for pool and late evenings in Berkeley.",
            "Kip's is one of the main nightclub-style options in Berkeley.",
            "The karaoke place under Tap Haus can be fun for groups.",
            "Freehouse is a cosy bar with a large terrace.",
          ],
          fr: [
            "Raleigh's le mardi est un meetup étudiant populaire.",
            "Tap Haus est pratique pour le billard et les soirées tardives à Berkeley.",
            "Kip's est une des principales options type boîte à Berkeley.",
            "Le karaoké sous Tap Haus peut être très sympa en groupe.",
            "Freehouse est un bar cosy avec une grande terrasse.",
          ],
        },
      },
      {
        area: "San Francisco",
        vibe: { en: "bigger nights out and events", fr: "plus grosses sorties et événements" },
        items: {
          en: [
            "Monroe has Friday evening events with changing prices and decade-themed music.",
            "Audio is known for electronic music events.",
            "The Midway hosts larger electronic music events with a strong sound and light setup.",
            "1015 Folsom often hosts touring artists and club nights.",
          ],
          fr: [
            "Monroe a des soirées du vendredi avec prix évolutifs et musique par décennies.",
            "Audio est connu pour les événements de musique électronique.",
            "The Midway accueille de gros événements électro avec bon son et lumières.",
            "1015 Folsom accueille souvent des artistes et soirées club.",
          ],
        },
      },
    ],
    trips: [
      {
        length: { en: "One day", fr: "Une journée" },
        items: {
          en: ["San Francisco", "Santa Cruz", "Pinnacles National Park", "Muir Woods", "Ocean Beach / Pacifica surf spots"],
          fr: ["San Francisco", "Santa Cruz", "Pinnacles National Park", "Muir Woods", "spots de surf Ocean Beach / Pacifica"],
        },
      },
      {
        length: { en: "One weekend", fr: "Un week-end" },
        items: {
          en: ["Big Sur, Monterey and Carmel-by-the-Sea", "Los Angeles", "San Diego", "Las Vegas", "Lake Tahoe", "Yosemite", "Sequoia National Park"],
          fr: ["Big Sur, Monterey et Carmel-by-the-Sea", "Los Angeles", "San Diego", "Las Vegas", "Lake Tahoe", "Yosemite", "Sequoia National Park"],
        },
      },
      {
        length: { en: "One week", fr: "Une semaine" },
        items: {
          en: ["Grand Canyon road trip", "Zion and Bryce Canyon", "Horseshoe Bend and Antelope Canyon", "Death Valley", "Mammoth Lakes hot springs", "Joshua Tree"],
          fr: ["Road trip Grand Canyon", "Zion et Bryce Canyon", "Horseshoe Bend et Antelope Canyon", "Death Valley", "Mammoth Lakes hot springs", "Joshua Tree"],
        },
      },
    ],
  },
  "Stanford University": {
    title: {
      en: "Stanford student tips",
      fr: "Tips étudiants Stanford",
    },
    intro: {
      en: "A practical starter version for Stanford students. Some transport and venue details change, so check current official schedules before relying on them.",
      fr: "Une première version pratique pour Stanford. Certains détails de transport et horaires changent, donc vérifiez les horaires officiels récents.",
    },
    disclaimer: {
      en: "Always verify prices, opening hours, age restrictions, transport, reservations and safety information before going.",
      fr: "Vérifiez toujours prix, horaires, restrictions d'âge, transports, réservations et sécurité avant d'y aller.",
    },
    groceries: [
      {
        name: "Trader Joe's Palo Alto",
        usefulFor: { en: "affordable groceries, snacks, frozen meals, quick meals", fr: "courses abordables, snacks, surgelés, repas rapides" },
        distance: { en: "Off campus, closer with bike, bus or car", fr: "Hors campus, plus simple en vélo, bus ou voiture" },
        price: "$-$$",
        note: {
          en: "Good for weekly groceries, but not enough for everything.",
          fr: "Bien pour les courses de la semaine, mais pas suffisant pour tout.",
        },
      },
      {
        name: "Safeway Palo Alto / Menlo Park",
        usefulFor: { en: "basic groceries, pharmacy basics, toiletries", fr: "courses basiques, pharmacie simple, hygiène" },
        distance: { en: "Off campus, depends on housing location", fr: "Hors campus, dépend du logement" },
        price: "$$",
        note: {
          en: "Useful for groceries, toiletries and basic pharmacy items.",
          fr: "Pratique pour les courses, l'hygiène et la petite pharmacie.",
        },
      },
      {
        name: "Target Mountain View / Redwood City",
        usefulFor: { en: "bedding, towels, storage, cleaning products, adapters", fr: "draps, serviettes, rangement, ménage, adaptateurs" },
        distance: { en: "Further from campus", fr: "Plus loin du campus" },
        price: "$$",
        note: {
          en: "Better for move-in essentials than normal groceries.",
          fr: "Mieux pour l'installation que pour les courses classiques.",
        },
      },
      {
        name: "Stanford Shopping Express",
        usefulFor: { en: "reaching shopping areas without a car", fr: "rejoindre des zones commerciales sans voiture" },
        distance: { en: "Campus to shopping areas", fr: "Campus vers zones commerciales" },
        price: "$",
        note: {
          en: "Check the current Stanford Transportation schedule before planning around it.",
          fr: "Vérifiez l'horaire Stanford Transportation actuel avant de vous organiser avec.",
        },
      },
    ],
    outings: [
      {
        area: "Palo Alto",
        vibe: { en: "calmer and more expensive than Berkeley", fr: "plus calme et plus cher que Berkeley" },
        items: {
          en: ["Good for restaurants, cafes and casual evenings.", "Better for dinner than real nightlife."],
          fr: ["Bien pour restaurants, cafés et soirées tranquilles.", "Mieux pour dîner que pour vraie nightlife."],
        },
      },
      {
        area: "San Francisco",
        vibe: { en: "bigger nights out, concerts, museums and clubs", fr: "grosses sorties, concerts, musées et clubs" },
        items: {
          en: ["Use Caltrain or a car.", "Plan the return carefully because late-night transport can be less convenient."],
          fr: ["Utilisez Caltrain ou une voiture.", "Prévoyez bien le retour car les transports tard le soir peuvent être moins pratiques."],
        },
      },
      {
        area: "Stanford campus arts",
        vibe: { en: "free or low-cost culture on campus", fr: "culture gratuite ou peu chère sur le campus" },
        items: {
          en: ["Cantor Arts Center", "Anderson Collection", "Outdoor art around campus"],
          fr: ["Cantor Arts Center", "Anderson Collection", "œuvres en extérieur sur le campus"],
        },
      },
    ],
    trips: [
      {
        length: { en: "One day", fr: "Une journée" },
        items: {
          en: ["San Francisco", "Half Moon Bay", "Santa Cruz", "Muir Woods", "Stanford campus museums", "Mountain View / Castro Street"],
          fr: ["San Francisco", "Half Moon Bay", "Santa Cruz", "Muir Woods", "musées du campus Stanford", "Mountain View / Castro Street"],
        },
      },
      {
        length: { en: "One weekend", fr: "Un week-end" },
        items: {
          en: ["Monterey and Carmel-by-the-Sea", "Big Sur", "Lake Tahoe", "Yosemite", "Napa / Sonoma", "Los Angeles"],
          fr: ["Monterey et Carmel-by-the-Sea", "Big Sur", "Lake Tahoe", "Yosemite", "Napa / Sonoma", "Los Angeles"],
        },
      },
      {
        length: { en: "One week", fr: "Une semaine" },
        items: {
          en: ["California road trip", "Grand Canyon, Zion and Bryce", "Death Valley", "Joshua Tree", "Las Vegas and national parks", "Pacific Coast Highway"],
          fr: ["Road trip Californie", "Grand Canyon, Zion et Bryce", "Death Valley", "Joshua Tree", "Las Vegas et parcs nationaux", "Pacific Coast Highway"],
        },
      },
    ],
  },
} satisfies Record<SupportedUniversity, TipsData>;

const COPY = {
  en: {
    eyebrow: "Student-sourced tips",
    usefulFor: "Useful for",
    distance: "Distance",
    price: "Price",
    studentTip: "Student tip",
    groceries: "Groceries",
    groceriesDesc: "Where students tend to buy everyday items.",
    outings: "Going out",
    outingsDesc: "Student notes for evenings and low-effort plans. US alcohol venues are generally 21+.",
    trips: "Trips",
    tripsDesc: "Ideas for day trips, weekends and longer breaks.",
    suggestTitle: "Have better or newer tips?",
    suggestDesc:
      "Students can suggest updates, corrections or new tips. I will review them before adding anything to the app.",
    suggestButton: "Suggest a tip",
    campusFallback:
      "No profile selected yet, so Berkeley tips are shown by default. Choose Stanford in your profile to see Stanford tips.",
  },
  fr: {
    eyebrow: "Tips d'étudiants",
    usefulFor: "Utile pour",
    distance: "Distance",
    price: "Prix",
    studentTip: "Tip étudiant",
    groceries: "Courses",
    groceriesDesc: "Où les étudiants ont tendance à acheter les produits du quotidien.",
    outings: "Sorties",
    outingsDesc: "Notes étudiantes pour les soirées et plans simples. Les lieux avec alcool aux États-Unis sont généralement 21+.",
    trips: "Voyages",
    tripsDesc: "Idées pour une journée, un week-end ou une pause plus longue.",
    suggestTitle: "Vous avez de meilleurs tips ?",
    suggestDesc:
      "Les étudiants peuvent proposer des ajouts ou corrections. Je les vérifierai avant d'ajouter quoi que ce soit dans l'app.",
    suggestButton: "Proposer un tip",
    campusFallback:
      "Aucun profil sélectionné : les tips Berkeley sont affichés par défaut. Choisissez Stanford dans votre profil pour voir les tips Stanford.",
  },
} satisfies Record<Language, Record<string, string>>;

function TipsPage() {
  const { language } = useI18n();
  const { profile } = useProfile();
  const copy = COPY[language];
  const selectedUniversity = getTipsUniversity(profile?.university);
  const tips = UNIVERSITY_TIPS[selectedUniversity];

  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader active="tips" />

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {copy.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-2xl">{tips.title[language]}</h1>
          <p className="mt-2 text-sm text-muted-foreground xl:whitespace-nowrap">
            {tips.intro[language]}
          </p>
          {!profile?.university && (
            <p className="mt-2 max-w-3xl text-xs text-muted-foreground">{copy.campusFallback}</p>
          )}
        </div>

        <Card className="mb-5 border-primary/20 bg-primary-soft/50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm text-primary">{tips.disclaimer[language]}</p>
          </div>
        </Card>

        <SectionHeader
          icon={ShoppingBasket}
          title={copy.groceries}
          description={copy.groceriesDesc}
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tips.groceries.map((place) => (
            <PlaceCard key={place.name} place={place} language={language} copy={copy} />
          ))}
        </div>

        <SectionHeader
          icon={Utensils}
          title={copy.outings}
          description={copy.outingsDesc}
          className="mt-8"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {tips.outings.map((group) => (
            <Card key={group.area} className="p-4">
              <h3 className="font-semibold">{group.area}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{group.vibe[language]}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {group.items[language].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <SectionHeader
          icon={Plane}
          title={copy.trips}
          description={copy.tripsDesc}
          className="mt-8"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {tips.trips.map((trip) => (
            <Card key={trip.length.en} className="p-4">
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPinned className="h-4 w-4 text-primary" />
                {trip.length[language]}
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {trip.items[language].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">{copy.suggestTitle}</h2>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{copy.suggestDesc}</p>
            </div>
            <SuggestTipButton label={copy.suggestButton} />
          </div>
        </Card>
      </main>
    </div>
  );
}

function getTipsUniversity(university?: string): SupportedUniversity {
  return university === "Stanford University" ? "Stanford University" : "UC Berkeley";
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: typeof ShoppingBasket;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <div className={`mb-4 flex items-start gap-3 ${className ?? ""}`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function PlaceCard({
  place,
  language,
  copy,
}: {
  place: PlaceTip;
  language: Language;
  copy: Record<string, string>;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{place.name}</h3>
        <Badge variant="secondary">{place.price}</Badge>
      </div>

      <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
        <InfoLine label={copy.usefulFor} value={place.usefulFor[language]} />
        <InfoLine label={copy.distance} value={place.distance[language]} />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{copy.studentTip}: </span>
        {place.note[language]}
      </p>

      {place.items && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {place.items[language].map((item) => (
            <li
              key={item}
              className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-medium text-foreground">{label}: </span>
      {value}
    </p>
  );
}

function SuggestTipButton({ label }: { label: string }) {
  const to = "pao.dana.garcia@gmail.com";
  const subject = "PreDeparture student tip suggestion";
  const body = [
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
  ].join("\n");
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    to,
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <Button asChild>
      <a href={gmailUrl} target="_blank" rel="noreferrer">
        <Mail className="h-4 w-4" /> {label} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </Button>
  );
}

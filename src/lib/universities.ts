import type { HousingOption } from "./berkeley";
import { ARRIVAL_GUIDE, BERKELEY_HOUSING, OFFCAMPUS_TIPS, type ArrivalItem } from "./berkeley";

export const UNIVERSITY_OPTIONS = ["UC Berkeley", "Stanford University"] as const;

export type SupportedUniversity = (typeof UNIVERSITY_OPTIONS)[number];

export type UniversityResourceConfig = {
  name: SupportedUniversity;
  shortName: string;
  city: string;
  internationalOffice: {
    name: string;
    url: string;
  };
  housing: {
    title: string;
    desc: string;
    options: HousingOption[];
    offCampusTips: typeof OFFCAMPUS_TIPS;
  };
  arrival: {
    title: string;
    desc: string;
    items: ArrivalItem[];
  };
  insurance: {
    title: string;
    body: string;
    links: { label: string; url: string }[];
  };
  linksByTopic: {
    visa: { label: string; url: string }[];
    housing: { label: string; url: string }[];
    banking: { label: string; url: string }[];
    phone: { label: string; url: string }[];
    arrival: { label: string; url: string }[];
    scholarships: { label: string; url: string }[];
    insurance: { label: string; url: string }[];
  };
};

const stanfordHousing: HousingOption[] = [
  {
    name: "Stanford R&DE Student Housing",
    description:
      "Stanford's official student housing system. Start here for eligibility, application processes and assignment information.",
    pros: ["Official university source", "Closest to campus life", "Best starting point"],
    cons: ["Eligibility can depend on your program", "Availability and deadlines vary"],
    distanceFromCampus: "On or near campus",
    priceRange: "Check Stanford R&DE rates",
    furnished: true,
    popularWithExchange: true,
    url: "https://rde.stanford.edu/studenthousing",
  },
  {
    name: "Stanford Residential Education",
    description:
      "Overview of Stanford residential life, communities and student support within campus residences.",
    pros: ["Good for understanding residential life", "Official Stanford resource"],
    cons: ["Not a housing application portal"],
    distanceFromCampus: "On campus",
    priceRange: "Varies by assignment",
    furnished: true,
    popularWithExchange: true,
    url: "https://resed.stanford.edu/",
  },
  {
    name: "Stanford off-campus housing",
    description:
      "Use Stanford's official off-campus resources and verify listings carefully before paying deposits or signing contracts.",
    pros: ["Useful backup option", "More flexibility", "Good for longer stays"],
    cons: ["Palo Alto is expensive", "Scams and lease terms require careful checks"],
    distanceFromCampus: "Varies around Palo Alto / Menlo Park",
    priceRange: "Often high; verify current listings",
    furnished: false,
    popularWithExchange: true,
    url: "https://rde.stanford.edu/studenthousing/off-campus-housing",
  },
];

const stanfordArrivalGuide: ArrivalItem[] = [
  {
    title: "Check in with Bechtel International Center",
    description:
      "Use Stanford's international office guidance for immigration check-in, visa status and required arrival steps.",
    tip: "Do this early after arrival so your immigration record stays in good standing.",
    url: "https://bechtel.stanford.edu/",
  },
  {
    title: "Set up Axess",
    description:
      "Axess is Stanford's portal for student records, enrollment, finances and key university services.",
    tip: "Make sure you can log in before registration or administrative deadlines.",
    url: "https://axess.stanford.edu/",
  },
  {
    title: "Get your Stanford ID Card",
    description:
      "Your Stanford ID card is used for identification, campus access and university services.",
    tip: "Check the official card office instructions for pickup or setup requirements.",
    url: "https://uit.stanford.edu/service/campuscard",
  },
  {
    title: "Understand Marguerite shuttle and local transport",
    description:
      "Stanford's Marguerite shuttle and local transit options are useful for moving around campus and Palo Alto.",
    tip: "Plan your first campus trips before classes start.",
    url: "https://transportation.stanford.edu/marguerite",
  },
  {
    title: "Save Stanford emergency contacts",
    description: "Save Stanford public safety, emergency, insurance and embassy contacts.",
    tip: "Keep contacts offline in your phone in case data is not working.",
    url: "https://police.stanford.edu/",
  },
];

const stanfordOffCampusTips = {
  commonMistakes: [
    "Assuming all exchange students automatically get campus housing",
    "Underestimating Palo Alto and Menlo Park rent levels",
    "Sending deposits before verifying the landlord or listing",
    "Signing a lease that is longer than your exchange stay",
  ],
  averagePrices: [
    "Campus housing: check Stanford R&DE rates",
    "Private room near Palo Alto: often expensive; verify current listings",
    "Shared housing can reduce cost but requires careful lease checks",
  ],
  bestNeighborhoods: [
    "Stanford campus housing when eligible",
    "Palo Alto for campus proximity",
    "Menlo Park for nearby off-campus options",
    "Mountain View / Redwood City when commuting is acceptable",
  ],
};

export function getUniversityConfig(university?: string): UniversityResourceConfig {
  if (university === "Stanford University") {
    return {
      name: "Stanford University",
      shortName: "Stanford",
      city: "Stanford, California",
      internationalOffice: {
        name: "Bechtel International Center",
        url: "https://bechtel.stanford.edu/",
      },
      housing: {
        title: "Stanford Housing Guide",
        desc: "Stanford R&DE housing, residential life, off-campus options and rental checks.",
        options: stanfordHousing,
        offCampusTips: stanfordOffCampusTips,
      },
      arrival: {
        title: "Stanford Arrival Guide",
        desc: "Bechtel check-in, Axess, Stanford ID, Marguerite shuttle and safety contacts.",
        items: stanfordArrivalGuide,
      },
      insurance: {
        title: "Stanford Health Insurance Guide",
        body: "Stanford students may be subject to Cardinal Care health insurance requirements unless they qualify for a waiver. Check Stanford's current insurance and waiver rules before relying on an outside plan.",
        links: [
          {
            label: "Cardinal Care overview",
            url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
          },
          {
            label: "Waiving Cardinal Care",
            url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview/waiving-cardinal-care",
          },
        ],
      },
      linksByTopic: {
        visa: [
          { label: "Bechtel International Center", url: "https://bechtel.stanford.edu/" },
          {
            label: "U.S. student visas",
            url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
          },
          { label: "SEVIS I-901 fee", url: "https://www.fmjfee.com/" },
          { label: "DS-160 portal", url: "https://ceac.state.gov/genniv/" },
        ],
        housing: [
          {
            label: "Stanford R&DE Student Housing",
            url: "https://rde.stanford.edu/studenthousing",
          },
          {
            label: "Stanford off-campus housing",
            url: "https://rde.stanford.edu/studenthousing/off-campus-housing",
          },
          { label: "Stanford Residential Education", url: "https://resed.stanford.edu/" },
        ],
        banking: [
          { label: "Wise", url: "https://wise.com/" },
          {
            label: "Chase College Checking",
            url: "https://www.chase.com/personal/checking/college-checking",
          },
          {
            label: "Bank of America student banking",
            url: "https://www.bankofamerica.com/deposits/checking/student-banking/",
          },
        ],
        phone: [
          { label: "Airalo", url: "https://www.airalo.com/" },
          { label: "T-Mobile plans", url: "https://www.t-mobile.com/cell-phone-plans" },
          { label: "Mint Mobile", url: "https://www.mintmobile.com/" },
        ],
        arrival: [
          { label: "Bechtel International Center", url: "https://bechtel.stanford.edu/" },
          { label: "Axess", url: "https://axess.stanford.edu/" },
          { label: "Stanford ID Card", url: "https://uit.stanford.edu/service/campuscard" },
          { label: "Marguerite shuttle", url: "https://transportation.stanford.edu/marguerite" },
          { label: "Stanford public safety", url: "https://police.stanford.edu/" },
        ],
        scholarships: [
          { label: "Stanford Financial Aid", url: "https://financialaid.stanford.edu/" },
          { label: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/" },
        ],
        insurance: [
          {
            label: "Cardinal Care overview",
            url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
          },
          {
            label: "Waiving Cardinal Care",
            url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview/waiving-cardinal-care",
          },
          { label: "Vaden Health Services", url: "https://vaden.stanford.edu/" },
        ],
      },
    };
  }

  return {
    name: "UC Berkeley",
    shortName: "Berkeley",
    city: "Berkeley, California",
    internationalOffice: {
      name: "Berkeley International Office",
      url: "https://internationaloffice.berkeley.edu/",
    },
    housing: {
      title: "Berkeley Housing Guide",
      desc: "Campus housing, I-House, off-campus options, prices, neighborhoods and scam checks.",
      options: BERKELEY_HOUSING,
      offCampusTips: OFFCAMPUS_TIPS,
    },
    arrival: {
      title: "Berkeley Arrival Guide",
      desc: "Cal 1 Card, CalCentral, transport, orientation, health and emergency contacts.",
      items: ARRIVAL_GUIDE,
    },
    insurance: {
      title: "UC Berkeley Health Insurance Guide",
      body: "Berkeley requires SHIP unless you waive with an equivalent plan. Check the waiver criteria carefully because many international plans do not qualify. Confirm your plan covers repatriation, mental health and care in the United States.",
      links: [
        { label: "UC Berkeley SHIP", url: "https://uhs.berkeley.edu/ship" },
        {
          label: "SHIP waiver info",
          url: "https://uhs.berkeley.edu/insurance/waiving-ship",
        },
      ],
    },
    linksByTopic: {
      visa: [
        {
          label: "Berkeley International Office",
          url: "https://internationaloffice.berkeley.edu/",
        },
        {
          label: "U.S. student visas",
          url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
        },
        { label: "SEVIS I-901 fee", url: "https://www.fmjfee.com/" },
        { label: "DS-160 portal", url: "https://ceac.state.gov/genniv/" },
      ],
      housing: [
        { label: "UC Berkeley Housing", url: "https://housing.berkeley.edu/" },
        { label: "Berkeley Off-Campus Housing", url: "https://och.berkeley.edu/" },
        { label: "International House Berkeley", url: "https://ihouse.berkeley.edu/" },
      ],
      banking: [
        { label: "Wise", url: "https://wise.com/" },
        {
          label: "Chase College Checking",
          url: "https://www.chase.com/personal/checking/college-checking",
        },
        {
          label: "Bank of America student banking",
          url: "https://www.bankofamerica.com/deposits/checking/student-banking/",
        },
      ],
      phone: [
        { label: "Airalo", url: "https://www.airalo.com/" },
        { label: "T-Mobile plans", url: "https://www.t-mobile.com/cell-phone-plans" },
        { label: "Mint Mobile", url: "https://www.mintmobile.com/" },
      ],
      arrival: [
        {
          label: "Berkeley International Office",
          url: "https://internationaloffice.berkeley.edu/",
        },
        { label: "CalCentral", url: "https://calcentral.berkeley.edu/" },
        { label: "Cal 1 Card", url: "https://services.berkeley.edu/cal-1-card" },
        { label: "AC Transit", url: "https://www.actransit.org/" },
        { label: "BART", url: "https://www.bart.gov/" },
      ],
      scholarships: [
        { label: "UC Berkeley Financial Aid", url: "https://financialaid.berkeley.edu/" },
        { label: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/" },
      ],
      insurance: [
        { label: "UC Berkeley SHIP", url: "https://uhs.berkeley.edu/ship" },
        {
          label: "SHIP waiver info",
          url: "https://uhs.berkeley.edu/insurance/waiving-ship",
        },
        { label: "University Health Services", url: "https://uhs.berkeley.edu/" },
      ],
    },
  };
}

export type HousingOption = {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  distanceFromCampus: string;
  priceRange: string;
  furnished: boolean;
  popularWithExchange: boolean;
  url: string;
};

export const BERKELEY_HOUSING: HousingOption[] = [
  {
    name: "International House Berkeley (I-House)",
    description:
      "An iconic residence hall dedicated to mixing international and American students. Includes meal plan, programming, and a strong community feel.",
    pros: [
      "Built-in international community",
      "Meals included",
      "Walking distance to campus",
      "Cultural events and dinners",
    ],
    cons: [
      "Expensive compared to private rentals",
      "Shared bathrooms in most rooms",
      "High demand — apply early",
    ],
    distanceFromCampus: "5 min walk",
    priceRange: "$2,000 – $2,800 / month (room + board)",
    furnished: true,
    popularWithExchange: true,
    url: "https://ihouse.berkeley.edu/",
  },
  {
    name: "The Berk",
    description:
      "Modern private student housing on Telegraph Avenue with single rooms, shared apartments and amenities like a gym and study lounges.",
    pros: ["Modern facilities", "Furnished", "Close to campus", "Flexible lease lengths"],
    cons: ["Expensive", "Less community feel than I-House"],
    distanceFromCampus: "5–10 min walk",
    priceRange: "$1,800 – $2,600 / month",
    furnished: true,
    popularWithExchange: true,
    url: "https://www.americancampus.com/student-apartments/ca/berkeley/the-berk",
  },
  {
    name: "Identity Logan Park",
    description:
      "Upscale student apartments south of campus with private bedrooms in shared units and full amenities (pool, gym, study rooms).",
    pros: ["High-end amenities", "Private bedrooms", "Furnished", "Individual leases"],
    cons: ["Premium pricing", "10–15 min walk to central campus"],
    distanceFromCampus: "10–15 min walk",
    priceRange: "$1,900 – $2,700 / month",
    furnished: true,
    popularWithExchange: true,
    url: "https://www.identityloganpark.com/",
  },
  {
    name: "Standard Berkeley",
    description:
      "Newer purpose-built student housing with single and shared rooms, in-unit laundry and a rooftop lounge.",
    pros: ["Modern and clean", "Furnished", "Central location", "All-inclusive utilities"],
    cons: ["One of the priciest options", "Limited availability"],
    distanceFromCampus: "5 min walk",
    priceRange: "$2,000 – $2,900 / month",
    furnished: true,
    popularWithExchange: true,
    url: "https://www.thestandard.com/berkeley/",
  },
  {
    name: "Off-campus apartments & sublets",
    description:
      "Private rentals via Craigslist, Facebook groups, Zillow or local agencies. Best for budget-conscious students or longer stays.",
    pros: [
      "Cheaper if you share with roommates",
      "More flexibility on location",
      "Great for full-year students",
    ],
    cons: [
      "Often unfurnished",
      "Risk of scams — never pay before viewing or video tour",
      "Leases can be 12 months",
    ],
    distanceFromCampus: "Varies (Northside, Southside, Downtown)",
    priceRange: "$1,200 – $2,200 / month per person",
    furnished: false,
    popularWithExchange: true,
    url: "https://och.berkeley.edu/",
  },
];

export const OFFCAMPUS_TIPS = {
  commonMistakes: [
    "Sending a deposit before verifying the listing or landlord",
    "Signing a 12-month lease for a one-semester exchange",
    "Forgetting to ask about utilities, internet and furniture",
    "Underestimating the cost of furnishing an empty apartment",
  ],
  averagePrices: [
    "Studio: $1,800 – $2,400 / month",
    "Shared room in a house: $900 – $1,400 / month",
    "Private room in shared apartment: $1,200 – $2,000 / month",
  ],
  bestNeighborhoods: [
    "Northside — quiet, close to campus, popular with grad students",
    "Southside / Telegraph — vibrant, walk to campus, more students",
    "Downtown Berkeley — close to BART, restaurants, slightly cheaper",
    "Elmwood — residential and safe, ~15 min walk",
  ],
};

export type BankOption = {
  name: string;
  advantages: string[];
  disadvantages: string[];
  bestUseCase: string;
  url: string;
};

export const BANKING: BankOption[] = [
  {
    name: "Chase",
    advantages: [
      "Branch near campus",
      "Largest US ATM network",
      "Easy to open with student ID and visa",
    ],
    disadvantages: [
      "Monthly fees unless requirements are met",
      "Foreign wire transfers can be slow",
    ],
    bestUseCase: "Students staying a full year who need a reliable US daily-use account.",
    url: "https://www.chase.com/personal/checking/college-checking",
  },
  {
    name: "Bank of America",
    advantages: ["Branch on Shattuck Ave", "Good mobile app", "Student-friendly checking"],
    disadvantages: ["Monthly fees if balance is low", "Mediocre foreign exchange rates"],
    bestUseCase: "Students wanting a traditional bank with US-wide presence.",
    url: "https://www.bankofamerica.com/deposits/checking/student-banking/",
  },
  {
    name: "Wells Fargo",
    advantages: ["Branches close to campus", "Clear Access Banking with no overdraft fees"],
    disadvantages: ["Reputation issues", "Some accounts have monthly fees"],
    bestUseCase: "Backup option if Chase or BofA appointments are unavailable.",
    url: "https://www.wellsfargo.com/checking/clear-access-banking/",
  },
  {
    name: "Wise",
    advantages: [
      "Real exchange rate with low fees",
      "Multi-currency account with US routing details",
      "Open online before arrival",
    ],
    disadvantages: [
      "Not a real US bank — can't take checks easily",
      "No physical branches",
    ],
    bestUseCase:
      "Most exchange students for one semester — receive USD, pay rent, transfer EUR↔USD cheaply.",
    url: "https://wise.com/",
  },
];

export type PhonePlan = {
  name: string;
  priceRange: string;
  esim: boolean;
  pros: string[];
  cons: string[];
  bestUseCase: string;
  url: string;
};

export const PHONE_PLANS: PhonePlan[] = [
  {
    name: "Airalo",
    priceRange: "$5 – $50 (data only, prepaid)",
    esim: true,
    pros: ["Activate before arrival", "No commitment", "Coverage in 200+ countries"],
    cons: ["Data only — no US phone number", "Smaller data packages can run out fast"],
    bestUseCase: "First few days after arrival to stay connected before activating a local plan.",
    url: "https://www.airalo.com/",
  },
  {
    name: "Holafly",
    priceRange: "$20 – $80 (unlimited data plans)",
    esim: true,
    pros: ["Truly unlimited data", "Easy install", "24/7 support"],
    cons: ["No US phone number", "More expensive than competitors"],
    bestUseCase: "Heavy data users who want to skip US carriers entirely.",
    url: "https://esim.holafly.com/",
  },
  {
    name: "T-Mobile",
    priceRange: "$50 – $90 / month",
    esim: true,
    pros: [
      "Real US phone number",
      "Unlimited data, calls, texts",
      "Free roaming in many countries",
    ],
    cons: ["Requires SSN or passport in store", "Monthly commitment"],
    bestUseCase: "Full-year students who need a US number for banking, Uber, Venmo, deliveries.",
    url: "https://www.t-mobile.com/cell-phone-plans",
  },
  {
    name: "Mint Mobile",
    priceRange: "$15 – $30 / month (prepaid)",
    esim: true,
    pros: ["Cheap prepaid plans", "US number included", "Runs on T-Mobile network"],
    cons: ["Pay 3, 6 or 12 months upfront", "Customer service limited"],
    bestUseCase: "Budget-conscious one-semester students who still need a US number.",
    url: "https://www.mintmobile.com/",
  },
];

export const ARRIVAL_GUIDE = [
  {
    title: "Cal 1 Card",
    description:
      "Your official UC Berkeley photo ID. Required for library access, gym, dining and many campus events.",
    url: "https://services.berkeley.edu/cal-1-card",
    tip: "Upload your photo online before arrival to skip the queue.",
  },
  {
    title: "CalCentral",
    description:
      "The Berkeley student portal — enroll in classes, view your schedule, pay fees and access your academic record.",
    url: "https://calcentral.berkeley.edu/",
    tip: "Set up Duo two-factor authentication the same day you get your CalNet ID.",
  },
  {
    title: "International Student Orientation",
    description:
      "Mandatory orientation run by the Berkeley International Office covering visa status, check-in and academic life.",
    url: "https://internationaloffice.berkeley.edu/students/new",
    tip: "Mandatory immigration check-in must be completed within 30 days of arrival.",
  },
  {
    title: "AC Transit",
    description:
      "Local bus network in the Bay Area. Berkeley students get unlimited rides with the Class Pass on Cal 1 Card.",
    url: "https://www.actransit.org/",
    tip: "The Class Pass is included in your tuition — no extra signup needed.",
  },
  {
    title: "BART",
    description:
      "Bay Area Rapid Transit — fast trains to San Francisco, Oakland and SFO airport. Downtown Berkeley station is 10 min from campus.",
    url: "https://www.bart.gov/",
    tip: "Use a Clipper card (or Apple Wallet) for the easiest tap-to-pay experience.",
  },
  {
    title: "Berkeley International Office (BIO)",
    description:
      "Your primary contact for anything visa- or immigration-related during your stay.",
    url: "https://internationaloffice.berkeley.edu/",
    tip: "Schedule advising appointments early — slots fill fast around deadlines.",
  },
  {
    title: "University Health Services (Tang Center)",
    description:
      "On-campus health center covered by SHIP. Primary care, mental health and urgent care.",
    url: "https://uhs.berkeley.edu/",
    tip: "Save the after-hours nurse line in your phone: +1 (510) 643-7197.",
  },
  {
    title: "Emergency contacts",
    description:
      "UCPD (campus police): +1 (510) 642-3333 · National emergency: 911 · Tang Center after-hours: +1 (510) 643-7197 · Your embassy / consulate.",
    url: "https://police.berkeley.edu/",
    tip: "Save these in your phone before you land.",
  },
];

export const VISA_GUIDE = {
  steps: [
    "Receive your I-20 from Berkeley International Office",
    "Pay the SEVIS I-901 fee (~$350)",
    "Complete the DS-160 online application",
    "Pay the MRV visa application fee (~$185)",
    "Create an AVITS account and schedule your interview",
    "Attend your F-1 visa interview at the US embassy or consulate",
    "Receive your passport with the F-1 visa stamp (1–10 business days)",
    "Enter the US up to 30 days before your program start date",
  ],
  processingTimes: [
    "Interview wait times: 1 day to 12+ weeks depending on country",
    "Visa issuance after interview: 3–10 business days typically",
    "Administrative processing (rare): 4–8 additional weeks",
  ],
  interviewTips: [
    "Dress professionally — business casual minimum",
    "Bring originals AND copies of every document",
    "Be ready to explain why Berkeley, why this program, and your ties to home",
    "Speak clearly and answer only what's asked — no extra information",
    "Show clear intent to return home after your exchange",
  ],
  commonMistakes: [
    "Submitting an incomplete DS-160 (missing previous travel, employment)",
    "Forgetting to pay the SEVIS fee before the interview",
    "Not bringing proof of financial support",
    "Waiting too long to schedule — wait times can be months",
    "Showing dual intent (saying you want to stay in the US after)",
  ],
  ds160: {
    what: "DS-160 is the official Online Nonimmigrant Visa Application required for all US visa applicants.",
    keyPoints: [
      "Completed entirely online at ceac.state.gov/genniv",
      "Requires a US-format photo (2x2 inches, white background)",
      "Save your application ID — you'll need it to resume",
      "Print the confirmation page (with barcode) to bring to your interview",
    ],
    url: "https://ceac.state.gov/genniv/",
  },
  sevis: {
    what: "SEVIS (Student and Exchange Visitor Information System) tracks F-1 and J-1 students. The I-901 fee funds the system.",
    keyPoints: [
      "Fee: ~$350 for F-1 (subject to change)",
      "Must be paid BEFORE the visa interview",
      "Print the receipt — required at the interview and at the US port of entry",
      "Pay at fmjfee.com using your SEVIS ID (on your I-20)",
    ],
    url: "https://www.fmjfee.com/",
  },
  requiredDocuments: [
    "Valid passport (6+ months beyond stay)",
    "Signed I-20 from Berkeley",
    "DS-160 confirmation page (with barcode)",
    "SEVIS I-901 payment receipt",
    "MRV visa fee receipt",
    "Visa interview appointment confirmation",
    "Passport-style photo (US format, 2x2 inches)",
    "Proof of financial support (bank statements, scholarship letters)",
    "Berkeley admission/exchange acceptance letter",
    "Academic transcripts and diplomas",
    "Evidence of ties to home country (optional but useful)",
  ],
};

export type ScholarshipResource = {
  title: string;
  what: string;
  whoFor: string;
  whenToApply: string;
  url: string;
};

export const SCHOLARSHIP_RESOURCES: ScholarshipResource[] = [
  {
    title: "Home university scholarships",
    what: "Mobility grants offered directly by your home institution to outgoing exchange students.",
    whoFor: "All students officially nominated for an exchange by their home university.",
    whenToApply: "Usually 6–9 months before departure — check your international office.",
    url: "#",
  },
  {
    title: "Host university scholarships",
    what: "Need-based or merit-based aid offered by UC Berkeley or program-specific funds.",
    whoFor: "Admitted exchange students, sometimes restricted to certain programs.",
    whenToApply: "At the time of acceptance — deadlines often align with course registration.",
    url: "https://financialaid.berkeley.edu/",
  },
  {
    title: "Government grants",
    what: "Country-level mobility grants (e.g. French CROUS Aide à la mobilité internationale, DAAD for German students).",
    whoFor: "Students meeting residency and academic criteria in their home country.",
    whenToApply: "4–8 months before departure — deadlines are strict.",
    url: "#",
  },
  {
    title: "Erasmus+ / international mobility grants",
    what: "EU-funded grants for students from European institutions, also for non-EU exchanges in some cases.",
    whoFor: "Students enrolled at an Erasmus+ partner institution.",
    whenToApply: "Apply through your home university's Erasmus office, typically 4–6 months in advance.",
    url: "https://erasmus-plus.ec.europa.eu/",
  },
  {
    title: "Private foundations",
    what: "Scholarships from foundations, banks, alumni networks and non-profits (Fulbright, Zellidja, Rotary, etc.).",
    whoFor: "Varies — often merit-based, sometimes restricted by field or origin.",
    whenToApply: "6–12 months in advance — deadlines are often very early.",
    url: "#",
  },
  {
    title: "Emergency funding options",
    what: "Short-term aid in case of unexpected hardship during your exchange.",
    whoFor: "Currently enrolled students facing financial emergencies.",
    whenToApply: "As soon as a need arises — contact your home and host international offices immediately.",
    url: "https://financialaid.berkeley.edu/emergency-funding/",
  },
];

export const SCHOLARSHIP_CHECKLIST = [
  "Check home university exchange scholarships",
  "Check host university funding options",
  "Check government scholarships",
  "Check regional or city-level grants",
  "Check Erasmus+ if applicable",
  "Check private foundations",
  "Check deadlines early",
];

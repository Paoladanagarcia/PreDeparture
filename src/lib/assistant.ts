export type AssistantSource = { title: string; url: string };
export type AssistantReply = { answer: string; sources: AssistantSource[] };
export type AssistantContext = { university?: string };

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

const SOURCES = {
  usVisa: {
    title: "U.S. Department of State - Student Visa",
    url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
  },
  sevis: { title: "SEVIS I-901 Fee Payment", url: "https://www.fmjfee.com/" },
  ds160: { title: "DS-160 Online Visa Application", url: "https://ceac.state.gov/genniv/" },
  embassyFrance: {
    title: "U.S. Embassy in France - Visas",
    url: "https://fr.usembassy.gov/visas/",
  },
  berkeleyInternational: {
    title: "UC Berkeley International Office",
    url: "https://internationaloffice.berkeley.edu/",
  },
  berkeleyHousing: { title: "UC Berkeley Housing", url: "https://housing.berkeley.edu/" },
  berkeleyOffCampus: {
    title: "Berkeley Off-Campus Housing (OCH)",
    url: "https://och.berkeley.edu/",
  },
  berkeleyIHouse: { title: "International House Berkeley", url: "https://ihouse.berkeley.edu/" },
  berkeleyShip: {
    title: "UC Berkeley University Health Services (SHIP)",
    url: "https://uhs.berkeley.edu/ship",
  },
  calCentral: { title: "CalCentral", url: "https://calcentral.berkeley.edu/" },
  cal1Card: { title: "Cal 1 Card", url: "https://services.berkeley.edu/cal-1-card" },
  bart: { title: "BART", url: "https://www.bart.gov/" },
  acTransit: { title: "AC Transit", url: "https://www.actransit.org/" },
  berkeleyFinancialAid: {
    title: "UC Berkeley Financial Aid",
    url: "https://financialaid.berkeley.edu/",
  },
  stanfordBechtel: {
    title: "Stanford Bechtel International Center",
    url: "https://bechtel.stanford.edu/",
  },
  stanfordHousing: {
    title: "Stanford R&DE Student Housing",
    url: "https://rde.stanford.edu/studenthousing",
  },
  stanfordOffCampus: {
    title: "Stanford Off-Campus Housing",
    url: "https://rde.stanford.edu/studenthousing/off-campus-housing",
  },
  stanfordCardinalCare: {
    title: "Stanford Cardinal Care",
    url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
  },
  stanfordAxess: { title: "Stanford Axess", url: "https://axess.stanford.edu/" },
  stanfordId: { title: "Stanford ID Card", url: "https://uit.stanford.edu/service/campuscard" },
  stanfordMarguerite: {
    title: "Stanford Marguerite Shuttle",
    url: "https://transportation.stanford.edu/marguerite",
  },
  stanfordFinancialAid: {
    title: "Stanford Financial Aid",
    url: "https://financialaid.stanford.edu/",
  },
  erasmus: { title: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/" },
  wise: { title: "Wise", url: "https://wise.com/" },
  airalo: { title: "Airalo", url: "https://www.airalo.com/" },
} satisfies Record<string, AssistantSource>;

type SourceKey = keyof typeof SOURCES;

type LocalAnswer = {
  keywords: string[];
  answer: string | ((context: AssistantContext) => string);
  sourceKeys: SourceKey[] | ((context: AssistantContext) => SourceKey[]);
};

const LOCAL_ANSWERS: LocalAnswer[] = [
  {
    keywords: [
      "visa",
      "f-1",
      "f1",
      "interview",
      "embassy",
      "consulate",
      "appointment",
      "rendez-vous",
    ],
    answer:
      "For the F-1 visa, work backwards from your departure date. The usual flow is: receive your I-20, pay the SEVIS I-901 fee, complete the DS-160, pay the visa/MRV fee if required by your embassy flow, schedule the interview, then prepare your documents. Bring your passport, signed I-20, DS-160 confirmation, SEVIS receipt, photo if required, admission proof and financial proof. Embassy rules and wait times vary, so verify the final checklist on the official U.S. visa and embassy websites.",
    sourceKeys: ["usVisa", "sevis", "ds160", "embassyFrance"],
  },
  {
    keywords: ["ds-160", "ds160", "form", "application"],
    answer:
      "The DS-160 is the online nonimmigrant visa application. Complete it carefully, save your application ID, and print or download the confirmation page. You will normally need that confirmation for the visa appointment flow. Use only the official CEAC website and make sure your information matches your passport and I-20.",
    sourceKeys: ["ds160", "usVisa"],
  },
  {
    keywords: ["sevis", "i-901", "i901"],
    answer:
      "The SEVIS I-901 fee is usually required before the F-1 visa interview. Pay it on the official SEVIS fee website, keep the receipt, and bring proof of payment to your interview. Do not use unofficial payment pages.",
    sourceKeys: ["sevis", "usVisa"],
  },
  {
    keywords: ["i-20", "i20", "admission", "berkeley international", "bio", "bechtel"],
    answer:
      "Your I-20 is one of the key documents for the F-1 process. Check your host university's international office guidance, verify your personal details, sign the I-20 where required, and keep both digital and printed copies. If anything is wrong on the document, contact the international office before booking or attending the visa interview.",
    sourceKeys: (context) =>
      isStanford(context) ? ["stanfordBechtel", "usVisa"] : ["berkeleyInternational", "usVisa"],
  },
  {
    keywords: [
      "housing",
      "apartment",
      "rent",
      "lease",
      "sublet",
      "ihouse",
      "stanford",
      "off-campus",
      "roommate",
    ],
    answer: (context) =>
      isStanford(context)
        ? "For Stanford housing, start with Stanford R&DE Student Housing and confirm whether your exchange program is eligible for campus housing. Also review Stanford off-campus housing resources if you may need a private rental. For private rentals or sublets, watch for scams: avoid deposits before verification, ask about lease length, utilities, furniture, move-in dates and whether a video tour or official lease is available."
        : "For Berkeley housing, start early. Compare UC Berkeley Housing, International House and Berkeley Off-Campus Housing. For private rentals or sublets, watch for scams: avoid deposits before verification, ask about lease length, utilities, furniture, move-in dates and whether a video tour or official lease is available. One-semester students should be careful with 12-month leases.",
    sourceKeys: (context) =>
      isStanford(context)
        ? ["stanfordHousing", "stanfordOffCampus"]
        : ["berkeleyHousing", "berkeleyOffCampus", "berkeleyIHouse"],
  },
  {
    keywords: [
      "ship",
      "cardinal care",
      "insurance",
      "health",
      "waiver",
      "medical",
      "doctor",
      "healthcare",
    ],
    answer: (context) =>
      isStanford(context)
        ? "US healthcare can be expensive, so treat insurance as a priority. Stanford students should review Cardinal Care and waiver rules through Stanford's official insurance pages. If you want to waive university insurance, check the criteria carefully because many international plans do not qualify. Keep proof of insurance accessible after arrival."
        : "US healthcare can be expensive, so treat insurance as a priority. Berkeley students should review SHIP requirements directly with University Health Services. If you want to waive SHIP, check the waiver criteria carefully because many international plans do not qualify. Keep proof of insurance accessible after arrival.",
    sourceKeys: (context) => (isStanford(context) ? ["stanfordCardinalCare"] : ["berkeleyShip"]),
  },
  {
    keywords: ["bank", "banking", "card", "wise", "chase", "money", "payment", "transfer", "cash"],
    answer:
      "Before departure, check your current bank's international fees, card limits and fraud rules. For the US, many students use a mix of a multi-currency service like Wise and, for longer stays, a US bank account. Keep at least one backup card and avoid relying on a single payment method for rent, deposits or arrival expenses.",
    sourceKeys: ["wise"],
  },
  {
    keywords: ["phone", "sim", "esim", "data", "roaming", "mobile"],
    answer:
      "For the first days, an eSIM or roaming option can help you stay connected immediately after landing. For longer stays, compare US prepaid plans once you know your needs. Make sure your phone is unlocked before departure and keep offline copies of your housing address, campus info and travel route.",
    sourceKeys: ["airalo"],
  },
  {
    keywords: [
      "arrival",
      "airport",
      "sfo",
      "oak",
      "transport",
      "bart",
      "bus",
      "uber",
      "orientation",
    ],
    answer:
      "Plan your arrival route before flying. From Bay Area airports, check BART and AC Transit routes, schedules and fares close to your travel date. Save your housing address offline, plan a backup ride option, and aim to arrive before orientation if possible so you have time for housing, phone, banking and campus setup.",
    sourceKeys: (context) =>
      isStanford(context)
        ? ["stanfordMarguerite", "bart", "stanfordBechtel"]
        : ["bart", "acTransit", "berkeleyInternational"],
  },
  {
    keywords: [
      "calcentral",
      "axess",
      "student card",
      "student id",
      "cal 1",
      "cal1",
      "stanford id",
      "course",
      "enrollment",
    ],
    answer: (context) =>
      isStanford(context)
        ? "After arrival, Axess and your Stanford ID Card become important for campus admin and daily life. Use Axess for university tasks and check the official Stanford ID Card guidance for ID-related steps. Keep an eye on Bechtel International Center messages too."
        : "After arrival, CalCentral and your Cal 1 Card become important for campus admin and daily life. Use CalCentral for university tasks and check the official Cal 1 Card guidance for ID-related steps. Keep an eye on Berkeley International Office messages too.",
    sourceKeys: (context) =>
      isStanford(context)
        ? ["stanfordAxess", "stanfordId", "stanfordBechtel"]
        : ["calCentral", "cal1Card", "berkeleyInternational"],
  },
  {
    keywords: ["scholarship", "funding", "financial", "aid", "erasmus", "grant", "budget"],
    answer:
      "For funding, check both your host university resources and your home-university or exchange-program options. Confirm eligibility, deadlines, documents and payment timing. Build a budget that includes housing deposits, insurance, visa fees, flights, local transport, phone, food and emergency money.",
    sourceKeys: (context) =>
      isStanford(context)
        ? ["stanfordFinancialAid", "erasmus"]
        : ["berkeleyFinancialAid", "erasmus"],
  },
  {
    keywords: ["checklist", "deadline", "timeline", "when", "priority", "prepare", "documents"],
    answer:
      "A safe preparation order is: visa documents first, housing search early, insurance check, flights, banking/card setup, phone plan, then arrival logistics. Keep copies of passport, I-20, DS-160 confirmation, SEVIS receipt, admission letter, insurance proof and housing details. Always verify deadlines on official sources because they can change.",
    sourceKeys: (context) =>
      isStanford(context)
        ? ["usVisa", "sevis", "ds160", "stanfordBechtel"]
        : ["usVisa", "sevis", "ds160", "berkeleyInternational"],
  },
];

export async function askAssistant(
  messages: AssistantMessage[],
  context: AssistantContext = {},
): Promise<AssistantReply> {
  const endpoint = import.meta.env.VITE_AI_ASSISTANT_ENDPOINT;

  if (!endpoint) {
    return getLocalAssistantReply(messages, context);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, context }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    if (response.status === 429) {
      throw new Error("Rate limit reached. Please try again in a moment.");
    }
    throw new Error(`Assistant error (${response.status}): ${text.slice(0, 200)}`);
  }

  return response.json() as Promise<AssistantReply>;
}

function getLocalAssistantReply(
  messages: AssistantMessage[],
  context: AssistantContext,
): AssistantReply {
  const question = messages
    .filter((message) => message.role === "user")
    .at(-1)
    ?.content.toLowerCase();

  if (!question) {
    return {
      answer:
        "Ask me about visa, SEVIS, DS-160, I-20, housing, university health insurance, banking, phone plans, transport, scholarships, student portals or arrival logistics. I will give you practical next steps and point you to official sources.",
      sources: getDefaultUniversitySources(context),
    };
  }

  const localAnswer = LOCAL_ANSWERS.find((entry) => matches(question, entry.keywords));

  if (localAnswer) {
    const answer =
      typeof localAnswer.answer === "function" ? localAnswer.answer(context) : localAnswer.answer;
    const sourceKeys =
      typeof localAnswer.sourceKeys === "function"
        ? localAnswer.sourceKeys(context)
        : localAnswer.sourceKeys;

    return {
      answer,
      sources: sourceKeys.map((key) => SOURCES[key]),
    };
  }

  return {
    answer:
      "I can help with the main exchange-preparation topics: F-1 visa, SEVIS, DS-160, I-20, housing, university health insurance, banking, phone setup, arrival logistics, student portals and scholarships. For this specific question, verify the exact requirement on the official university, embassy or government website because fees, deadlines and rules can change.",
    sources: [...getDefaultUniversitySources(context), SOURCES.usVisa],
  };
}

function matches(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

function isStanford(context: AssistantContext) {
  return context.university === "Stanford University";
}

function getDefaultUniversitySources(context: AssistantContext) {
  return isStanford(context)
    ? [SOURCES.stanfordBechtel, SOURCES.stanfordHousing]
    : [SOURCES.berkeleyInternational, SOURCES.berkeleyHousing];
}

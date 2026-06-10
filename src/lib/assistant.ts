export type AssistantSource = { title: string; url: string };
export type AssistantReply = { answer: string; sources: AssistantSource[] };

type AssistantMessage = {
  role: "user" | "assistant";
  content: string;
};

const SOURCES = [
  {
    title: "U.S. Department of State - Student Visa",
    url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
  },
  { title: "SEVIS I-901 Fee Payment", url: "https://www.fmjfee.com/" },
  { title: "DS-160 Online Visa Application", url: "https://ceac.state.gov/genniv/" },
  { title: "U.S. Embassy in France - Visas", url: "https://fr.usembassy.gov/visas/" },
  { title: "UC Berkeley International Office", url: "https://internationaloffice.berkeley.edu/" },
  { title: "UC Berkeley Housing", url: "https://housing.berkeley.edu/" },
  { title: "Berkeley Off-Campus Housing (OCH)", url: "https://och.berkeley.edu/" },
  { title: "International House Berkeley", url: "https://ihouse.berkeley.edu/" },
  { title: "UC Berkeley University Health Services (SHIP)", url: "https://uhs.berkeley.edu/ship" },
  { title: "CalCentral", url: "https://calcentral.berkeley.edu/" },
  { title: "Cal 1 Card", url: "https://services.berkeley.edu/cal-1-card" },
  { title: "BART", url: "https://www.bart.gov/" },
  { title: "AC Transit", url: "https://www.actransit.org/" },
  { title: "UC Berkeley Financial Aid", url: "https://financialaid.berkeley.edu/" },
  { title: "Erasmus+", url: "https://erasmus-plus.ec.europa.eu/" },
] satisfies AssistantSource[];

type LocalAnswer = {
  keywords: string[];
  answer: string;
  sourceIndexes: number[];
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
    sourceIndexes: [0, 1, 2, 3],
  },
  {
    keywords: ["ds-160", "ds160", "form", "application"],
    answer:
      "The DS-160 is the online nonimmigrant visa application. Complete it carefully, save your application ID, and print or download the confirmation page. You will normally need that confirmation for the visa appointment flow. Use only the official CEAC website and make sure your information matches your passport and I-20.",
    sourceIndexes: [2, 0],
  },
  {
    keywords: ["sevis", "i-901", "i901"],
    answer:
      "The SEVIS I-901 fee is usually required before the F-1 visa interview. Pay it on the official SEVIS fee website, keep the receipt, and bring proof of payment to your interview. Do not use unofficial payment pages.",
    sourceIndexes: [1, 0],
  },
  {
    keywords: ["i-20", "i20", "admission", "berkeley international", "bio"],
    answer:
      "Your I-20 is one of the key documents for the F-1 process. Check the Berkeley International Office guidance, verify your personal details, sign the I-20 where required, and keep both digital and printed copies. If anything is wrong on the document, contact the international office before booking or attending the visa interview.",
    sourceIndexes: [4, 0],
  },
  {
    keywords: [
      "housing",
      "apartment",
      "rent",
      "lease",
      "sublet",
      "ihouse",
      "off-campus",
      "roommate",
    ],
    answer:
      "For Berkeley housing, start early. Compare UC Berkeley Housing, International House and Berkeley Off-Campus Housing. For private rentals or sublets, watch for scams: avoid deposits before verification, ask about lease length, utilities, furniture, move-in dates and whether a video tour or official lease is available. One-semester students should be careful with 12-month leases.",
    sourceIndexes: [5, 6, 7],
  },
  {
    keywords: ["ship", "insurance", "health", "waiver", "medical", "doctor", "healthcare"],
    answer:
      "US healthcare can be expensive, so treat insurance as a priority. Review UC Berkeley SHIP requirements directly with University Health Services. If you want to waive SHIP, check the waiver criteria carefully because many international plans do not qualify. Keep proof of insurance accessible after arrival.",
    sourceIndexes: [8],
  },
  {
    keywords: ["bank", "banking", "card", "wise", "chase", "money", "payment", "transfer", "cash"],
    answer:
      "Before departure, check your current bank's international fees, card limits and fraud rules. For the US, many students use a mix of a multi-currency service like Wise and, for longer stays, a US bank account. Keep at least one backup card and avoid relying on a single payment method for rent, deposits or arrival expenses.",
    sourceIndexes: [4],
  },
  {
    keywords: ["phone", "sim", "esim", "data", "roaming", "mobile"],
    answer:
      "For the first days, an eSIM or roaming option can help you stay connected immediately after landing. For longer stays, compare US prepaid plans once you know your needs. Make sure your phone is unlocked before departure and keep offline copies of your housing address, campus info and travel route.",
    sourceIndexes: [4],
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
    sourceIndexes: [11, 12, 4],
  },
  {
    keywords: ["calcentral", "student card", "student id", "cal 1", "cal1", "course", "enrollment"],
    answer:
      "After arrival, CalCentral and your Cal 1 Card become important for campus admin and daily student life. Use CalCentral for university tasks and check the official Cal 1 Card guidance for ID-related steps. Keep an eye on Berkeley International Office messages too.",
    sourceIndexes: [9, 10, 4],
  },
  {
    keywords: ["scholarship", "funding", "financial", "aid", "erasmus", "grant", "budget"],
    answer:
      "For funding, check both Berkeley resources and your home-university or exchange-program options. Confirm eligibility, deadlines, documents and payment timing. Build a budget that includes housing deposits, insurance, visa fees, flights, local transport, phone, food and emergency money.",
    sourceIndexes: [13, 14],
  },
  {
    keywords: ["checklist", "deadline", "timeline", "when", "priority", "prepare", "documents"],
    answer:
      "A safe preparation order is: visa documents first, housing search early, insurance check, flights, banking/card setup, phone plan, then arrival logistics. Keep copies of passport, I-20, DS-160 confirmation, SEVIS receipt, admission letter, insurance proof and housing details. Always verify deadlines on official sources because they can change.",
    sourceIndexes: [0, 1, 2, 4],
  },
];

export async function askAssistant(messages: AssistantMessage[]): Promise<AssistantReply> {
  const endpoint = import.meta.env.VITE_AI_ASSISTANT_ENDPOINT;

  if (!endpoint) {
    return getLocalAssistantReply(messages);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages }),
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

function getLocalAssistantReply(messages: AssistantMessage[]): AssistantReply {
  const question = messages
    .filter((message) => message.role === "user")
    .at(-1)
    ?.content.toLowerCase();

  if (!question) {
    return {
      answer:
        "Ask me about visa, SEVIS, DS-160, I-20, Berkeley housing, SHIP insurance, banking, phone plans, transport, scholarships, CalCentral or arrival logistics. I will give you practical next steps and point you to official sources.",
      sources: [SOURCES[4]],
    };
  }

  const localAnswer = LOCAL_ANSWERS.find((entry) => matches(question, entry.keywords));

  if (localAnswer) {
    return {
      answer: localAnswer.answer,
      sources: localAnswer.sourceIndexes.map((index) => SOURCES[index]),
    };
  }

  return {
    answer:
      "I can help with the main exchange-preparation topics: F-1 visa, SEVIS, DS-160, I-20, housing, SHIP insurance, banking, phone setup, arrival logistics, CalCentral and scholarships. For this specific question, verify the exact requirement on the official university, embassy or government website because fees, deadlines and rules can change.",
    sources: [SOURCES[4], SOURCES[0], SOURCES[8]],
  };
}

function matches(value: string, keywords: string[]) {
  return keywords.some((keyword) => value.includes(keyword));
}

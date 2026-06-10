export type ProfileQuestionnaire = {
  country: string;
  university: string;
  nationality: string;
  startDate: string; // ISO
  duration: "one-semester" | "two-semesters" | "full-year" | "other";
};

export type TaskCategory =
  | "visa"
  | "housing"
  | "insurance"
  | "banking"
  | "phone"
  | "travel"
  | "university"
  | "scholarship";

export type Priority = "high" | "medium" | "low";

export type RequiredDocument = { id: string; label: string };

export type Task = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  phase: "before" | "after";
  /** Recommended (ideal) days before arrival. Positive = before, negative = after. */
  recommendedDaysBefore: number;
  /** Latest safe completion — flexible deadline still leaving a safety margin. */
  latestDaysBefore: number;
  priority: Priority;
  /** Human-readable estimated effort, e.g. "30-45 minutes". */
  effort?: string;
  /** Official source / authority for this task. */
  source?: string;
  /** Optional contextual warning. */
  warning?: string;
  /** Optional checklist of required documents. */
  requiredDocuments?: RequiredDocument[];
  /** Optional link to an official resource */
  link?: { label: string; url: string };
};

export const TASKS: Task[] = [
  // ---------------- Before departure ----------------
  {
    id: "sevis",
    title: "Pay the SEVIS I-901 fee",
    description: "Mandatory fee for all F-1 students before the visa interview.",
    category: "visa",
    phase: "before",
    recommendedDaysBefore: 90,
    latestDaysBefore: 75,
    priority: "high",
    effort: "10 minutes",
    source: "U.S. Department of Homeland Security",
    link: { label: "SEVIS payment", url: "https://www.fmjfee.com/" },
  },
  {
    id: "avits",
    title: "Create an AVITS account",
    description: "Account used to schedule your visa appointment at the US embassy.",
    category: "visa",
    phase: "before",
    recommendedDaysBefore: 90,
    latestDaysBefore: 80,
    priority: "high",
    effort: "15 minutes",
    source: "U.S. Department of State",
  },
  {
    id: "ds-160",
    title: "Complete the DS-160 form",
    description: "Online nonimmigrant visa application required for the F-1 student visa.",
    category: "visa",
    phase: "before",
    recommendedDaysBefore: 85,
    latestDaysBefore: 70,
    priority: "high",
    effort: "30-45 minutes",
    source: "U.S. Department of State",
    link: { label: "DS-160 (ceac.state.gov)", url: "https://ceac.state.gov/genniv/" },
  },
  {
    id: "visa-fee",
    title: "Pay the visa interview fee (MRV)",
    description: "Required before scheduling your interview at the US embassy or consulate.",
    category: "visa",
    phase: "before",
    recommendedDaysBefore: 85,
    latestDaysBefore: 70,
    priority: "high",
    effort: "15 minutes",
    source: "U.S. Department of State",
  },
  {
    id: "visa-schedule",
    title: "Schedule the visa interview",
    description: "Book the earliest available slot — wait times can be several weeks.",
    category: "visa",
    phase: "before",
    recommendedDaysBefore: 80,
    latestDaysBefore: 60,
    priority: "high",
    effort: "20 minutes",
    source: "U.S. Department of State",
    warning: "Visa interview wait times can vary significantly by country.",
  },
  {
    id: "visa-docs",
    title: "Prepare documents for the visa interview",
    description: "Gather everything you'll need to bring to your embassy appointment.",
    category: "visa",
    phase: "before",
    recommendedDaysBefore: 70,
    latestDaysBefore: 50,
    priority: "high",
    effort: "1 hour",
    source: "U.S. Department of State",
    requiredDocuments: [
      { id: "passport", label: "Passport (valid 6+ months)" },
      { id: "i20", label: "I-20 form (signed)" },
      { id: "ds160", label: "DS-160 confirmation page" },
      { id: "sevis-receipt", label: "SEVIS payment receipt" },
      { id: "photo", label: "Visa photo (US format)" },
      { id: "financial", label: "Proof of financial support" },
      { id: "admission", label: "University admission letter" },
    ],
  },
  {
    id: "housing-search",
    title: "Start housing search",
    description: "University housing, sublet, or private rental. Begin exploring options.",
    category: "housing",
    phase: "before",
    recommendedDaysBefore: 75,
    latestDaysBefore: 60,
    priority: "high",
    effort: "5-20 hours",
    source: "UC Berkeley Housing",
    warning: "Berkeley housing is highly competitive. Start searching early.",
    link: { label: "Berkeley Housing", url: "https://housing.berkeley.edu/" },
  },
  {
    id: "housing-secure",
    title: "Secure housing",
    description: "Sign the lease or confirm your university housing assignment.",
    category: "housing",
    phase: "before",
    recommendedDaysBefore: 45,
    latestDaysBefore: 25,
    priority: "high",
    effort: "1-3 hours",
    source: "UC Berkeley Housing",
    warning: "Never send a deposit before verifying the listing — scams are common.",
  },
  {
    id: "insurance",
    title: "Buy health insurance",
    description: "US healthcare is expensive. Check if SHIP (Berkeley) is required or if you can waive.",
    category: "insurance",
    phase: "before",
    recommendedDaysBefore: 30,
    latestDaysBefore: 14,
    priority: "medium",
    effort: "1-2 hours",
    source: "UC Berkeley University Health Services",
    warning: "Health insurance requirements differ by university — verify the waiver criteria.",
    link: { label: "UC SHIP", url: "https://uhs.berkeley.edu/ship" },
  },
  {
    id: "flights",
    title: "Book flights",
    description: "Aim to arrive a few days before orientation to settle in.",
    category: "travel",
    phase: "before",
    recommendedDaysBefore: 30,
    latestDaysBefore: 14,
    priority: "medium",
    effort: "1-2 hours",
  },
  {
    id: "bank",
    title: "Check bank payments and international card settings",
    description: "Verify foreign transaction fees, raise card limits, notify your bank of travel.",
    category: "banking",
    phase: "before",
    recommendedDaysBefore: 20,
    latestDaysBefore: 7,
    priority: "medium",
    effort: "30 minutes",
  },
  {
    id: "phone",
    title: "Set up an eSIM or phone plan for the US",
    description: "Order an eSIM (Airalo, Holafly) or activate international roaming.",
    category: "phone",
    phase: "before",
    recommendedDaysBefore: 10,
    latestDaysBefore: 3,
    priority: "low",
    effort: "30 minutes",
  },

  // ---------------- After arrival ----------------
  {
    id: "student-card",
    title: "Obtain your student card (Cal 1 Card)",
    description: "Your official Berkeley ID — needed for library, gym, transit and meals.",
    category: "university",
    phase: "after",
    recommendedDaysBefore: -7,
    latestDaysBefore: -14,
    priority: "medium",
    effort: "1 hour",
    source: "UC Berkeley",
  },
  {
    id: "register-classes",
    title: "Register for classes",
    description: "Use CalCentral to enroll. Watch for enrollment appointment windows.",
    category: "university",
    phase: "after",
    recommendedDaysBefore: -10,
    latestDaysBefore: -21,
    priority: "high",
    effort: "1-3 hours",
    source: "UC Berkeley — CalCentral",
  },
  {
    id: "open-bank",
    title: "Open a US bank account (if needed)",
    description: "Chase, Bank of America, and Wells Fargo have branches near campus.",
    category: "banking",
    phase: "after",
    recommendedDaysBefore: -14,
    latestDaysBefore: -30,
    priority: "low",
    effort: "1-2 hours",
  },
  {
    id: "activate-sim",
    title: "Activate phone plan or eSIM",
    description: "Confirm data, calls, and SMS work for verification codes.",
    category: "phone",
    phase: "after",
    recommendedDaysBefore: -2,
    latestDaysBefore: -7,
    priority: "low",
    effort: "30 minutes",
  },
  {
    id: "transport",
    title: "Understand local transport options",
    description: "AC Transit, BART, and the Bear Transit shuttle are all useful in Berkeley.",
    category: "travel",
    phase: "after",
    recommendedDaysBefore: -5,
    latestDaysBefore: -14,
    priority: "low",
    effort: "1 hour",
  },
  {
    id: "emergency",
    title: "Save emergency contacts",
    description: "UCPD (510-642-3333), embassy, insurance hotline, a local friend.",
    category: "university",
    phase: "after",
    recommendedDaysBefore: -3,
    latestDaysBefore: -10,
    priority: "medium",
    effort: "15 minutes",
  },
  {
    id: "arrival-reqs",
    title: "Check university arrival requirements",
    description: "Mandatory check-in with Berkeley International Office, immunizations, orientation.",
    category: "university",
    phase: "after",
    recommendedDaysBefore: -7,
    latestDaysBefore: -14,
    priority: "high",
    effort: "1-2 hours",
    source: "Berkeley International Office",
    link: { label: "Berkeley International Office", url: "https://internationaloffice.berkeley.edu/" },
  },

  // ---------------- Scholarships ----------------

  {
    id: "scholarships-research",
    title: "Check available scholarships and funding options",
    description: "Identify home university, host university, government and private funding you may be eligible for.",
    category: "scholarship",
    phase: "before",
    recommendedDaysBefore: 180,
    latestDaysBefore: 120,
    priority: "medium",
    effort: "2-4 hours",
    warning: "Scholarship deadlines are often earlier than visa or housing deadlines. Check funding options as soon as possible.",
  },
  {
    id: "scholarships-prepare",
    title: "Prepare scholarship application documents",
    description: "Gather transcripts, motivation letter, budget, recommendation letters and any program-specific forms.",
    category: "scholarship",
    phase: "before",
    recommendedDaysBefore: 150,
    latestDaysBefore: 100,
    priority: "medium",
    effort: "2-4 hours",
  },
  {
    id: "scholarships-submit",
    title: "Submit scholarship applications before deadlines",
    description: "Submit each application well ahead of its deadline — many close 4–9 months before departure.",
    category: "scholarship",
    phase: "before",
    recommendedDaysBefore: 130,
    latestDaysBefore: 90,
    priority: "medium",
    effort: "2-4 hours",
    warning: "Scholarship deadlines are often earlier than visa or housing deadlines. Check funding options as soon as possible.",
  },
];

export const CATEGORY_META: Record<TaskCategory, { label: string; emoji: string }> = {
  visa: { label: "Visa", emoji: "🛂" },
  housing: { label: "Housing", emoji: "🏠" },
  insurance: { label: "Insurance", emoji: "🩺" },
  banking: { label: "Banking", emoji: "💳" },
  phone: { label: "Phone plan", emoji: "📱" },
  travel: { label: "Travel", emoji: "✈️" },
  university: { label: "University", emoji: "🎓" },
  scholarship: { label: "Scholarship", emoji: "💰" },
};

export const PRIORITY_META: Record<Priority, { label: string; emoji: string; className: string }> = {
  high: {
    label: "High Priority",
    emoji: "🔴",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  medium: {
    label: "Medium Priority",
    emoji: "🟡",
    className: "bg-warning/10 text-warning-foreground border-warning/30",
  },
  low: {
    label: "Low Priority",
    emoji: "🟢",
    className: "bg-success/10 text-success border-success/30",
  },
};

export function dateMinusDays(arrival: Date, days: number): Date {
  const d = new Date(arrival);
  d.setDate(d.getDate() - days);
  return d;
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

import type { UniversityResourceConfig } from "@/lib/universities";

export type ResourceGuideTopic =
  | "visa"
  | "housing"
  | "banking"
  | "phone"
  | "arrival"
  | "scholarships"
  | "insurance";

export type ResourceGuide = {
  topic: ResourceGuideTopic;
  icon: "file" | "home" | "card" | "phone" | "plane" | "money" | "shield";
  title: string;
  desc: string;
};

export function getResourceGuides(university: UniversityResourceConfig): ResourceGuide[] {
  return [
    {
      topic: "visa",
      icon: "file",
      title: "F-1 Visa",
      desc: "DS-160, SEVIS, interview documents and common mistakes.",
    },
    {
      topic: "housing",
      icon: "home",
      title: `${university.shortName} Housing`,
      desc: university.housing.desc,
    },
    {
      topic: "banking",
      icon: "card",
      title: "Banking",
      desc: "Wise, US banks, cards, transfers and payment setup.",
    },
    {
      topic: "phone",
      icon: "phone",
      title: "Phone Plans",
      desc: "eSIMs, US numbers, prepaid plans and first-day connectivity.",
    },
    {
      topic: "arrival",
      icon: "plane",
      title: "Arrival Guide",
      desc: university.arrival.desc,
    },
    {
      topic: "scholarships",
      icon: "money",
      title: "Scholarships",
      desc: "Funding options, deadlines and budget checklist.",
    },
    {
      topic: "insurance",
      icon: "shield",
      title: "Health Insurance",
      desc: "University insurance, waiver criteria and health coverage reminders.",
    },
  ];
}

export type AssistantLink = { title: string; url: string; external?: boolean };

// Curated destinations, checked 2026-09-29. These are navigation aids, not retrieved evidence.
export function assistantLinks(
  question: string,
  answer: string,
  university: string | undefined,
  fr: boolean,
): AssistantLink[] {
  const q = question.toLowerCase();
  if (/^(bonjour|salut|hello|hi|hey)[!.?\s]*$/i.test(q)) return [];
  const text = `${q} ${answer}`.toLowerCase();
  const links: AssistantLink[] = [];
  if (/profil|my profile/.test(q))
    return [{ title: fr ? "Modifier mon profil" : "Edit my profile", url: "/profile" }];
  if (/visa|sevis|ds-160|f-1|j-1|i-20|ds-2019/.test(text)) {
    links.push({
      title: fr ? "Visas étudiants — Département d’État" : "Student visas — Department of State",
      url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
      external: true,
    });
    if (/berkeley/i.test(university || ""))
      links.push({
        title: fr
          ? "F-1 ou J-1 — Berkeley International Office"
          : "F-1 or J-1 — Berkeley International Office",
        url: "https://internationaloffice.berkeley.edu/node/54",
        external: true,
      });
    links.push({
      title: fr ? "Ouvrir le guide visa" : "Open the visa guide",
      url: `/resources/visa${university ? `?university=${encodeURIComponent(university)}` : ""}`,
    });
  } else if (/logement|housing|insurance|assurance|bank|banqu|bourse|scholarship/.test(text)) {
    const topic = /logement|housing/.test(text)
      ? "housing"
      : /insurance|assurance/.test(text)
        ? "insurance"
        : /bourse|scholarship/.test(text)
          ? "scholarships"
          : "banking";
    links.push({
      title: fr ? "Ouvrir le guide" : "Open the guide",
      url: `/resources/${topic}${university ? `?university=${encodeURIComponent(university)}` : ""}`,
    });
  }
  if (/dates?|planning|calendrier|prochain|next|étapes|etapes|tasks|schedule/.test(q))
    links.push({ title: fr ? "Voir mon planning" : "View my planning", url: "/dashboard" });
  return links;
}

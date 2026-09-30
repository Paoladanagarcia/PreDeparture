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

// Only these curated destinations become clickable. Model-provided URLs stay text.
export function inlineAssistantLinks(text: string, university?: string) {
  const terms =
    /\b(DS[-‑– ]160|SEVIS(?: I[-‑– ]901)?|I[-‑– ]901|Berkeley International Office|Département d[’']État(?: des États-Unis)?|Department of State|ambassade|consulat|embassy|consulate|profil(?:e)?|planning|tableau de bord|dashboard)\b/gi;
  const parts: { text: string; url?: string; external?: boolean }[] = [];
  let last = 0;
  for (const match of text.matchAll(terms)) {
    const word = match[0];
    const token = word.toLowerCase();
    let url: string | undefined;
    if (/^ds/.test(token)) url = "https://ceac.state.gov/GenNIV/Default.aspx";
    else if (/sevis|^i[-‑– ]901/.test(token)) url = "https://www.ice.gov/sevis/i901";
    else if (/^berkeley/.test(token) && /berkeley/i.test(university || ""))
      url = "https://internationaloffice.berkeley.edu/node/54";
    else if (/département|department/.test(token))
      url = "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html";
    else if (/ambassade|consulat|embassy/.test(token)) url = "https://www.usembassy.gov/";
    else if (/^profil/.test(token)) url = "/profile";
    else if (/planning|tableau|dashboard/.test(token)) url = "/dashboard";
    if (!url) continue;
    parts.push(
      { text: text.slice(last, match.index) },
      { text: word, url, external: url.startsWith("https:") },
    );
    last = match.index! + word.length;
  }
  parts.push({ text: text.slice(last) });
  return parts;
}

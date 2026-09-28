import type { Task } from "./tasks";
import type { Language } from "./i18n";

const FRENCH_TASK_TEXT: Record<
  string,
  {
    title: string;
    description: string;
    warning?: string;
    docs?: Record<string, string>;
  }
> = {
  sevis: {
    title: "Payer les frais SEVIS I-901",
    description: "Frais obligatoires pour tous les étudiants F-1 avant l'entretien visa.",
  },
  avits: {
    title: "Créer un compte AVITS",
    description: "Compte utilisé pour planifier votre rendez-vous visa à l'ambassade américaine.",
  },
  "ds-160": {
    title: "Compléter le formulaire DS-160",
    description: "Demande de visa non-immigrant en ligne requise pour le visa étudiant F-1.",
  },
  "visa-fee": {
    title: "Payer les frais de demande de visa (MRV)",
    description: "Paiement requis avant de planifier l'entretien à l'ambassade ou au consulat.",
  },
  "visa-schedule": {
    title: "Planifier l'entretien visa",
    description:
      "Réservez le premier créneau disponible : l'attente peut durer plusieurs semaines.",
    warning: "Les délais d'entretien visa peuvent varier fortement selon le pays.",
  },
  "visa-docs": {
    title: "Préparer les documents pour l'entretien visa",
    description: "Rassemblez tout ce qu'il faudra apporter au rendez-vous à l'ambassade.",
    docs: {
      passport: "Passeport valide au moins 6 mois",
      i20: "Formulaire I-20 signé",
      ds160: "Page de confirmation DS-160",
      "sevis-receipt": "Reçu de paiement SEVIS",
      photo: "Photo visa au format américain",
      financial: "Preuve de ressources financières",
      admission: "Lettre d'admission de l'université",
    },
  },
  "housing-search": {
    title: "Commencer la recherche de logement",
    description:
      "Logement universitaire, sous-location ou location privée. Explorez tôt les options.",
    warning: "Le logement près du campus est compétitif. Commencez les recherches tôt.",
  },
  "housing-secure": {
    title: "Sécuriser un logement",
    description: "Signez le bail ou confirmez votre attribution de logement universitaire.",
    warning: "N'envoyez jamais de dépôt avant d'avoir vérifié l'annonce : les arnaques existent.",
  },
  insurance: {
    title: "Vérifier l'assurance santé",
    description:
      "Les soins aux États-Unis coûtent cher. Vérifiez si l'assurance universitaire est obligatoire ou si une dispense est possible.",
    warning: "Les règles d'assurance varient selon l'université. Vérifiez les critères officiels.",
  },
  flights: {
    title: "Réserver les vols",
    description: "Essayez d'arriver quelques jours avant l'orientation pour vous installer.",
  },
  bank: {
    title: "Vérifier les paiements bancaires et cartes internationales",
    description:
      "Vérifiez les frais à l'étranger, augmentez les plafonds et prévenez votre banque du voyage.",
  },
  phone: {
    title: "Préparer une eSIM ou un forfait téléphone pour les États-Unis",
    description: "Commandez une eSIM ou activez une option internationale avant le départ.",
  },
  "student-card": {
    title: "Obtenir votre carte étudiante",
    description: "Votre carte officielle pour accéder aux services du campus.",
  },
  "register-classes": {
    title: "S'inscrire aux cours",
    description: "Utilisez le portail étudiant et surveillez les créneaux d'inscription.",
  },
  "open-bank": {
    title: "Ouvrir un compte bancaire américain si nécessaire",
    description: "Comparez les banques proches du campus et les alternatives comme Wise.",
  },
  "activate-sim": {
    title: "Activer le forfait téléphone ou l'eSIM",
    description: "Vérifiez que les données, appels et SMS fonctionnent pour les codes de sécurité.",
  },
  transport: {
    title: "Comprendre les transports locaux",
    description:
      "Repérez les options utiles autour du campus : bus, train, navettes et cartes de transport.",
  },
  emergency: {
    title: "Enregistrer les contacts d'urgence",
    description:
      "Sauvegardez police campus, ambassade, assurance, urgence médicale et contact local.",
  },
  "arrival-reqs": {
    title: "Vérifier les exigences d'arrivée de l'université",
    description: "Check-in obligatoire, vaccination, orientation et démarches campus.",
  },
  "scholarships-research": {
    title: "Chercher les bourses et options de financement",
    description:
      "Identifiez les aides de votre école, de l'université d'accueil, du gouvernement ou d'organismes privés.",
    warning:
      "Les deadlines de bourse sont souvent plus tôt que celles du visa ou du logement. Vérifiez-les dès que possible.",
  },
  "scholarships-prepare": {
    title: "Préparer les documents de candidature aux bourses",
    description:
      "Rassemblez relevés de notes, lettre de motivation, budget, recommandations et formulaires spécifiques.",
  },
  "scholarships-submit": {
    title: "Envoyer les candidatures de bourse avant les deadlines",
    description:
      "Soumettez chaque dossier en avance : beaucoup ferment 4 à 9 mois avant le départ.",
    warning:
      "Les deadlines de bourse sont souvent plus tôt que celles du visa ou du logement. Vérifiez-les dès que possible.",
  },
};

type DisplayTaskText = Task & { docs?: Record<string, string> };

export function getTaskText(task: Task, language: Language): DisplayTaskText {
  if (language !== "fr") return task;
  return {
    ...task,
    ...FRENCH_TASK_TEXT[task.id],
  };
}

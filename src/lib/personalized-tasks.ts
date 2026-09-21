import { TASKS, type Task, type ProfileQuestionnaire } from "./tasks";
import { getUniversityConfig } from "./universities";
import type { CustomChecklistTask } from "./storage";

export function getPersonalizedTasks(profile: ProfileQuestionnaire) {
  const university = getUniversityConfig(profile.university);
  const tasks = TASKS.map((task) => personalizeTaskForUniversity(task, university));

  if (isLikelyUsNational(profile.nationality)) {
    return tasks.filter((task) => task.category !== "visa");
  }

  return tasks;
}

export function customTaskToTask(task: CustomChecklistTask, arrival: Date): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category,
    phase: task.phase,
    recommendedDaysBefore: daysBefore(arrival, task.recommendedDate),
    latestDaysBefore: daysBefore(arrival, task.latestDate || task.recommendedDate),
    priority: task.priority,
    effort: "Custom",
  };
}

function daysBefore(arrival: Date, isoDate: string) {
  const target = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(target.getTime())) return 0;
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((arrival.getTime() - target.getTime()) / msPerDay);
}

function personalizeTaskForUniversity(
  task: Task,
  university: ReturnType<typeof getUniversityConfig>,
): Task {
  if (university.name !== "Stanford University") return task;

  if (task.id === "housing-search") {
    return {
      ...task,
      source: "Stanford R&DE Student Housing",
      warning: "Stanford housing eligibility and deadlines vary by program. Start early.",
      link: { label: "Stanford Housing", url: "https://rde.stanford.edu/studenthousing" },
    };
  }

  if (task.id === "housing-secure") {
    return {
      ...task,
      source: "Stanford R&DE Student Housing",
      warning: "For off-campus housing near Stanford, verify listings carefully before paying.",
    };
  }

  if (task.id === "insurance") {
    return {
      ...task,
      title: "Check Cardinal Care health insurance",
      description:
        "US healthcare is expensive. Check whether Stanford Cardinal Care applies or whether you can waive.",
      source: "Stanford Vaden Health Services",
      link: {
        label: "Cardinal Care",
        url: "https://vaden.stanford.edu/insurance-referral-office/cardinal-care-overview",
      },
    };
  }

  if (task.id === "student-card") {
    return {
      ...task,
      title: "Obtain your Stanford ID Card",
      description: "Your official Stanford ID for campus access and university services.",
      source: "Stanford University IT",
    };
  }

  if (task.id === "register-classes") {
    return {
      ...task,
      description: "Use Axess to manage enrollment and student records.",
      source: "Stanford Axess",
    };
  }

  if (task.id === "transport") {
    return {
      ...task,
      description: "Understand Marguerite shuttle, Caltrain and local transport options.",
    };
  }

  if (task.id === "emergency") {
    return {
      ...task,
      description: "Save Stanford public safety, embassy, insurance hotline and a local contact.",
    };
  }

  if (task.id === "arrival-reqs") {
    return {
      ...task,
      description:
        "Check Bechtel International Center guidance, immigration check-in, orientation and health requirements.",
      source: "Bechtel International Center",
      link: {
        label: "Bechtel International Center",
        url: "https://bechtel.stanford.edu/",
      },
    };
  }

  return task;
}

function isLikelyUsNational(nationality: string) {
  const value = nationality.toLowerCase();
  return ["american", "united states", "usa", "u.s.", "us citizen"].some((term) =>
    value.includes(term),
  );
}

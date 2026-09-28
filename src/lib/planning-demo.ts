import { TASKS, toCalendarDate } from "./tasks";
import { startedKey } from "./next-actions";

export const DEMO_VISIBLE_IDS = ["sevis", "ds-160", "visa-schedule", "housing-search"];
export const DEMO_TASKS = TASKS.filter((task) =>
  [...DEMO_VISIBLE_IDS, "housing-secure", "phone"].includes(task.id),
);
export const DEMO_INITIAL_DONE: Record<string, boolean> = { sevis: true, "ds-160": true };
export const DEMO_PROGRESS = { [startedKey("phone")]: true };
export function demoArrival(today: Date, days = 90) {
  const result = new Date(today);
  result.setDate(result.getDate() + days);
  return toCalendarDate(result);
}
export function isCalendarInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return Number.isFinite(date.getTime()) && toCalendarDate(date) === value;
}

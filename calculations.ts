import { MaintenanceStatus, UpcomingMaintenanceItem } from '../types';

// How close to due before something flips from OK to "coming soon".
const SOON_KM_THRESHOLD = 500;
const SOON_DAYS_THRESHOLD = 30;

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export function monthsAgoIso(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

export function addMonthsIso(dateIso: string, months: number): string {
  const d = new Date(dateIso);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  return Math.round((to - from) / msPerDay);
}

export interface StatusCalcInput {
  baseMileage: number | null;
  baseDate: string | null;
  currentMileage: number;
  intervalKm: number | null;
  intervalMonths: number | null;
}

export interface StatusCalcResult {
  status: MaintenanceStatus;
  kmRemaining: number | null;
  daysRemaining: number | null;
  dueAtMileage: number | null;
  dueAtDate: string | null;
}

/**
 * Pure calculation: given when a maintenance item was last done (or the
 * motorcycle's purchase point, if never logged) and its interval, work out
 * how far away the next occurrence is and what status that implies.
 * Returns null fields for whichever dimension (km / time) isn't tracked.
 */
export function calculateStatus(input: StatusCalcInput): StatusCalcResult {
  const { baseMileage, baseDate, currentMileage, intervalKm, intervalMonths } = input;

  let kmRemaining: number | null = null;
  let dueAtMileage: number | null = null;
  if (intervalKm != null && baseMileage != null) {
    dueAtMileage = baseMileage + intervalKm;
    kmRemaining = dueAtMileage - currentMileage;
  }

  let daysRemaining: number | null = null;
  let dueAtDate: string | null = null;
  if (intervalMonths != null && baseDate) {
    dueAtDate = addMonthsIso(baseDate, intervalMonths);
    daysRemaining = daysBetween(todayIso(), dueAtDate);
  }

  let status: MaintenanceStatus = 'ok';
  const overdue =
    (kmRemaining != null && kmRemaining <= 0) || (daysRemaining != null && daysRemaining <= 0);
  const soon =
    (kmRemaining != null && kmRemaining <= SOON_KM_THRESHOLD) ||
    (daysRemaining != null && daysRemaining <= SOON_DAYS_THRESHOLD);

  if (overdue) status = 'overdue';
  else if (soon) status = 'soon';

  return { status, kmRemaining, daysRemaining, dueAtMileage, dueAtDate };
}

export function statusRank(status: MaintenanceStatus): number {
  if (status === 'overdue') return 0;
  if (status === 'soon') return 1;
  return 2;
}

function urgencyValue(item: UpcomingMaintenanceItem): number {
  const kmScore = item.kmRemaining ?? Infinity;
  // Rough day-to-km equivalence so mixed km/date items sort sensibly together.
  const dayScore = item.daysRemaining != null ? item.daysRemaining * 30 : Infinity;
  return Math.min(kmScore, dayScore);
}

export function sortByUrgency(items: UpcomingMaintenanceItem[]): UpcomingMaintenanceItem[] {
  return [...items].sort((a, b) => {
    const rankDiff = statusRank(a.status) - statusRank(b.status);
    if (rankDiff !== 0) return rankDiff;
    return urgencyValue(a) - urgencyValue(b);
  });
}

export function getOverallStatus(items: UpcomingMaintenanceItem[]): MaintenanceStatus {
  if (items.some((i) => i.status === 'overdue')) return 'overdue';
  if (items.some((i) => i.status === 'soon')) return 'soon';
  return 'ok';
}

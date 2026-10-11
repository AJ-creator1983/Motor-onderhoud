const MONTHS_SHORT = [
  'jan', 'feb', 'mrt', 'apr', 'mei', 'jun',
  'jul', 'aug', 'sep', 'okt', 'nov', 'dec',
];

function formatThousands(n: number): string {
  const sign = n < 0 ? '-' : '';
  const abs = Math.round(Math.abs(n));
  return sign + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatMileage(km: number): string {
  return `${formatThousands(km)} km`;
}

export function formatCurrency(amount: number): string {
  return `€ ${amount.toFixed(2).replace('.', ',')}`;
}

/** Parses a YYYY-MM-DD string as a local calendar date (no timezone shift). */
export function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map((v) => parseInt(v, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(iso: string): string {
  const d = parseDateOnly(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateInput(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatKmRemaining(km: number): string {
  if (km <= 0) return `Overdue by ${formatThousands(Math.abs(km))} km`;
  return `${formatThousands(km)} km remaining`;
}

export function formatDaysRemaining(days: number): string {
  if (days <= 0) {
    const overdueDays = Math.abs(days);
    if (overdueDays < 60) return `Overdue by ${overdueDays} days`;
    return `Overdue by ${Math.round(overdueDays / 30)} months`;
  }
  if (days < 60) return `${days} days remaining`;
  return `${Math.round(days / 30)} months remaining`;
}

/** Short summary line for an upcoming item, preferring whichever dimension is more urgent. */
export function formatRemaining(kmRemaining: number | null, daysRemaining: number | null): string {
  if (kmRemaining != null && daysRemaining != null) {
    // Show whichever is closer to due (more urgent / more informative).
    const kmIsMoreUrgent = Math.abs(kmRemaining) <= Math.abs(daysRemaining) * 30;
    return kmIsMoreUrgent ? formatKmRemaining(kmRemaining) : formatDaysRemaining(daysRemaining);
  }
  if (kmRemaining != null) return formatKmRemaining(kmRemaining);
  if (daysRemaining != null) return formatDaysRemaining(daysRemaining);
  return '';
}

export function formatKmAgo(km: number): string {
  return `${formatThousands(km)} km ago`;
}

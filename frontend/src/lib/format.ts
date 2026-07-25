const RELATIVE_UNITS: { limit: number; unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { limit: 60_000, unit: 'second', ms: 1_000 },
  { limit: 3_600_000, unit: 'minute', ms: 60_000 },
  { limit: 86_400_000, unit: 'hour', ms: 3_600_000 },
  { limit: 604_800_000, unit: 'day', ms: 86_400_000 },
  { limit: 2_629_800_000, unit: 'week', ms: 604_800_000 },
  { limit: 31_557_600_000, unit: 'month', ms: 2_629_800_000 },
];

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

/** "3 hours ago" — used wherever exact timestamps would be noise. */
export function formatRelativeTime(isoDate: string): string {
  const timestamp = Date.parse(isoDate);

  if (Number.isNaN(timestamp)) {
    return '—';
  }

  const elapsed = Date.now() - timestamp;
  const match = RELATIVE_UNITS.find((entry) => Math.abs(elapsed) < entry.limit);

  if (!match) {
    return relativeFormatter.format(-Math.round(elapsed / 31_557_600_000), 'year');
  }

  return relativeFormatter.format(-Math.round(elapsed / match.ms), match.unit);
}

const absoluteFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Full timestamp, used in tooltips beside the relative one. */
export function formatAbsoluteTime(isoDate: string): string {
  const timestamp = Date.parse(isoDate);
  return Number.isNaN(timestamp) ? '—' : absoluteFormatter.format(timestamp);
}

export function formatInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || '?';
}

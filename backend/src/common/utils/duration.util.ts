const UNIT_IN_SECONDS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24,
};

/**
 * Converts a JWT-style duration ("30m", "1d", "3600") into seconds so the API
 * can tell clients exactly when a session expires.
 */
export function parseDurationToSeconds(duration: string, fallbackSeconds = 86_400): number {
  const trimmed = duration.trim();
  const match = /^(\d+)([smhd])?$/.exec(trimmed);

  if (!match) {
    return fallbackSeconds;
  }

  const value = Number(match[1]);
  const unit = match[2] ?? 's';

  return value * (UNIT_IN_SECONDS[unit] ?? 1);
}

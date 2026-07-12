/**
 * Formats an ISO 8601 date string into a readable date and time.
 *
 * @param {string} isoString - ISO 8601 date string from the API (e.g. '2026-07-14T19:00:00Z').
 * @param {Intl.DateTimeFormatOptions} [options] - Optional overrides for Intl.DateTimeFormat.
 * @returns {{ date: string, time: string }} Formatted date and time strings.
 */
export function formatMatchDateTime(isoString, options = {}) {
  if (!isoString) return { date: '—', time: '—' };

  const d = new Date(isoString);

  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  });

  const time = d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return { date, time };
}

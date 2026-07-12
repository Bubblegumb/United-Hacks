/**
 * Maps football-data.org match status enums to human-readable labels.
 *
 * Possible API values: SCHEDULED, TIMED, IN_PLAY, PAUSED, FINISHED,
 * POSTPONED, SUSPENDED, CANCELLED.
 *
 * @type {Record<string, string>}
 */
export const STATUS_LABELS = {
  SCHEDULED: 'Upcoming',
  TIMED: 'Upcoming',
  IN_PLAY: 'Live',
  PAUSED: 'Half Time',
  FINISHED: 'Full Time',
  POSTPONED: 'Postponed',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled',
};

/**
 * Maps each status to a CSS modifier class name used by the badge.
 * These classes are defined in FixtureCard.css.
 *
 * @type {Record<string, string>}
 */
export const STATUS_BADGE_VARIANT = {
  SCHEDULED: 'badge--upcoming',
  TIMED: 'badge--upcoming',
  IN_PLAY: 'badge--live',
  PAUSED: 'badge--paused',
  FINISHED: 'badge--finished',
  POSTPONED: 'badge--cancelled',
  SUSPENDED: 'badge--cancelled',
  CANCELLED: 'badge--cancelled',
};

/**
 * Returns true when the match has a live score to display.
 *
 * @param {string} status - Raw status string from the API.
 * @returns {boolean}
 */
export function isLiveOrFinished(status) {
  return status === 'IN_PLAY' || status === 'PAUSED' || status === 'FINISHED';
}

/**
 * Returns the human-readable label for a given API status.
 * Falls back to the raw status string if unknown.
 *
 * @param {string} status - Raw status string from the API.
 * @returns {string}
 */
export function getStatusLabel(status) {
  return STATUS_LABELS[status] ?? status;
}

/**
 * Returns the CSS modifier class for the status badge.
 * Falls back to 'badge--finished' if unknown.
 *
 * @param {string} status - Raw status string from the API.
 * @returns {string}
 */
export function getBadgeVariant(status) {
  return STATUS_BADGE_VARIANT[status] ?? 'badge--finished';
}

const UPCOMING_STATUSES = new Set(['SCHEDULED', 'TIMED']);

/**
 * Finds the earliest match in the array that has a status of SCHEDULED or TIMED.
 * Returns `null` if no such match exists.
 *
 * @param {any[]} fixtures
 * @returns {any|null}
 */
export function findNextFixture(fixtures) {
  if (!Array.isArray(fixtures) || fixtures.length === 0) return null;

  let earliest = null;
  let earliestMs = Infinity;

  for (const match of fixtures) {
    if (!UPCOMING_STATUSES.has(match.status)) continue;
    const ms = new Date(match.utcDate).getTime();
    if (ms < earliestMs) {
      earliestMs = ms;
      earliest = match;
    }
  }

  return earliest;
}

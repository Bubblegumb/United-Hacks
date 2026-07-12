import { useState, useEffect, useRef, useMemo } from 'react';
import { formatMatchDateTime } from '../utils/formatDate';
import '../styles/Countdown.css';

// ─── JSDoc types ──────────────────────────────────────────────────────────────

/**
 * @typedef {import('./FixtureCard').Match} Match
 */

/**
 * @typedef {Object} TimeLeft
 * @property {number} days
 * @property {number} hours
 * @property {number} minutes
 * @property {number} seconds
 * @property {boolean} expired - true when the target date is in the past.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Status values that represent a match that has not yet kicked off. */
const UPCOMING_STATUSES = new Set(['SCHEDULED', 'TIMED']);

// ─── Pure helpers (defined at module scope — no closure over component state) ─

/**
 * Computes the remaining time from now until `targetMs` (epoch ms).
 * Returns `{ days, hours, minutes, seconds, expired }`.
 *
 * Extracting this outside the component satisfies `js-cache-function-results`
 * and keeps the useEffect callback lean.
 *
 * @param {number} targetMs - The target epoch time in milliseconds.
 * @returns {TimeLeft}
 */
function calcTimeLeft(targetMs) {
  const diff = targetMs - Date.now();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, expired: false };
}

/**
 * Zero-pads a number to at least 2 digits.
 *
 * @param {number} n
 * @returns {string}
 */
function pad(n) {
  return String(n).padStart(2, '0');
}

/**
 * Finds the earliest match in the array that has a status of SCHEDULED or TIMED.
 * Returns `null` if no such match exists.
 *
 * Uses a single-pass min-scan (js-min-max-loop) instead of sort + [0].
 *
 * @param {Match[]} fixtures
 * @returns {Match|null}
 */
function findNextFixture(fixtures) {
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

// ─── Sub-components (module scope — rerender-no-inline-components) ────────────

/**
 * A single time-unit block: large number + label.
 *
 * @param {{ value: number, unit: string }} props
 */
function TimeBlock({ value, unit }) {
  return (
    <div className="countdown__block">
      <span className="countdown__value" aria-label={`${value} ${unit}`}>
        {pad(value)}
      </span>
      <span className="countdown__unit" aria-hidden="true">{unit}</span>
    </div>
  );
}

/**
 * Separator colon rendered between time blocks.
 */
function Separator() {
  return <span className="countdown__sep" aria-hidden="true">:</span>;
}

/**
 * Rendered when the countdown has expired — the match is kicking off.
 */
function LiveIndicator() {
  return (
    <div className="countdown__live" role="status" aria-live="polite">
      <span className="countdown__live-dot" aria-hidden="true" />
      <span className="countdown__live-text">Match is Live!</span>
    </div>
  );
}

/**
 * Shimmer skeleton shown while fixtures are loading.
 * Mirrors the Countdown layout with grey placeholder shapes.
 */
function CountdownSkeleton() {
  return (
    <section className="countdown-skeleton" aria-hidden="true">
      <div className="countdown-skeleton__label countdown-shine" />
      <div className="countdown-skeleton__matchup countdown-shine" />
      <div className="countdown-skeleton__date countdown-shine" />
      <div className="countdown-skeleton__blocks">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="countdown-skeleton__block">
            <div className="countdown-skeleton__value countdown-shine" />
            <div className="countdown-skeleton__unit countdown-shine" />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

/**
 * Finds the earliest SCHEDULED or TIMED match in `fixtures`, then counts down
 * to its `utcDate` updating every second via `setInterval`.
 *
 * **Vercel best-practices applied:**
 * - `rerender-no-inline-components` — TimeBlock, Separator, LiveIndicator,
 *   CountdownSkeleton all defined at module scope.
 * - `rerender-use-ref-transient-values` — the interval ID is stored in a ref,
 *   not state, so clearing it never triggers a re-render.
 * - `rerender-lazy-state-init` — initial `timeLeft` is computed by passing
 *   a function to useState, so calcTimeLeft runs only once on mount.
 * - `js-min-max-loop` — findNextFixture uses a single-pass min-scan, not sort.
 * - `js-set-map-lookups` — UPCOMING_STATUSES is a Set for O(1) checks.
 * - `rendering-conditional-render` — ternary, not &&.
 *
 * @param {Object}    props
 * @param {Match[]}   props.fixtures - Raw matches array from the API.
 * @param {boolean}   props.loading  - True while useFixtures is fetching.
 */
export default function Countdown({ fixtures, loading }) {
  // ── Derive the target match (memoised — only recomputes when fixtures changes) ──
  // rerender-derived-state-no-effect: derived synchronously during render, not in an effect.
  const nextMatch = useMemo(() => findNextFixture(fixtures), [fixtures]);

  // ── Timer state ───────────────────────────────────────────────────────────────
  // rerender-lazy-state-init: pass a function so calcTimeLeft only runs once.
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!nextMatch) return null;
    return calcTimeLeft(new Date(nextMatch.utcDate).getTime());
  });

  // rerender-use-ref-transient-values: interval ID is transient — storing it in
  // a ref avoids a superfluous re-render when the interval is started/cleared.
  const intervalRef = useRef(null);

  useEffect(() => {
    // No match found or fixtures not yet loaded → nothing to count down to.
    if (!nextMatch) {
      setTimeLeft(null);
      return;
    }

    const targetMs = new Date(nextMatch.utcDate).getTime();

    // Compute immediately so the display doesn't show stale data for 1 second.
    setTimeLeft(calcTimeLeft(targetMs));

    intervalRef.current = setInterval(() => {
      const t = calcTimeLeft(targetMs);
      setTimeLeft(t);

      // Once expired, stop ticking — no need to keep the interval alive.
      if (t.expired) {
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [nextMatch]); // Re-run only when the target match changes (competition switch etc.)

  // ── Render: loading ───────────────────────────────────────────────────────────
  if (loading) return <CountdownSkeleton />;

  // ── Render: no upcoming fixtures ──────────────────────────────────────────────
  // Returns null — the section disappears cleanly (tournament over, all cancelled, etc.)
  if (!nextMatch || !timeLeft) return null;

  const { date } = formatMatchDateTime(nextMatch.utcDate);

  // ── Render: live ──────────────────────────────────────────────────────────────
  if (timeLeft.expired) {
    return (
      <section className="countdown" aria-label="Match status">
        <div className="countdown__context">
          <span className="countdown__label">Next Match</span>
          <p className="countdown__matchup">
            {nextMatch.homeTeam.shortName || nextMatch.homeTeam.name}
            <span className="countdown__matchup-sep">vs</span>
            {nextMatch.awayTeam.shortName || nextMatch.awayTeam.name}
          </p>
          <time className="countdown__date" dateTime={nextMatch.utcDate}>{date}</time>
        </div>
        <LiveIndicator />
      </section>
    );
  }

  // ── Render: counting down ─────────────────────────────────────────────────────
  return (
    <section
      className="countdown"
      aria-label={`Countdown to next match: ${nextMatch.homeTeam.name} vs ${nextMatch.awayTeam.name}`}
    >
      {/* Match context */}
      <div className="countdown__context">
        <span className="countdown__label">Next Match</span>
        <p className="countdown__matchup">
          {nextMatch.homeTeam.shortName || nextMatch.homeTeam.name}
          <span className="countdown__matchup-sep">vs</span>
          {nextMatch.awayTeam.shortName || nextMatch.awayTeam.name}
        </p>
        <time className="countdown__date" dateTime={nextMatch.utcDate}>{date}</time>
      </div>

      {/* Timer blocks */}
      <div className="countdown__blocks" role="timer" aria-live="off">
        <TimeBlock value={timeLeft.days} unit="Days" />
        <Separator />
        <TimeBlock value={timeLeft.hours} unit="Hours" />
        <Separator />
        <TimeBlock value={timeLeft.minutes} unit="Mins" />
        <Separator />
        <TimeBlock value={timeLeft.seconds} unit="Secs" />
      </div>
    </section>
  );
}

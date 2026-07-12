import { useState, useCallback } from 'react';
import { getStatusLabel, getBadgeVariant, isLiveOrFinished } from '../utils/matchStatus';
import { formatMatchDateTime } from '../utils/formatDate';
import '../styles/FixtureCard.css';

// ─── JSDoc types ──────────────────────────────────────────────────────────────

/**
 * A team object as returned by football-data.org.
 *
 * @typedef {Object} Team
 * @property {number}      id        - Unique team ID.
 * @property {string}      name      - Full team name.
 * @property {string}      shortName - Short team name (e.g. 'Man Utd').
 * @property {string}      tla       - Three-letter abbreviation.
 * @property {string|null} crest     - URL of the team crest image (SVG or PNG).
 */

/**
 * A score object as returned by football-data.org.
 *
 * @typedef {Object} Score
 * @property {{ home: number|null, away: number|null }} fullTime  - Full-time score.
 * @property {{ home: number|null, away: number|null }} halfTime  - Half-time score.
 */

/**
 * A match object as returned by football-data.org's `/competitions/:id/matches` endpoint.
 *
 * @typedef {Object} Match
 * @property {number}      id           - Unique match ID.
 * @property {string}      utcDate      - ISO 8601 kick-off datetime string.
 * @property {string}      status       - Raw status enum: SCHEDULED | TIMED | IN_PLAY | PAUSED | FINISHED | …
 * @property {Team}        homeTeam     - Home team object.
 * @property {Team}        awayTeam     - Away team object.
 * @property {Score}       score        - Scoring data.
 * @property {{ name: string|null }|null} venue - Venue object (may be absent on free tier).
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Derives 1–3 uppercase initials from a team name for use as a crest fallback.
 *
 * @param {string} name - Full or short team name.
 * @returns {string} - e.g. 'MCI' for 'Manchester City'.
 */
function getInitials(name) {
  if (!name) return '?';
  return name
    .split(/\s+/)
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ─── Sub-components (hoisted outside FixtureCard to avoid re-creation) ────────

/**
 * Renders a team crest image with an initials fallback on load error.
 *
 * @param {{ crest: string|null, name: string, tla: string }} props
 */
function TeamCrest({ crest, name, tla }) {
  const [failed, setFailed] = useState(false);

  // rerender-no-inline-components: defined at module level, not inside FixtureCard.
  // rerender-functional-setstate: using the setter directly; no stale closure risk here.
  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div className="fixture-card__crest-wrap" aria-hidden="true">
      {crest && !failed ? (
        <img
          src={crest}
          alt=""
          className="fixture-card__crest"
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="fixture-card__crest-fallback">
          {tla || getInitials(name)}
        </span>
      )}
    </div>
  );
}

/**
 * Renders the status pill badge. Includes a pulsing dot for live matches.
 *
 * @param {{ status: string }} props
 */
function StatusBadge({ status }) {
  const label = getStatusLabel(status);
  const variant = getBadgeVariant(status);
  const isLive = status === 'IN_PLAY';

  return (
    <span className={`badge ${variant}`} role="status" aria-label={`Match status: ${label}`}>
      {isLive && <span className="badge__dot" aria-hidden="true" />}
      {label}
    </span>
  );
}

// ─── FixtureCard ──────────────────────────────────────────────────────────────

/**
 * Displays a single football match as a card with team crests, score or
 * kick-off time, a status badge, venue, and date.
 *
 * Applies the Vercel `rerender-no-inline-components` rule: TeamCrest and
 * StatusBadge are defined at module scope to prevent unnecessary re-mounts.
 *
 * @param {{ match: Match }} props
 */
export default function FixtureCard({ match }) {
  const {
    utcDate,
    status,
    homeTeam,
    awayTeam,
    score,
    venue,
  } = match;

  const { date, time } = formatMatchDateTime(utcDate);
  const showScore = isLiveOrFinished(status);

  const homeScore = score?.fullTime?.home ?? null;
  const awayScore = score?.fullTime?.away ?? null;
  const venueName = venue?.name ?? null;

  return (
    <article className="fixture-card" aria-label={`${homeTeam.name} vs ${awayTeam.name}`}>
      {/* ── Teams row ── */}
      <div className="fixture-card__teams">
        {/* Home */}
        <div className="fixture-card__team fixture-card__team--home">
          <TeamCrest crest={homeTeam.crest} name={homeTeam.name} tla={homeTeam.tla} />
          <span className="fixture-card__team-name" title={homeTeam.name}>
            {homeTeam.shortName || homeTeam.name}
          </span>
        </div>

        {/* Center: score or kick-off time + badge + venue */}
        <div className="fixture-card__center">
          <StatusBadge status={status} />

          {showScore ? (
            <span className="fixture-card__score" aria-label={`Score: ${homeScore} - ${awayScore}`}>
              {homeScore ?? 0}&thinsp;—&thinsp;{awayScore ?? 0}
            </span>
          ) : (
            <span className="fixture-card__kickoff" aria-label={`Kick-off at ${time}`}>
              {time}
            </span>
          )}

          {venueName && (
            <span className="fixture-card__venue" title={venueName}>
              {venueName}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="fixture-card__team fixture-card__team--away">
          <TeamCrest crest={awayTeam.crest} name={awayTeam.name} tla={awayTeam.tla} />
          <span className="fixture-card__team-name" title={awayTeam.name}>
            {awayTeam.shortName || awayTeam.name}
          </span>
        </div>
      </div>

      {/* ── Footer: date ── */}
      <footer className="fixture-card__footer">
        <time dateTime={utcDate}>{date}</time>
      </footer>
    </article>
  );
}

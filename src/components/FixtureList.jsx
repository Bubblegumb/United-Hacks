import FixtureCard from './FixtureCard';
import '../styles/FixtureList.css';

// ─── JSDoc types ──────────────────────────────────────────────────────────────

/**
 * Re-exported for consumers that import only from FixtureList.
 *
 * @typedef {import('./FixtureCard').Match} Match
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/** Number of skeleton placeholder cards to render while loading. */
const SKELETON_COUNT = 3;

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * A single card-shaped shimmer skeleton that mirrors the FixtureCard layout.
 *
 * Defined at module scope per the Vercel `rerender-no-inline-components` rule.
 */
function SkeletonCard() {
  return (
    <li className="fixture-skeleton" aria-hidden="true">
      <div className="fixture-skeleton__teams">
        {/* Home team placeholder */}
        <div className="fixture-skeleton__team">
          <div className="fixture-skeleton__crest skeleton-shine" />
          <div className="fixture-skeleton__name skeleton-shine" />
        </div>

        {/* Center placeholder */}
        <div className="fixture-skeleton__center">
          <div className="fixture-skeleton__badge skeleton-shine" />
          <div className="fixture-skeleton__score skeleton-shine" />
        </div>

        {/* Away team placeholder */}
        <div className="fixture-skeleton__team">
          <div className="fixture-skeleton__crest skeleton-shine" />
          <div className="fixture-skeleton__name skeleton-shine" />
        </div>
      </div>

      <div className="fixture-skeleton__footer skeleton-shine" />
    </li>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────

/**
 * Shown when the API returns an empty matches array.
 *
 * Defined at module scope per the Vercel `rerender-no-inline-components` rule.
 */
function EmptyState() {
  return (
    <div className="fixture-list__empty" role="status">
      {/* Calendar-with-X icon (inline SVG — no extra dependency) */}
      <svg
        className="fixture-list__empty-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="10" y1="14" x2="14" y2="18" />
        <line x1="14" y1="14" x2="10" y2="18" />
      </svg>
      <p className="fixture-list__empty-text">
        No fixtures found for this competition.
      </p>
    </div>
  );
}

// ─── Rate Limit State ────────────────────────────────────────────────────────

/**
 * Shown when the API returns a 429 Too Many Requests error.
 *
 * Defined at module scope per the Vercel `rerender-no-inline-components` rule.
 */
function RateLimitState() {
  return (
    <div className="fixture-list__empty" role="status">
      {/* Clock/Warning icon (inline SVG) */}
      <svg
        className="fixture-list__empty-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <p className="fixture-list__empty-text">
        Rate limit reached (10 requests/minute on the free tier).<br/>
        Please wait a moment and try again.
      </p>
    </div>
  );
}

// ─── FixtureList ──────────────────────────────────────────────────────────────

/**
 * Renders a responsive grid of {@link FixtureCard} components from a
 * football-data.org matches array.
 *
 * Handles three states:
 * - **loading** — displays {@link SKELETON_COUNT} pulse-shimmer placeholder cards.
 * - **empty**   — displays an icon + "No fixtures found" message.
 * - **data**    — renders one {@link FixtureCard} per match.
 *
 * The component is deliberately stateless; data fetching lives in the parent
 * (e.g. via `useFixtures`) keeping concerns separated and enabling easy testing.
 *
 * @param {Object}    props
 * @param {Match[]}   props.matches   - Array of match objects from the API.
 *                                      Pass an empty array [] when no matches exist.
 * @param {boolean}   props.loading   - When true, skeleton cards are displayed.
 * @param {string|null} [props.error] - Optional error string. If it contains "429" or "Rate limit",
 *                                      we show the RateLimitState.
 * @param {string|null} [props.className] - Optional extra class for the root element.
 */
export default function FixtureList({ matches, loading, error, className = '' }) {
  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className={`fixture-list ${className}`} aria-busy="true" aria-label="Loading fixtures">
        <ul className="fixture-list__grid">
          {/* rendering-conditional-render: ternary used; no && short-circuit to avoid '0' render */}
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <SkeletonCard key={i} />
          ))}
        </ul>
      </section>
    );
  }

  // ── Error: Rate Limit ────────────────────────────────────────────────────────
  if (error && (error.includes('429') || error.includes('Rate limit'))) {
    return (
      <section className={`fixture-list ${className}`}>
        <RateLimitState />
      </section>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────────
  if (!matches || matches.length === 0) {
    return (
      <section className={`fixture-list ${className}`}>
        <EmptyState />
      </section>
    );
  }

  // ── Data ─────────────────────────────────────────────────────────────────────
  return (
    <section className={`fixture-list ${className}`} aria-label="Fixtures">
      <ul className="fixture-list__grid">
        {matches.map((match) => (
          <li key={match.id}>
            <FixtureCard match={match} />
          </li>
        ))}
      </ul>
    </section>
  );
}

import { useState, useCallback } from 'react';
import { getStatusLabel, getBadgeVariant, isLiveOrFinished } from '../utils/matchStatus';
import { formatMatchDateTime } from '../utils/formatDate';
import { getTeamColor } from '../utils/teamColors';
import '../styles/FixtureCard.css';

/**
 * Derives 1–3 uppercase initials from a team name for use as a crest fallback.
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

/**
 * Renders a team crest image with an initials fallback on load error.
 */
function TeamFlag({ crest, name, tla }) {
  const [failed, setFailed] = useState(false);

  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div className="flag" aria-hidden="true">
      {crest && !failed ? (
        <img
          src={crest}
          alt=""
          onError={handleError}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="flag-fallback">
          {tla || getInitials(name)}
        </span>
      )}
    </div>
  );
}

/**
 * Displays a single football match as a row.
 *
 * @param {{ match: import('./FixtureCard').Match }} props
 */
export default function FixtureCard({ match }) {
  const {
    utcDate,
    status,
    homeTeam,
    awayTeam,
    score,
  } = match;

  const { time } = formatMatchDateTime(utcDate);
  const showScore = isLiveOrFinished(status);

  const homeScore = score?.fullTime?.home ?? null;
  const awayScore = score?.fullTime?.away ?? null;

  const isLive = status === 'IN_PLAY';
  const statusLabel = getStatusLabel(status);

  const homeColor = getTeamColor(homeTeam.name, homeTeam.tla);
  const awayColor = getTeamColor(awayTeam.name, awayTeam.tla);

  return (
    <div 
      className="fixture-row"
      style={{ '--team-home': homeColor, '--team-away': awayColor }}
    >
      <div className="team">
        <TeamFlag crest={homeTeam.crest} name={homeTeam.name} tla={homeTeam.tla} />
        {homeTeam.shortName || homeTeam.name}
      </div>

      <div className="score">
        {showScore ? `${homeScore ?? 0} - ${awayScore ?? 0}` : time}
      </div>

      <div className="team away">
        {awayTeam.shortName || awayTeam.name}
        <TeamFlag crest={awayTeam.crest} name={awayTeam.name} tla={awayTeam.tla} />
      </div>

      <div className={`status ${isLive ? 'live' : ''}`}>
        {isLive ? 'LIVE' : statusLabel === 'Full Time' ? 'FT' : statusLabel === 'Scheduled' ? 'UPCOMING' : statusLabel}
      </div>
    </div>
  );
}

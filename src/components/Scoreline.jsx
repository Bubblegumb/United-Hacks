import { useState, useCallback } from 'react';

function getInitials(name) {
  if (!name) return '?';
  return name.split(/\s+/).slice(0, 3).map((w) => w[0]).join('').toUpperCase();
}

function TeamCrest({ crest, name, tla, size = 32 }) {
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div className="scoreline-crest" style={{ width: size, height: size * 0.7 }}>
      {crest && !failed ? (
        <img src={crest} alt="" onError={handleError} loading="eager" decoding="async" />
      ) : (
        <span className="scoreline-crest-fallback">{tla || getInitials(name)}</span>
      )}
    </div>
  );
}

/**
 * Scoreline header — top section of the match detail page.
 * Home team | status tag + big score | away team
 */
export default function Scoreline({ match }) {
  if (!match) return null;

  const { homeTeam, awayTeam, score, status, minute } = match;

  const homeScore = score?.fullTime?.home ?? score?.halfTime?.home ?? null;
  const awayScore = score?.fullTime?.away ?? score?.halfTime?.away ?? null;

  const isLive = status === 'IN_PLAY' || status === 'PAUSED';
  const isFinished = status === 'FINISHED';
  const isScheduled = !isLive && !isFinished;

  // Build status tag
  let statusTag = null;
  let scoreDisplay = null;

  if (isLive) {
    const minDisplay = minute ? `${minute}'` : '';
    statusTag = <span className="scoreline-status live">{minDisplay} LIVE</span>;
    scoreDisplay = <span className="scoreline-score">{homeScore ?? 0} – {awayScore ?? 0}</span>;
  } else if (isFinished) {
    statusTag = <span className="scoreline-status finished">FULL TIME</span>;
    scoreDisplay = <span className="scoreline-score">{homeScore ?? 0} – {awayScore ?? 0}</span>;
  } else {
    // Scheduled — show kickoff time instead of score
    const kickoffTime = match.utcDate
      ? new Date(match.utcDate).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
      : '';
    const kickoffDate = match.utcDate
      ? new Date(match.utcDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
      : '';
    statusTag = <span className="scoreline-status scheduled">SCHEDULED</span>;
    scoreDisplay = (
      <div className="scoreline-kickoff">
        <div className="scoreline-kickoff-time">{kickoffTime}</div>
        <div className="scoreline-kickoff-date">{kickoffDate}</div>
      </div>
    );
  }

  const homeName = homeTeam?.shortName || homeTeam?.name || 'Home';
  const awayName = awayTeam?.shortName || awayTeam?.name || 'Away';

  return (
    <div className="scoreline">
      {/* Home side */}
      <div className="scoreline-side home">
        <TeamCrest crest={homeTeam?.crest} name={homeTeam?.name} tla={homeTeam?.tla} size={36} />
        <span className="scoreline-team-name">{homeName}</span>
      </div>

      {/* Center: status + score */}
      <div className="scoreline-center">
        {statusTag}
        {scoreDisplay}
      </div>

      {/* Away side */}
      <div className="scoreline-side away">
        <span className="scoreline-team-name">{awayName}</span>
        <TeamCrest crest={awayTeam?.crest} name={awayTeam?.name} tla={awayTeam?.tla} size={36} />
      </div>
    </div>
  );
}

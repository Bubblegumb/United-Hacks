import { useMemo } from 'react';
import Countdown from './Countdown';
import { formatMatchDateTime } from '../utils/formatDate';
import { getTeamColor } from '../utils/teamColors';
import '../styles/HeroScene.css';

/**
 * Static Hero Banner displaying the next match.
 *
 * @param {Object} props
 * @param {import('./FixtureCard').Match|null} props.nextMatch - Next match object.
 * @param {boolean} [props.loading] - Whether data is loading.
 */
export default function HeroScene({ nextMatch, loading }) {
  if (loading) {
    return (
      <div className="hero" aria-hidden="true">
        <div className="pitch-arc"></div>
        <div className="eyebrow">LOADING...</div>
      </div>
    );
  }

  if (!nextMatch) {
    return (
      <div className="hero" aria-hidden="true">
        <div className="pitch-arc"></div>
        <div className="eyebrow">NO UPCOMING MATCHES</div>
      </div>
    );
  }

  const homeName = nextMatch.homeTeam.shortName || nextMatch.homeTeam.name;
  const awayName = nextMatch.awayTeam.shortName || nextMatch.awayTeam.name;
  const { date } = formatMatchDateTime(nextMatch.utcDate);

  const homeColor = getTeamColor(nextMatch.homeTeam.name, nextMatch.homeTeam.tla);
  const awayColor = getTeamColor(nextMatch.awayTeam.name, nextMatch.awayTeam.tla);

  return (
    <div 
      className="hero"
      style={{ '--team-home': homeColor, '--team-away': awayColor }}
    >
      <div className="pitch-arc"></div>
      <div className="eyebrow">NEXT MATCH</div>
      <div className="matchup">
        {homeName} <span className="vs">VS</span> {awayName}
      </div>
      <div className="match-date">{date}</div>
      <Countdown nextMatch={nextMatch} loading={loading} />
    </div>
  );
}

import { useParams, Link } from 'react-router-dom';
import { useMatchDetail } from '../hooks/useMatchDetail';
import { useApiFootball } from '../hooks/useApiFootball';
import Scoreline from './Scoreline';
import FormationView from './FormationView';
import MatchStats from './MatchStats';
import MatchTimeline from './MatchTimeline';
import HeadToHead from './HeadToHead';
import '../styles/MatchDetail.css';

const LIVE_OR_FINISHED = new Set(['IN_PLAY', 'PAUSED', 'FINISHED']);

/**
 * MatchDetail page — loaded at /match/:matchId
 */
export default function MatchDetail() {
  const { matchId } = useParams();

  const { match, h2h, loading, error } = useMatchDetail(matchId);

  const homeTeamName = match?.homeTeam?.name;
  const awayTeamName = match?.awayTeam?.name;
  const utcDate = match?.utcDate;
  const status = match?.status;
  const competitionCode = match?.competition?.code;
  // Season = the year of the match date (e.g. "2026-07-12" → 2026)
  const season = utcDate ? new Date(utcDate).getFullYear() : undefined;

  const { lineups, events, stats, loaded: apifLoaded } = useApiFootball(
    matchId,
    homeTeamName,
    awayTeamName,
    utcDate,
    status,
    competitionCode,
    season
  );

  const showLiveData = status && LIVE_OR_FINISHED.has(status);
  const isScheduled = !showLiveData;

  if (loading) {
    return (
      <div className="match-detail">
        <Link to="/" className="back-link">← BACK TO FIXTURES</Link>
        <div className="match-detail-loading">
          <div className="md-skeleton" style={{ width: '60%', height: 80 }} />
          <div className="md-skeleton" style={{ width: '100%', height: 300, marginTop: 40 }} />
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="match-detail">
      <Link to="/" className="back-link">← BACK TO FIXTURES</Link>
        <div className="match-detail-error">
          Unable to load match data. Please try again.
        </div>
      </div>
    );
  }

  const homeTeamId = match.homeTeam?.id;

  return (
    <div className="match-detail">
      {/* ── Back link ── */}
      <Link to="/" className="back-link">← BACK TO FIXTURES</Link>

      {/* ── 1. Scoreline header ── */}
      <Scoreline match={match} />

      {/* ── 2. Lineups / formation ── */}
      <section className="md-section">
        <div className="md-section-title">LINEUPS</div>
        <FormationView lineups={lineups} isScheduled={isScheduled} />
      </section>

      {/* ── 3. Match stats — only if live/finished and stats present ── */}
      {showLiveData && stats && (
        <section className="md-section">
          <div className="md-section-title">MATCH STATS</div>
          <MatchStats stats={stats} />
        </section>
      )}

      {/* ── 4. Match timeline — only if live/finished and events present ── */}
      {showLiveData && events && events.length > 0 && (
        <section className="md-section">
          <div className="md-section-title">MATCH TIMELINE</div>
          <MatchTimeline events={events} homeTeamId={homeTeamId} />
        </section>
      )}

      {/* ── 5. Head-to-head — always if data available ── */}
      {h2h && h2h.length > 0 && (
        <section className="md-section">
          <div className="md-section-title">HEAD TO HEAD — LAST 5 MEETINGS</div>
          <HeadToHead matches={h2h} homeTeamId={homeTeamId} />
        </section>
      )}
    </div>
  );
}

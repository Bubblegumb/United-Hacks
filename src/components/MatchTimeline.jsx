/**
 * MatchTimeline — horizontal timeline of goals, cards, and substitutions.
 *
 * @param {{ events: any[], homeTeamId: number }} props
 */

const RELEVANT_TYPES = new Set(['Goal', 'Card', 'subst']);

function getEventIcon(event) {
  const type = event.type;
  const detail = event.detail || '';

  if (type === 'Goal') {
    if (detail.includes('Own Goal')) return '⚫';
    if (detail.includes('Penalty')) return '⚽';
    return '⚽';
  }
  if (type === 'Card') {
    if (detail.includes('Yellow')) return '🟨';
    if (detail.includes('Red')) return '🟥';
    return '🟥';
  }
  if (type === 'subst') return '🔄';
  return '•';
}

function getEventLabel(event) {
  const icon = getEventIcon(event);
  const player = event.player?.name || '';
  const lastName = player.split(' ').pop() || player;
  return `${icon} ${lastName.toUpperCase()}`;
}

export default function MatchTimeline({ events, homeTeamId }) {
  if (!events || events.length === 0) return null;

  // Filter to relevant event types only
  const relevant = events.filter((e) => RELEVANT_TYPES.has(e.type));
  if (relevant.length === 0) return null;

  // Sort events chronologically just in case (API usually does, but to be safe)
  const sorted = [...relevant].sort((a, b) => (a.time?.elapsed || 0) - (b.time?.elapsed || 0));

  return (
    <div className="timeline-container">
      <div className="timeline-line" />
      {sorted.map((event, i) => {
        const minute = event.time?.elapsed || 0;
        const isHome = event.team?.id === homeTeamId;
        const label = getEventLabel(event);

        return (
          <div key={i} className="tl-event-row">
            <div className="tl-content home-side">
              {isHome && <div className="tl-label">{label}</div>}
            </div>
            <div className="tl-center">
              <div className="tl-min">{minute}'</div>
              <div className={`tl-dot ${isHome ? 'home' : 'away'}`} />
            </div>
            <div className="tl-content away-side">
              {!isHome && <div className="tl-label">{label}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MatchStats — dual-sided bar chart for possession, shots, corners, etc.
 *
 * @param {{ stats: { home, away } | null }} props
 *   stats.home / stats.away are arrays of { type: string, value: string | number }
 */

// Which stats to show, in order (match API-Football type strings)
const STAT_ORDER = [
  { key: 'Ball Possession', label: 'POSSESSION', isPercent: true },
  { key: 'Total Shots', label: 'SHOTS' },
  { key: 'Shots on Goal', label: 'SHOTS ON TARGET' },
  { key: 'Corner Kicks', label: 'CORNERS' },
  { key: 'Fouls', label: 'FOULS' },
  { key: 'Offsides', label: 'OFFSIDES' },
  { key: 'Yellow Cards', label: 'YELLOW CARDS' },
];

function parseVal(v) {
  if (v == null) return 0;
  return parseFloat(String(v).replace('%', '')) || 0;
}

function findStat(statsArr, key) {
  if (!Array.isArray(statsArr)) return null;
  return statsArr.find((s) => s.type === key) ?? null;
}

export default function MatchStats({ stats }) {
  if (!stats) return null;

  const { home, away } = stats;
  const homeStats = home?.statistics ?? [];
  const awayStats = away?.statistics ?? [];

  const rows = STAT_ORDER.map(({ key, label, isPercent }) => {
    const h = findStat(homeStats, key);
    const a = findStat(awayStats, key);
    if (!h && !a) return null;

    const hVal = parseVal(h?.value);
    const aVal = parseVal(a?.value);
    const total = hVal + aVal || 1;

    const hPct = isPercent ? hVal : (hVal / total) * 100;
    const aPct = isPercent ? aVal : (aVal / total) * 100;

    const hDisplay = isPercent ? `${hVal}%` : hVal;
    const aDisplay = isPercent ? `${aVal}%` : aVal;

    return { label, hVal, aVal, hPct, aPct, hDisplay, aDisplay };
  }).filter(Boolean);

  if (rows.length === 0) return null;

  return (
    <div className="match-stats">
      {rows.map(({ label, hPct, aPct, hDisplay, aDisplay }) => (
        <div key={label} className="stat-row">
          <div className="stat-val home">{hDisplay}</div>
          <div className="bar-track home">
            <div className="bar-fill home" style={{ width: `${Math.min(hPct, 100)}%` }} />
          </div>
          <div className="stat-label">{label}</div>
          <div className="bar-track away">
            <div className="bar-fill away" style={{ width: `${Math.min(aPct, 100)}%` }} />
          </div>
          <div className="stat-val away">{aDisplay}</div>
        </div>
      ))}
    </div>
  );
}

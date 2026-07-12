/**
 * HeadToHead — W/D/L dots for the last N meetings.
 *
 * @param {{ matches: any[], homeTeamId: number }} props
 *   matches — array of past meetings from football-data.org head2head endpoint
 *   homeTeamId — the home team's ID so we can compute W/D/L from their perspective
 */
export default function HeadToHead({ matches, homeTeamId }) {
  if (!matches || matches.length === 0) return null;

  // Take last 5, most recent first (API returns oldest first)
  const last5 = [...matches].sort(
    (a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime()
  ).slice(0, 5);

  const results = last5.map((m) => {
    const homeGoals = m.score?.fullTime?.home ?? 0;
    const awayGoals = m.score?.fullTime?.away ?? 0;
    const isHome = m.homeTeam?.id === homeTeamId;
    const scored = isHome ? homeGoals : awayGoals;
    const conceded = isHome ? awayGoals : homeGoals;

    if (scored > conceded) return 'W';
    if (scored < conceded) return 'L';
    return 'D';
  });

  const wins = results.filter((r) => r === 'W').length;
  const draws = results.filter((r) => r === 'D').length;
  const losses = results.filter((r) => r === 'L').length;

  const teamName = last5[0]?.homeTeam?.id === homeTeamId
    ? last5[0]?.homeTeam?.shortName || last5[0]?.homeTeam?.name
    : last5[0]?.awayTeam?.shortName || last5[0]?.awayTeam?.name;

  return (
    <div className="h2h">
      {results.map((r, i) => (
        <div key={i} className={`h2h-dot ${r.toLowerCase()}`}>{r}</div>
      ))}
      <div className="h2h-note">
        {wins}W · {draws}D · {losses}L
        {teamName ? ` (${teamName} perspective)` : ''}
      </div>
    </div>
  );
}

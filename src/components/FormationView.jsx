/**
 * FormationView — renders both teams' lineups on a mini pitch.
 *
 * @param {{ lineups: { home, away } | null, isScheduled: boolean }} props
 */
export default function FormationView({ lineups, isScheduled }) {
  // Show placeholder for scheduled matches without lineup data
  if (!lineups) {
    return (
      <div className="formation-placeholder">
        {isScheduled
          ? 'Lineups confirmed closer to kickoff'
          : 'Lineup data unavailable'}
      </div>
    );
  }

  const { home, away } = lineups;

  return (
    <div className="formation-header">
      <div className="formation-labels">
        <span className="formation-label home">
          {home?.team?.name} <span className="formation-string">{home?.formation}</span>
        </span>
        <span className="formation-label away">
          <span className="formation-string">{away?.formation}</span> {away?.team?.name}
        </span>
      </div>
      <div className="pitch">
        {/* Halfway line and center circle are drawn via CSS ::before / ::after */}

        {/* HOME team — positioned from bottom up */}
        <FormationRows
          startingXI={home?.startXI ?? []}
          formation={home?.formation}
          side="home"
          fromBottom={true}
        />

        {/* AWAY team — positioned from top down */}
        <FormationRows
          startingXI={away?.startXI ?? []}
          formation={away?.formation}
          side="away"
          fromBottom={false}
        />
      </div>
    </div>
  );
}

/**
 * Parses a formation string like "4-3-3" and distributes players into rows.
 * Row 0 = GK (always 1 player), then defense, midfield, attack rows.
 */
function FormationRows({ startingXI, formation, side, fromBottom }) {
  if (!startingXI || startingXI.length === 0) return null;

  // Parse formation: "4-3-3" → [1, 4, 3, 3]
  const formationNums = formation
    ? [1, ...formation.split('-').map(Number)]
    : [1, 4, 3, 3]; // fallback

  // Group players into rows
  const rows = [];
  let idx = 0;
  for (const count of formationNums) {
    const row = [];
    for (let i = 0; i < count && idx < startingXI.length; i++, idx++) {
      row.push(startingXI[idx]);
    }
    rows.push(row);
  }

  // For home (fromBottom): GK is near bottom (high top%), attack near center (low top%)
  // For away (fromBottom=false): GK near top (low top%), attack near center (high top%)
  const totalRows = rows.length;

  return (
    <>
      {rows.map((row, rowIdx) => {
        // Home: GK at ~90%, lines go up toward 55%
        // Away: GK at ~8%, lines go down toward 44%
        let topPct;
        if (fromBottom) {
          // GK at 90%, next rows step up by roughly equal spacing across 90→55%
          const spacing = (90 - 55) / Math.max(totalRows - 1, 1);
          topPct = 90 - rowIdx * spacing;
        } else {
          // GK at 8%, next rows step down toward 44%
          const spacing = (44 - 8) / Math.max(totalRows - 1, 1);
          topPct = 8 + rowIdx * spacing;
        }

        return (
          <div
            key={rowIdx}
            className="pitch-row"
            style={{ top: `${topPct}%` }}
          >
            {row.map((player, pIdx) => {
              const p = player?.player || player;
              const number = p?.number ?? p?.id ?? pIdx + 1;
              const name = (p?.name || p?.lastName || '').toUpperCase().split(' ').pop() || '?';
              return (
                <div key={pIdx} className="player-dot">
                  <div className={`player-mark ${side}`}>{number}</div>
                  <div className="player-name">{name}</div>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}

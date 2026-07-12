import { useState, useEffect, useMemo } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useFixtures } from './hooks/useFixtures'
import { COMPETITIONS } from './config/competitions'
import CompetitionSelector from './components/CompetitionSelector'
import FixtureList from './components/FixtureList'
import MatchDetail from './components/MatchDetail'

import { findNextFixture } from './utils/matchStatus.js'

import Hero from './components/HeroScene'

/**
 * ⚠️  KNOWN ASSUMPTION — season is hard-coded to 2026.
 * When season selection is added, lift this into a second useState and pass
 * the season value to both useFixtures and a future SeasonSelector component.
 */
const CURRENT_YEAR = new Date().getFullYear();

function FixturesView() {
  // Controlled selection: defaults to the first featured competition.
  const [selectedCode, setSelectedCode] = useState(COMPETITIONS[0].code)

  // Season state
  const [season, setSeason] = useState(CURRENT_YEAR)

  // Search query state
  const [searchQuery, setSearchQuery] = useState('')

  const { fixtures, loading, error } = useFixtures(selectedCode, season)

  // Reset search query when competition changes
  useEffect(() => {
    setSearchQuery('');
  }, [selectedCode]);

  // football-data.org wraps the array under a `matches` key.
  // ⚠️  KNOWN ASSUMPTION: if the API shape changes, this single line is the only place to update.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fixturesData = fixtures as { matches?: any[] } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches: any[] = Array.isArray(fixturesData?.matches) ? fixturesData.matches : []

  // Calculate the next upcoming match
  const nextMatch = useMemo(() => findNextFixture(matches), [matches])

  // Filter and sort matches based on search query
  const filteredMatches = useMemo(() => {
    let result = matches;
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      result = matches.filter((match) => {
        const home = (match.homeTeam.shortName || match.homeTeam.name || '').toLowerCase();
        const away = (match.awayTeam.shortName || match.awayTeam.name || '').toLowerCase();
        return home.includes(query) || away.includes(query);
      });
    }
    // Sort from latest to oldest (newest date first)
    return [...result].sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime());
  }, [matches, searchQuery]);

  return (
    <>
      {/* ── Top Header (Logo, dropdown league selector) ── */}
      <CompetitionSelector
        selectedCode={selectedCode}
        onSelect={setSelectedCode}
        season={season}
        onSeasonSelect={setSeason}
      />

      {/* ── Hero static scene ── */}
      <Hero nextMatch={nextMatch} loading={loading} />

      {/* ── Error states are handled gracefully inside FixtureList instead of as a banner ── */}

      {/* ── Fixture list ── */}
      <main id="fixture-panel" role="tabpanel" aria-label="Fixtures" className="section">
        <div className="section-head">
          <div className="section-title">FIXTURES & RESULTS</div>
          <input
            type="text"
            className="search"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search teams"
          />
        </div>

        <FixtureList matches={filteredMatches} loading={loading} error={error} />
      </main>
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<FixturesView />} />
      <Route path="/match/:matchId" element={<MatchDetail />} />
    </Routes>
  )
}

export default App

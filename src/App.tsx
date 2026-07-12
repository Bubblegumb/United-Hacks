import { useState, lazy, Suspense } from 'react'
import { useFixtures } from './hooks/useFixtures'
import { COMPETITIONS } from './config/competitions.tsx'
import CompetitionSelector from './components/CompetitionSelector'
import FixtureList from './components/FixtureList'
import Countdown from './components/Countdown'
import './styles/App.css'

/**
 * HeroScene is lazy-loaded so that Three.js and @react-three/fiber are
 * excluded from the initial JS bundle.
 *
 * bundle-dynamic-imports: heavy 3D runtime loaded only when needed.
 */
const HeroScene = lazy(() => import('./components/HeroScene'))

/**
 * Shimmer placeholder shown while HeroScene's chunk is downloading.
 * Defined at module scope (rerender-no-inline-components).
 */
function HeroSceneShimmer() {
  return <div className="hero-scene-shimmer" aria-hidden="true"><div className="hero-scene-shimmer__ball" /></div>
}

/**
 * ⚠️  KNOWN ASSUMPTION — season is hard-coded to 2026.
 * When season selection is added, lift this into a second useState and pass
 * the season value to both useFixtures and a future SeasonSelector component.
 */
const SEASON = 2026

function App() {
  // Controlled selection: defaults to the first featured competition.
  const [selectedCode, setSelectedCode] = useState(COMPETITIONS[0].code)

  const { fixtures, loading, error } = useFixtures(selectedCode, SEASON)

  // football-data.org wraps the array under a `matches` key.
  // ⚠️  KNOWN ASSUMPTION: if the API shape changes, this single line is the only place to update.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fixturesData = fixtures as { matches?: any[] } | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const matches: any[] = Array.isArray(fixturesData?.matches) ? fixturesData.matches : []

  return (
    <>
      {/* ── Competition tab bar ── */}
      <CompetitionSelector
        selectedCode={selectedCode}
        onSelect={setSelectedCode}
      />

      {/* ── Hero 3D scene ── */}
      {/* Suspense boundary is isolated — a loading or error state here        */}
      {/* NEVER affects the Countdown or FixtureList below it.                 */}
      {/* async-suspense-boundaries: stream the 3D section independently.      */}
      <Suspense fallback={<HeroSceneShimmer />}>
        <HeroScene />
      </Suspense>

      {/* ── Countdown to next match ── */}
      <Countdown fixtures={matches} loading={loading} />

      {/* ── Error banner ── */}
      {/* 429 Rate Limit errors are handled gracefully inside FixtureList instead of as a banner */}
      {error && !error.includes('Rate limit') ? (
        <div role="alert" className="app-error">
          {error}
        </div>
      ) : null}

      {/* ── Fixture grid ── */}
      <main id="fixture-panel" role="tabpanel" aria-label="Fixtures" className="app-main">
        <FixtureList matches={matches} loading={loading} error={error} />
      </main>
    </>
  )
}

export default App

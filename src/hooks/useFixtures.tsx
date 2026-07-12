import { useState, useEffect } from 'react';
import { getFixtures } from '../api/footballApi';

interface UseFixturesResult {
  fixtures: unknown | null;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook that fetches fixtures for a competition + season.
 *
 * Re-fetches automatically when competitionCode or season changes.
 * Cancels any in-flight request via AbortController if the inputs change
 * before the previous fetch resolves (prevents stale data races).
 *
 * @param competitionCode  e.g. 'WC', 'PL', 'CL'
 * @param season           Optional start-year of the season, e.g. 2026
 */
export function useFixtures(
  competitionCode: string,
  season?: string | number
): UseFixturesResult {
  const [fixtures, setFixtures] = useState<unknown | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if we have no competition code
    if (!competitionCode) return;

    // AbortController lets us cancel the fetch if the effect re-runs
    // (i.e. competitionCode or season changed) before the previous call finished.
    const controller = new AbortController();

    async function fetchFixtures() {
      setLoading(true);
      setError(null);
      setFixtures(null);

      // Check cache first (TTL: 5 minutes)
      const cacheKey = `fixtures_cache_${competitionCode}_${season || 'default'}`;
      try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // 5 minutes = 300,000 ms
          if (age < 300_000) {
            setFixtures(data);
            setLoading(false);
            return; // Exit early, no network request needed
          } else {
            // Cache expired, remove it
            sessionStorage.removeItem(cacheKey);
          }
        }
      } catch (e) {
        // Ignore cache read errors (e.g., malformed JSON or quota exceeded)
        console.warn('Failed to read from cache', e);
      }

      try {
        const data = await getFixtures(competitionCode, season, controller.signal);
        // Only update state if this effect hasn't been cleaned up yet
        setFixtures(data);

        // Save to cache
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ data, timestamp: Date.now() })
          );
        } catch (e) {
          console.warn('Failed to write to cache', e);
        }
      } catch (err: unknown) {
        // AbortError fires when cleanup() runs — it's expected, not a real error
        if (err instanceof Error && err.name === 'AbortError') return;

        // Detect 429 rate-limit from our error message (getFixtures throws with status code)
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes('429')) {
          setError('Rate limit reached (10 req/min on free tier). Please wait a minute and try again.');
        } else {
          setError(message || 'An unexpected error occurred while fetching fixtures.');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchFixtures();

    // Cleanup: abort the in-flight request when:
    //   - competitionCode or season changes (effect re-runs)
    //   - the component that uses this hook unmounts
    //
    // WHY THE DEPENDENCY ARRAY MATTERS:
    // React runs the effect after every render where [competitionCode, season]
    // has changed (by reference equality). Without it (empty []) the effect
    // only runs once — switching competitions would never re-fetch.
    // Without any array at all it would run after *every* render, hammering
    // the API. The dependency array is the contract that says exactly *when*
    // this side-effect should repeat.
    return () => {
      controller.abort();
    };
  }, [competitionCode, season]); // Re-run whenever either input changes

  return { fixtures, loading, error };
}

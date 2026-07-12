import { useState, useEffect, useRef } from 'react';
import {
  findFixtureByTeamsAndDate,
  getLineups,
  getMatchEvents,
  getMatchStats,
} from '../api/apiFootball';

const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED']);
const POLL_INTERVAL_MS = 60_000;
const CACHE_PREFIX = 'apifootball_cache_';

interface ApiFootballData {
  fixtureId: number | null;
  lineups: any | null;
  events: any[] | null;
  stats: any | null;
}

export interface ApiFootballResult extends ApiFootballData {
  loaded: boolean; // true once the attempt is complete (success or fail)
}

function getCacheKey(matchId: string) {
  return `${CACHE_PREFIX}${matchId}`;
}

function readCache(matchId: string): ApiFootballData | null {
  try {
    const raw = localStorage.getItem(getCacheKey(matchId));
    if (!raw) return null;
    const { data, timestamp, isLive } = JSON.parse(raw);
    // Live caches expire after 60s; finished caches never expire
    if (isLive && Date.now() - timestamp > POLL_INTERVAL_MS) return null;
    return data;
  } catch {
    return null;
  }
}

function writeCache(matchId: string, data: ApiFootballData, isLive: boolean) {
  try {
    localStorage.setItem(
      getCacheKey(matchId),
      JSON.stringify({ data, timestamp: Date.now(), isLive })
    );
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

/**
 * Fetches lineups, events, and stats from API-Football for a given match.
 * Caches responses in localStorage keyed by football-data.org matchId.
 * Silently swallows all errors — the page must remain functional without this data.
 */
export function useApiFootball(
  matchId: string | undefined,
  homeTeamName: string | undefined,
  awayTeamName: string | undefined,
  utcDate: string | undefined,
  status: string | undefined,
  competitionCode?: string,
  season?: number
): ApiFootballResult {
  const [data, setData] = useState<ApiFootballData>({
    fixtureId: null,
    lineups: null,
    events: null,
    stats: null,
  });
  const [loaded, setLoaded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = async (signal?: AbortSignal): Promise<ApiFootballData> => {
    if (!matchId || !homeTeamName || !awayTeamName || !utcDate) {
      return { fixtureId: null, lineups: null, events: null, stats: null };
    }

    const isLive = status ? LIVE_STATUSES.has(status) : false;

    // Check cache first
    const cached = readCache(matchId);
    if (cached) return cached;

    try {
      const dateStr = utcDate.split('T')[0]; // YYYY-MM-DD
      const fixtureId = await findFixtureByTeamsAndDate(
        homeTeamName,
        awayTeamName,
        dateStr,
        competitionCode,
        season,
        signal
      );

      if (!fixtureId) {
        return { fixtureId: null, lineups: null, events: null, stats: null };
      }

      const [lineups, events, stats] = await Promise.all([
        getLineups(fixtureId, signal).catch(() => null),
        getMatchEvents(fixtureId, signal).catch(() => []),
        getMatchStats(fixtureId, signal).catch(() => null),
      ]);

      const result: ApiFootballData = { fixtureId, lineups, events, stats };
      writeCache(matchId, result, isLive);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') throw err;
      // Silently swallow — no error UI for API-Football failures
      console.warn('[useApiFootball] fetch failed:', err);
      return { fixtureId: null, lineups: null, events: null, stats: null };
    }
  };

  useEffect(() => {
    if (!matchId || !homeTeamName || !awayTeamName || !utcDate) {
      setLoaded(true);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      const result = await fetchData(controller.signal).catch(() =>
        ({ fixtureId: null, lineups: null, events: null, stats: null })
      );

      if (!cancelled) {
        setData(result);
        setLoaded(true);
      }

      // Poll if live
      const isLive = status ? LIVE_STATUSES.has(status) : false;
      if (isLive && !cancelled) {
        pollRef.current = setTimeout(async () => {
          if (cancelled) return;
          // Clear cache for live match so we refetch
          try { localStorage.removeItem(getCacheKey(matchId!)); } catch {}
          const updated = await fetchData(controller.signal).catch(() =>
            ({ fixtureId: null, lineups: null, events: null, stats: null })
          );
          if (!cancelled) setData(updated);
        }, POLL_INTERVAL_MS);
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [matchId, homeTeamName, awayTeamName, utcDate, status, competitionCode, season]);

  return { ...data, loaded };
}

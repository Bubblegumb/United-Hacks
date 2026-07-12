import { useState, useEffect, useRef } from 'react';
import { getMatchDetail, getHeadToHead } from '../api/footballApi';

const LIVE_STATUSES = new Set(['IN_PLAY', 'PAUSED']);
const POLL_INTERVAL_MS = 60_000; // 60 seconds

export interface MatchDetailResult {
  match: any | null;
  h2h: any[] | null;
  loading: boolean;
  error: string | null;
}

/**
 * Fetches football-data.org match detail + head-to-head for a given matchId.
 * Polls every 60s if the match is live.
 */
export function useMatchDetail(matchId: string | undefined): MatchDetailResult {
  const [match, setMatch] = useState<any | null>(null);
  const [h2h, setH2h] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAll = async (signal?: AbortSignal) => {
    if (!matchId) return;
    try {
      const [matchData, h2hData] = await Promise.all([
        getMatchDetail(matchId, signal),
        getHeadToHead(matchId, 5, signal),
      ]);
      setMatch(matchData);
      // football-data.org returns { matches: [...] } for head2head
      setH2h(h2hData?.matches ?? h2hData?.aggregates?.numberOfMatches !== undefined
        ? h2hData.matches ?? []
        : []);
      return matchData;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    }
  };

  useEffect(() => {
    if (!matchId) return;

    let abortController = new AbortController();
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      const result = await fetchAll(abortController.signal);
      if (!cancelled) setLoading(false);

      // Schedule polling if live
      const scheduleNext = (matchData: any) => {
        if (!matchData || cancelled) return;
        if (LIVE_STATUSES.has(matchData.status)) {
          pollRef.current = setTimeout(async () => {
            if (cancelled) return;
            const updated = await fetchAll(abortController.signal);
            if (!cancelled) scheduleNext(updated);
          }, POLL_INTERVAL_MS);
        }
      };

      scheduleNext(result);
    };

    run();

    return () => {
      cancelled = true;
      abortController.abort();
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, [matchId]);

  return { match, h2h, loading, error };
}

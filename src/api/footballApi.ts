// Requests are proxied through /api/football-data/ (mapped to a Vercel Edge Function
// in production and Vite proxy in development). This keeps the API key hidden from the client.
const BASE_URL = '/api/football-data';

/**
 * Fetches fixtures (matches) for a specific competition (league) and season.
 * @param leagueId  The competition code (e.g. 'PL', 'WC', 'CL') or numeric ID.
 * @param season    The starting year of the season (e.g. 2026). Optional.
 * @param signal    Optional AbortSignal — pass one from AbortController to cancel the request.
 */
export async function getFixtures(
  leagueId: string | number,
  season?: string | number,
  signal?: AbortSignal
) {
  // Validate leagueId to prevent path traversal
  if (typeof leagueId === 'string' && !/^[a-zA-Z0-9-]+$/.test(leagueId)) {
    throw new Error('Invalid league ID');
  }

  const params = new URLSearchParams();
  if (season) {
    // Validate season format
    if (!/^\d+$/.test(String(season))) {
      throw new Error('Invalid season parameter');
    }
    params.append('season', String(season));
  }

  const qs = params.toString() ? `?${params.toString()}` : '';
  const url = `${BASE_URL}/competitions/${leagueId}/matches${qs}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal, // Forward the AbortSignal so fetch() can be cancelled
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to fetch matches: ${response.status} ${response.statusText}. ${errorText}`
    );
  }

  return response.json();
}

/**
 * Fetches a single match by its football-data.org match ID.
 */
export async function getMatchDetail(matchId: string | number, signal?: AbortSignal) {
  // Validate matchId format
  if (!/^\d+$/.test(String(matchId))) {
    throw new Error('Invalid match ID');
  }
  
  const url = `${BASE_URL}/matches/${matchId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to fetch match detail: ${response.status} ${response.statusText}. ${errorText}`);
  }

  return response.json();
}

/**
 * Fetches head-to-head record for a given match ID.
 * Returns the last N matches between the two teams.
 */
export async function getHeadToHead(matchId: string | number, limit = 5, signal?: AbortSignal) {
  // Validate parameters format
  if (!/^\d+$/.test(String(matchId))) {
    throw new Error('Invalid match ID');
  }
  if (!/^\d+$/.test(String(limit))) {
    throw new Error('Invalid limit parameter');
  }

  const url = `${BASE_URL}/matches/${matchId}/head2head?limit=${limit}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`Failed to fetch H2H: ${response.status} ${response.statusText}. ${errorText}`);
  }

  return response.json();
}

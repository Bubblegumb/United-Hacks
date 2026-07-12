// During development Vite proxies /api/** → https://api.football-data.org/v4/**
// (see vite.config.ts server.proxy). This avoids browser CORS restrictions.
// In production, replace this with your backend proxy URL.
const BASE_URL = '/api';

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
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    console.warn(
      'VITE_API_KEY is not set. Please define it in your .env.local file for local development, or in your Vercel project settings for production.'
    );
  }

  const params = new URLSearchParams();
  if (season) {
    params.append('season', String(season));
  }

  const qs = params.toString() ? `?${params.toString()}` : '';
  const url = `${BASE_URL}/competitions/${leagueId}/matches${qs}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-Auth-Token': apiKey || '',
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

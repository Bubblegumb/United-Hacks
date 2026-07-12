/**
 * API-Football (api-sports.io) integration.
 *
 * All requests are proxied through /apifootball → https://v3.football.api-sports.io
 * (configured in vite.config.ts) to avoid browser CORS restrictions.
 * The API key is injected at the Vite proxy level (server-side) via the configure hook.
 *
 * Free tier: 100 requests/day. Caching is handled in the hook layer (useApiFootball).
 */
const BASE_URL = '/apifootball';

/**
 * Maps football-data.org competition codes to API-Football league IDs.
 * Extend this as more competitions are added to the app.
 */
const LEAGUE_MAP: Record<string, number> = {
  WC: 1,     // FIFA World Cup
  PL: 39,    // Premier League
  CL: 2,     // Champions League
  EL: 3,     // UEFA Europa League
  EC: 4,     // UEFA European Championship
  CAN: 9,    // Copa América
  BL1: 78,   // Bundesliga
  SA: 135,   // Serie A
  FL1: 61,   // Ligue 1
  PD: 140,   // La Liga (Primera División)
  PPL: 94,   // Primeira Liga (Portugal)
  DED: 88,   // Eredivisie
  BSA: 71,   // Campeonato Brasileiro Série A
  FAC: 45,   // FA Cup
  CSL: 169,  // Chinese Super League
};

function getHeaders(): Record<string, string> {
  const key = import.meta.env.VITE_APIFOOTBALL_KEY;
  return {
    'x-apisports-key': key || '',
    'Accept': 'application/json',
  };
}

async function apiFetch(path: string, signal?: AbortSignal) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: getHeaders(),
    signal,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(`API-Football ${response.status}: ${errorText}`);
  }

  const json = await response.json();

  // Only throw on hard errors (not plan-restriction notices which still return data).
  // Plan errors look like: { errors: { plan: "Free plans do not have access..." } }
  // These are warnings, not fatal — the response array will simply be empty.
  if (json.errors && typeof json.errors === 'object' && !Array.isArray(json.errors)) {
    const keys = Object.keys(json.errors);
    // Throw only if there are errors OTHER than plan/token (those just mean empty data)
    const hardErrors = keys.filter(k => k !== 'plan' && k !== 'token' && k !== 'bug');
    if (hardErrors.length > 0) {
      const msg = hardErrors.map(k => json.errors[k]).join('; ');
      throw new Error(`API-Football error: ${msg}`);
    }
  }

  return json;
}

/** Normalise a team name for fuzzy matching. */
function normName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+(national\s+team|fc|sc|ac|cf|rc|united|city|town|albion|wanderers|athletic|athletico|hotspur)$/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Searches for an API-Football fixture ID matching the given teams and date.
 * Uses competition code + season for a targeted search instead of scanning
 * all fixtures worldwide for that date.
 *
 * @param homeTeamName  Home team name from football-data.org
 * @param awayTeamName  Away team name from football-data.org
 * @param dateStr       Match date in YYYY-MM-DD format
 * @param competitionCode  football-data.org competition code (e.g. 'WC', 'PL')
 * @param season        Season year (e.g. 2026)
 */
export async function findFixtureByTeamsAndDate(
  homeTeamName: string,
  awayTeamName: string,
  dateStr: string,
  competitionCode?: string,
  season?: number,
  signal?: AbortSignal
): Promise<number | null> {
  const params = new URLSearchParams();
  params.set('date', dateStr);

  // Try targeted search first: date + league + season (uses fewer of the 100 daily requests).
  // If the free plan blocks access (errors.plan), fall back to date-only search.
  const leagueId = competitionCode ? LEAGUE_MAP[competitionCode.toUpperCase()] : undefined;
  if (leagueId && season) {
    params.set('league', String(leagueId));
    params.set('season', String(season));
  }

  let data = await apiFetch(`/fixtures?${params.toString()}`, signal);

  if (
    leagueId &&
    data.errors?.plan &&
    (!Array.isArray(data.response) || data.response.length === 0)
  ) {
    console.info('[API-Football] Plan restriction on league/season — retrying with date only');
    data = await apiFetch(`/fixtures?date=${dateStr}`, signal);
  }

  if (data.errors?.plan) {
    console.warn(`[API-Football] Lineups unavailable: ${data.errors.plan}`);
  }

  if (!Array.isArray(data.response) || data.response.length === 0) return null;

  const homeNorm = normName(homeTeamName);
  const awayNorm = normName(awayTeamName);

  // First pass: exact normalised match
  let match = data.response.find((f: any) => {
    const h = normName(f.teams?.home?.name || '');
    const a = normName(f.teams?.away?.name || '');
    return h === homeNorm && a === awayNorm;
  });

  // Second pass: partial / substring match (handles "France" ↔ "France National Team")
  if (!match) {
    match = data.response.find((f: any) => {
      const h = normName(f.teams?.home?.name || '');
      const a = normName(f.teams?.away?.name || '');
      return (h.includes(homeNorm) || homeNorm.includes(h)) &&
             (a.includes(awayNorm) || awayNorm.includes(a));
    });
  }

  return match ? match.fixture.id : null;
}

/**
 * Fetches lineup data for an API-Football fixture ID.
 * Returns { home: LineupTeam, away: LineupTeam } or null.
 */
export async function getLineups(fixtureId: number, signal?: AbortSignal) {
  const data = await apiFetch(`/fixtures/lineups?fixture=${fixtureId}`, signal);
  if (!Array.isArray(data.response) || data.response.length < 2) return null;
  return { home: data.response[0], away: data.response[1] };
}

/**
 * Fetches match events (goals, cards, subs) for a fixture.
 */
export async function getMatchEvents(fixtureId: number, signal?: AbortSignal) {
  const data = await apiFetch(`/fixtures/events?fixture=${fixtureId}`, signal);
  if (!Array.isArray(data.response)) return [];
  return data.response;
}

/**
 * Fetches match statistics (possession, shots, etc.) for a fixture.
 */
export async function getMatchStats(fixtureId: number, signal?: AbortSignal) {
  const data = await apiFetch(`/fixtures/statistics?fixture=${fixtureId}`, signal);
  if (!Array.isArray(data.response) || data.response.length < 2) return null;
  return { home: data.response[0], away: data.response[1] };
}


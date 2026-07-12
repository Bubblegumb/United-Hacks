export const config = {
  runtime: 'edge',
};

const ALLOWED_PATHS = /^\/[a-zA-Z0-9\/\-_]+$/;
const ALLOWED_PARAMS = new Set(['date', 'league', 'season', 'fixture']);

export default async function handler(request: Request) {
  // CORS check / preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Accept',
      },
    });
  }

  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Extract subpath
  const subpath = pathname.replace(/^\/api\/api-football/, '');

  // 1. Path Validation & Traversal Prevention
  if (!ALLOWED_PATHS.test(subpath) || subpath.includes('..')) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 2. Secret Verification (retrieved securely from server environment variables)
  const apiKey = process.env.APIFOOTBALL_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Server configuration error: missing API key' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // 3. Query Parameter Validation & Sanitization
  const targetUrl = new URL(`https://v3.football.api-sports.io${subpath}`);
  url.searchParams.forEach((value, key) => {
    if (ALLOWED_PARAMS.has(key)) {
      // Validate value to make sure it's alphanumeric/numeric (prevent query parameter injection)
      if (/^[a-zA-Z0-9\-]+$/.test(value)) {
        targetUrl.searchParams.append(key, value);
      }
    }
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey,
        'Accept': 'application/json',
      },
    });

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { error: await response.text() };
    }

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch data from upstream API' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

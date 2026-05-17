import { API_ENDPOINTS, getApiUrl } from '@/config/apiEndpoints';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'Authentication request failed');
  }

  return payload;
}

export async function getGithubAuthUrl(state) {
  const url = new URL(getApiUrl(API_ENDPOINTS.auth.github));

  if (state) {
    url.searchParams.set('state', state);
  }

  url.searchParams.set('redirect', 'false');

  const payload = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  }).then(parseJsonResponse);

  return payload.data.authUrl;
}

export async function authenticateGithubCallback(code) {
  const url = new URL(getApiUrl(API_ENDPOINTS.auth.githubCallback));
  url.searchParams.set('code', code);
  url.searchParams.set('response', 'json');

  const payload = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  }).then(parseJsonResponse);

  return payload.data;
}

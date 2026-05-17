import { API_ENDPOINTS, getApiUrl } from '@/config/apiEndpoints';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'Repository analysis failed');
  }

  return payload;
}

export async function analyzeRoast({ accessToken, openAiApiKey, roastId }) {
  const body = openAiApiKey ? { openAiApiKey } : {};

  const payload = await fetch(getApiUrl(API_ENDPOINTS.roasts.analyze(roastId)), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }).then(parseJsonResponse);

  return payload.data;
}

export async function getRoastHistory({ accessToken, limit = 10, page = 1, search = '' }) {
  const url = new URL(getApiUrl(API_ENDPOINTS.roasts.history));
  url.searchParams.set('page', page);
  url.searchParams.set('limit', limit);

  if (search) {
    url.searchParams.set('search', search);
  }

  const payload = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(parseJsonResponse);

  return payload.data;
}

export async function getRoastDetail({ accessToken, roastId }) {
  const payload = await fetch(getApiUrl(API_ENDPOINTS.roasts.detail(roastId)), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(parseJsonResponse);

  return payload.data;
}

export async function deleteRoast({ accessToken, roastId }) {
  const payload = await fetch(getApiUrl(API_ENDPOINTS.roasts.detail(roastId)), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(parseJsonResponse);

  return payload.data;
}

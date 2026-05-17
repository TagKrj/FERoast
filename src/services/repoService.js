import { API_ENDPOINTS, getApiUrl } from '@/config/apiEndpoints';

async function parseJsonResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || 'Repository check failed');
  }

  return payload;
}

export async function checkRepository(repoUrl, accessToken) {
  const payload = await fetch(getApiUrl(API_ENDPOINTS.repos.check), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl }),
  }).then(parseJsonResponse);

  return payload.data;
}

export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getApiUrl(path) {
  if (!API_BASE_URL) {
    throw new Error('Missing VITE_API_URL. Please set the backend base URL in .env and restart the dev server.');
  }

  return `${API_BASE_URL}${path}`;
}

export const API_ENDPOINTS = {
  auth: {
    github: '/api/auth/github',
    githubCallback: '/api/auth/github/callback',
  },
  repos: {
    check: '/api/repos/check',
  },
};

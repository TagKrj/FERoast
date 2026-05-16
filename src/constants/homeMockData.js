export const HOME_ANALYSIS_SCENARIOS = {
  large: {
    repoUrl: 'github.com/owner/repo',
    apiKey: 'AIzaSyDHVkwv_PBa1qrYHMv7sqD2bqp3ZbD_88D',
    showApiError: true,
    branch: 'main',
    fileCount: 1934,
    totalBytes: 12345678,
    size: 'Large',
    sizeTone: 'danger',
    sizeReason: 'Repository is large enough to require a personal OpenAI API key',
    advice: 'Use a personal OpenAI API key to improve analysis quality for large repositories',
  },
  mediumWarning: {
    repoUrl: 'github.com/owner/repo',
    apiKey: 'AIzaSyDHVkwv_PBa1qrYHMv7sqD2bqp3ZbD_88D',
    showApiError: false,
    branch: 'main',
    fileCount: 1934,
    totalBytes: 12345678,
    size: 'Medium',
    sizeTone: 'warning',
    sizeReason: 'Repository is large enough to require a personal OpenAI API key',
    advice: 'Use a personal OpenAI API key to improve analysis quality for large repositories',
  },
  mediumSafe: {
    repoUrl: 'github.com/owner/repo',
    apiKey: 'AIzaSyDHVkwv_PBa1qrYHMv7sqD2bqp3ZbD_88D',
    showApiError: false,
    branch: 'main',
    fileCount: 1934,
    totalBytes: 12345678,
    size: 'Medium',
    sizeTone: 'success',
    sizeReason: 'Repository is large enough to require a personal OpenAI API key',
    advice: 'Use a personal OpenAI API key to improve analysis quality for large repositories',
  },
  small: {
    repoUrl: 'github.com/owner/repo',
    apiKey: 'AIzaSyDHVkwv_PBa1qrYHMv7sqD2bqp3ZbD_88D',
    showApiError: false,
    branch: 'main',
    fileCount: 512,
    totalBytes: 2457600,
    size: 'Small',
    sizeTone: 'success',
    sizeReason: 'Repository is small enough to analyze without a personal GPT API key',
    advice: 'You can provide a personal GPT API key for better analysis, but it is optional',
  },
};

export const DEFAULT_HOME_ANALYSIS = HOME_ANALYSIS_SCENARIOS.mediumWarning;

export function getMockAnalysisByRepo(repoUrl) {
  const normalizedRepoUrl = repoUrl.toLowerCase();

  if (normalizedRepoUrl.includes('large')) {
    return HOME_ANALYSIS_SCENARIOS.large;
  }

  if (normalizedRepoUrl.includes('small')) {
    return HOME_ANALYSIS_SCENARIOS.small;
  }

  if (normalizedRepoUrl.includes('safe')) {
    return HOME_ANALYSIS_SCENARIOS.mediumSafe;
  }

  const scenarioKeys = ['large', 'mediumWarning', 'small'];
  const hash = Array.from(normalizedRepoUrl).reduce((total, character) => total + character.charCodeAt(0), 0);

  return HOME_ANALYSIS_SCENARIOS[scenarioKeys[hash % scenarioKeys.length]];
}

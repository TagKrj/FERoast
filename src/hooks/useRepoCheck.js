import { useCallback, useState } from 'react';

import { checkRepository } from '@/services/repoService';

const SIZE_TONE_BY_LABEL = {
  large: 'danger',
  medium: 'warning',
  small: 'success',
};

function mapRepoCheckToAnalysis(data, repoUrl) {
  const sizeLabel = data.check?.sizeLabel?.toLowerCase();

  return {
    advice: data.advice,
    branch: data.repository?.defaultBranch,
    fileCount: data.check?.fileCount,
    gptKeyRequired: Boolean(data.check?.gptKeyRequired),
    nextAction: data.check?.nextAction,
    repository: data.repository,
    repoUrl: data.repository?.htmlUrl || repoUrl,
    roastId: data.roastId,
    size: data.check?.sizeDisplay,
    sizeReason: data.check?.sizeReason,
    sizeTone: SIZE_TONE_BY_LABEL[sizeLabel] || 'warning',
    totalBytes: data.check?.totalBytes,
  };
}

export function useRepoCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState('');

  const checkRepo = useCallback(async ({ accessToken, repoUrl }) => {
    setIsChecking(true);
    setError('');

    try {
      const data = await checkRepository(repoUrl, accessToken);
      return mapRepoCheckToAnalysis(data, repoUrl);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkRepo,
    error,
    isChecking,
  };
}

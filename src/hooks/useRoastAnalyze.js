import { useCallback, useState } from 'react';

import { analyzeRoast } from '@/services/roastService';
import { mapRoastToResult } from '@/utils/roastMappers';

export function useRoastAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const analyze = useCallback(async ({ accessToken, openAiApiKey, roastId }) => {
    setIsAnalyzing(true);
    setError('');

    try {
      const data = await analyzeRoast({ accessToken, openAiApiKey, roastId });
      return mapRoastToResult(data);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyze,
    error,
    isAnalyzing,
  };
}

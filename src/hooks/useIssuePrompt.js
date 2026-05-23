import { useCallback, useState } from 'react';

import { generateIssuePrompt } from '@/services/roastService';
import { mapIssue } from '@/utils/roastMappers';

export function useIssuePrompt() {
  const [error, setError] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  const generatePrompt = useCallback(async ({ accessToken, issueId, regenerateInstruction, roastId }) => {
    setIsGeneratingPrompt(true);
    setError('');

    try {
      const data = await generateIssuePrompt({
        accessToken,
        issueId,
        regenerateInstruction,
        roastId,
      });

      return mapIssue(data.issue);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsGeneratingPrompt(false);
    }
  }, []);

  return {
    error,
    generatePrompt,
    isGeneratingPrompt,
  };
}

import { useCallback, useState } from 'react';

import { getRoastDetail, getRoastHistory } from '@/services/roastService';
import { mapHistoryItem, mapRoastToResult } from '@/utils/roastMappers';

export function useRoastHistory() {
  const [error, setError] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const loadHistory = useCallback(async ({ accessToken, limit, page, search }) => {
    setIsLoadingHistory(true);
    setError('');

    try {
      const data = await getRoastHistory({ accessToken, limit, page, search });
      return {
        items: data.items.map(mapHistoryItem),
        pagination: data.pagination,
      };
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const loadRoastDetail = useCallback(async ({ accessToken, roastId }) => {
    setIsLoadingDetail(true);
    setError('');

    try {
      const data = await getRoastDetail({ accessToken, roastId });
      return mapRoastToResult(data);
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  return {
    error,
    isLoadingDetail,
    isLoadingHistory,
    loadHistory,
    loadRoastDetail,
  };
}

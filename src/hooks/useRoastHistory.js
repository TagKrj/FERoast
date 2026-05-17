import { useCallback, useState } from 'react';

import { deleteRoast, getRoastDetail, getRoastHistory } from '@/services/roastService';
import { mapHistoryItem, mapRoastToResult } from '@/utils/roastMappers';

export function useRoastHistory() {
  const [error, setError] = useState('');
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const deleteRoastReport = useCallback(async ({ accessToken, roastId }) => {
    setIsDeleting(true);
    setError('');

    try {
      return await deleteRoast({ accessToken, roastId });
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    deleteRoastReport,
    error,
    isDeleting,
    isLoadingDetail,
    isLoadingHistory,
    loadHistory,
    loadRoastDetail,
  };
}

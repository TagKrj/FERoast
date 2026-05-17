import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';

import addCircleIcon from '@/assets/icons/Add Circle.svg';
import outIcon from '@/assets/icons/Out.svg';
import Pagination from '@/components/Pagination';
import { useAuth } from '@/hooks/useAuth';
import { useRoastHistory } from '@/hooks/useRoastHistory';

const HISTORY_PAGE_SIZE = 10;

const GRADE_CLASS = {
  A: 'text-[#049c6b]',
  'B+': 'text-[#ff981f]',
  B: 'text-[#ff981f]',
  C: 'text-[#ff981f]',
  'C+': 'text-[#ff981f]',
  D: 'text-[#f75555]',
  F: 'text-[#f75555]',
};

export default function HistoryPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const { accessToken, isAuthenticated, user } = useAuth();
  const { deleteRoastReport, isDeleting, isLoadingDetail, isLoadingHistory, loadHistory, loadRoastDetail } = useRoastHistory();
  const [currentPage, setCurrentPage] = useState(1);
  const [historyItems, setHistoryItems] = useState([]);
  const [pagination, setPagination] = useState({
    limit: HISTORY_PAGE_SIZE,
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const displayName = user?.github?.displayName || user?.name || user?.github?.username;

  const refreshHistory = useCallback(() => {
    if (!isAuthenticated || !accessToken) {
      return;
    }

    loadHistory({
      accessToken,
      limit: HISTORY_PAGE_SIZE,
      page: currentPage,
    })
      .then((data) => {
        setHistoryItems(data.items);
        setPagination(data.pagination);
      })
      .catch(() => {
        window.alert(t.history.loadFailed);
      });
  }, [accessToken, currentPage, isAuthenticated, loadHistory, t.history.loadFailed]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: '/history' }} />;
  }

  const openHistoryItem = async (item) => {
    try {
      const result = await loadRoastDetail({
        accessToken,
        roastId: item.id,
      });

      navigate('/result', {
        state: {
          fromHistory: true,
          result,
        },
      });
    } catch {
      window.alert(t.history.detailFailed);
    }
  };

  const handleDeleteItem = async (event, item) => {
    event.stopPropagation();

    if (!window.confirm(t.history.deleteConfirm)) {
      return;
    }

    try {
      await deleteRoastReport({
        accessToken,
        roastId: item.id,
      });
      window.alert(t.history.deleteSuccess);
      refreshHistory();
    } catch {
      window.alert(t.history.deleteFailed);
    }
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-[76px] shrink-0 basis-[76px] items-center justify-between gap-4 border-b border-[#dddddd] px-5 py-[18px]">
        <span className="min-w-0 truncate text-[16px] font-medium leading-6 text-[#212121]">{displayName || ''}</span>
        <button
          className="inline-flex h-10 w-fit min-w-[137px] shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-[100px] bg-[linear-gradient(180deg,#4d78fa_0%,#4d5dfa_100%)] px-4 text-[15px] font-light leading-[21px] tracking-[0] text-white shadow-[4px_8px_12px_rgba(77,93,250,0.25)] transition duration-150 hover:brightness-90 active:brightness-85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa] [text-shadow:4px_8px_24px_rgba(77,93,250,0.25)]"
          type="button"
          onClick={() => navigate('/')}
        >
          <img className="size-5" src={addCircleIcon} alt="" aria-hidden="true" />
          <span className="text-white">{t.home.newChat}</span>
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden bg-[rgba(77,93,250,0.02)] p-[15px]">
        <div className="flex h-[35px] shrink-0 items-center gap-4">
          <span className="size-[35px] shrink-0 rounded-full bg-[linear-gradient(180deg,#4d5dfa_0%,#4d90fa_43%,#4da6fa_64%,#4dd2fa_95%,#69dcff_100%)] shadow-[2px_5px_13.5px_3px_rgba(77,135,250,0.25)]" />
          <h1 className="m-0 text-[16px] font-medium leading-6 text-[#212121]">{t.sidebar.history}</h1>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-between gap-4">
          <div className="min-h-0 w-full max-w-[759px] overflow-y-auto px-5 py-1 [scrollbar-color:#d8d8d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d8d8] [&::-webkit-scrollbar-track]:bg-transparent">
            <div className="mx-auto flex max-w-[719px] flex-col gap-2.5">
              {isLoadingHistory && <p className="m-0 py-6 text-center text-[14px] font-light text-[#8f8f8f]">{t.history.loading}</p>}
              {!isLoadingHistory && historyItems.length === 0 && (
                <p className="m-0 py-6 text-center text-[14px] font-light text-[#8f8f8f]">{t.history.empty}</p>
              )}
              {!isLoadingHistory && historyItems.map((item) => (
                <div
                  className="flex h-[76px] w-full items-center overflow-hidden rounded-[15px] bg-white px-[25px] py-[17px] shadow-[0_0_4px_1px_rgba(0,0,0,0.1)] transition hover:bg-[#f7f7f7]"
                  key={item.id}
                >
                  <button
                    className="grid min-w-0 flex-1 grid-cols-[42px_minmax(0,1fr)] items-center gap-5 bg-transparent text-left leading-6 disabled:cursor-wait disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
                    type="button"
                    disabled={isLoadingDetail || isDeleting}
                    onClick={() => openHistoryItem(item)}
                  >
                    <span className={`text-[24px] font-medium ${GRADE_CLASS[item.grade] || 'text-[#212121]'}`}>{item.grade}</span>
                    <span className="flex h-[52px] flex-col items-start justify-between text-[16px]">
                      <span className="font-normal text-[#212121]">{item.repository}</span>
                      <span className="font-light text-[#a2a1a8]">{item.date}</span>
                    </span>
                  </button>
                  <button
                    className="group ml-4 inline-flex size-8 shrink-0 items-center justify-center bg-transparent disabled:cursor-wait disabled:opacity-60"
                    type="button"
                    disabled={isDeleting}
                    onClick={(event) => handleDeleteItem(event, item)}
                    aria-label={t.history.deleteConfirm}
                  >
                    <span
                      className="block size-[15px] bg-[#e1e1e1] transition group-hover:bg-[#f75555]"
                      style={{
                        mask: `url("${outIcon}") center / contain no-repeat`,
                        WebkitMask: `url("${outIcon}") center / contain no-repeat`,
                      }}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Pagination
            currentPage={currentPage}
            labels={t.history}
            pageSize={pagination.limit}
            total={pagination.total}
            totalPages={pagination.totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {isLoadingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" role="alert" aria-live="polite">
          <div className="w-full max-w-[420px] rounded-[15px] bg-white px-6 py-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
            <p className="m-0 text-[18px] font-medium leading-6 text-[#212121]">{t.history.loadingDetail}</p>
          </div>
        </div>
      )}
    </section>
  );
}

import { useState } from 'react';
import { Navigate, useNavigate, useOutletContext } from 'react-router-dom';

import addCircleIcon from '@/assets/icons/Add Circle.svg';
import Pagination from '@/components/Pagination';
import { HISTORY_ITEMS, HISTORY_PAGE_SIZE, HISTORY_TOTAL_COUNT } from '@/constants/historyMockData';
import { useAuth } from '@/hooks/useAuth';

const GRADE_CLASS = {
  A: 'text-[#049c6b]',
  'B+': 'text-[#ff981f]',
  B: 'text-[#ff981f]',
  C: 'text-[#ff981f]',
  D: 'text-[#f75555]',
  F: 'text-[#f75555]',
};

export default function HistoryPage() {
  const { t } = useOutletContext();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(HISTORY_TOTAL_COUNT / HISTORY_PAGE_SIZE);
  const displayName = user?.github?.displayName || user?.name || user?.github?.username;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ returnTo: '/history' }} />;
  }

  const openHistoryItem = (item) => {
    navigate('/result', {
      state: {
        analysis: item.analysis,
        fromHistory: true,
        result: item.result,
      },
    });
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

        <div className="flex min-h-0 flex-1 flex-col items-center justify-between">
          <div className="flex w-full max-w-[719px] flex-col gap-[5px]">
            {HISTORY_ITEMS.map((item) => (
              <button
                className="flex h-[76px] w-full items-center overflow-hidden rounded-[15px] bg-white px-[25px] py-[17px] text-left shadow-[0_0_4px_1px_rgba(0,0,0,0.1)] transition hover:bg-[#f4f4f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d5dfa]"
                type="button"
                key={item.id}
                onClick={() => openHistoryItem(item)}
              >
                <div className="flex w-[180px] items-center justify-between leading-6">
                  <span className={`text-[24px] font-medium ${GRADE_CLASS[item.grade] || 'text-[#212121]'}`}>{item.grade}</span>
                  <span className="flex h-[52px] flex-col items-start justify-between text-[16px]">
                    <span className="font-normal text-[#212121]">{item.repository}</span>
                    <span className="font-light text-[#a2a1a8]">{item.date}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            labels={t.history}
            pageSize={HISTORY_PAGE_SIZE}
            total={HISTORY_TOTAL_COUNT}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </section>
  );
}

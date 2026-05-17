import arrowDownIcon from '@/assets/icons/Arrow - Down 2.svg';

export default function Pagination({ currentPage = 1, labels, pageSize = 10, total = 0, totalPages = 1, onPageChange }) {
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);
  const pages = Array.from({ length: Math.min(totalPages, 4) }, (_, index) => index + 1);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <div className="flex w-full items-center justify-between text-[14px] font-light leading-[22px] text-[#a2a1a8]">
      <div className="flex items-center gap-5">
        <span>{labels.show}</span>
        <button
          className="inline-flex h-[46px] w-[76px] items-center justify-center gap-4 rounded-[10px] bg-white text-[#16151c] transition hover:bg-[#f4f4f4]"
          type="button"
        >
          <span>{pageSize}</span>
          <img className="size-5" src={arrowDownIcon} alt="" aria-hidden="true" />
        </button>
      </div>

      <p className="m-0 text-center">
        {labels.showing} {start} {labels.to} {end} {labels.of} {total}
      </p>

      <div className="flex items-center gap-2.5">
        <button
          className="inline-flex size-6 items-center justify-center rounded-full text-[#16151c] transition hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:text-[#c8c8c8]"
          type="button"
          disabled={currentPage === 1}
          onClick={() => goToPage(currentPage - 1)}
          aria-label={labels.previousPage}
        >
          ‹
        </button>
        <div className="flex items-start gap-[5px]">
          {pages.map((page) => {
            const isActive = page === currentPage;

            return (
              <button
                className={`inline-flex h-9 min-w-[35px] items-center justify-center rounded-[8px] px-3 text-[14px] leading-[22px] transition hover:bg-[#f4f4f4] ${
                  isActive ? 'border border-[#212121] bg-white font-semibold text-[#212121]' : 'border border-transparent bg-transparent font-light text-[#16151c]'
                }`}
                type="button"
                key={page}
                onClick={() => goToPage(page)}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          className="inline-flex size-6 items-center justify-center rounded-full text-[#16151c] transition hover:bg-[#f4f4f4] disabled:cursor-not-allowed disabled:text-[#c8c8c8]"
          type="button"
          disabled={currentPage === totalPages}
          onClick={() => goToPage(currentPage + 1)}
          aria-label={labels.nextPage}
        >
          ›
        </button>
      </div>
    </div>
  );
}

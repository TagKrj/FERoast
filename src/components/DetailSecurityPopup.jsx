import outIcon from '@/assets/icons/Out.svg';

const SEVERITY_CLASS = {
  High: 'text-[#f75555]',
  Medium: 'text-[#ff981f]',
  Low: 'text-[#049c6b]',
};

export default function DetailSecurityPopup({ labels, onClose, row, title = 'Detail Security' }) {
  if (!row) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-[560px] rounded-[15px] bg-white p-5 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="m-0 text-[18px] font-medium leading-6 text-[#212121]">{title}</h2>
          <button
            className="group inline-flex size-7 items-center justify-center bg-transparent"
            type="button"
            onClick={onClose}
            aria-label={labels.close}
          >
            <span
              className="block size-[14px] bg-[#1C274C] transition group-hover:bg-[#4d5dfa]"
              style={{
                mask: `url("${outIcon}") center / contain no-repeat`,
                WebkitMask: `url("${outIcon}") center / contain no-repeat`,
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="grid gap-3 text-[15px] leading-5 text-[#212121]">
          <DetailItem label="#" value={row.id} />
          <DetailItem label={labels.filePath} value={row.filePath} />
          <DetailItem label={labels.typeCodeSmell} value={row.type} />
          <DetailItem label={labels.description} value={row.description} />
          <DetailItem label={labels.line} value={row.line} />
          <DetailItem label={labels.severity} value={row.severity} valueClassName={SEVERITY_CLASS[row.severity] || 'text-[#212121]'} />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, valueClassName = 'text-[#212121]' }) {
  return (
    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3">
      <span className="font-normal text-[#8f8f8f]">{label}</span>
      <span className={`font-light ${valueClassName}`}>{value}</span>
    </div>
  );
}

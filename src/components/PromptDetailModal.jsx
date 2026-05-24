import copyIcon from '@/assets/icons/Copy.svg';
import outIcon from '@/assets/icons/Out.svg';
import starsMinimalIcon from '@/assets/icons/Stars Minimalistic.svg';
import starsIcon from '@/assets/icons/Stars.svg';

export default function PromptDetailModal({
  hasCopiedPrompt,
  hasPrompt,
  isGenerating,
  labels,
  onClose,
  onCopy,
  onRegenerate,
  onRefinementChange,
  prompt,
  refinement,
  row,
}) {
  if (!row) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-5" role="dialog" aria-modal="true" aria-label={labels.prompt.openDetail}>
      <div className="flex h-[min(720px,calc(100vh-48px))] w-full max-w-[1040px] flex-col overflow-hidden rounded-[15px] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.2)]">
        <div className="flex h-[64px] shrink-0 items-center justify-between border-b border-[#e5e5e5] px-6">
          <div className="min-w-0">
            <h2 className="m-0 text-[18px] font-medium leading-6 text-[#212121]">{labels.detailIssues}</h2>
            <p className="m-0 mt-1 truncate text-[12px] font-light leading-5 text-[#8f8f8f]">{row.filePath}</p>
          </div>
          <button
            className="group inline-flex size-8 shrink-0 items-center justify-center bg-transparent"
            type="button"
            onClick={onClose}
            aria-label={labels.prompt.closeDetail}
          >
            <span
              className="block size-4 bg-[#8f8f8f] transition group-hover:bg-[#4d5dfa]"
              style={{
                mask: `url("${outIcon}") center / contain no-repeat`,
                WebkitMask: `url("${outIcon}") center / contain no-repeat`,
              }}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] gap-5 bg-[rgba(77,93,250,0.02)] p-5">
          <aside className="min-h-0 overflow-auto rounded-[12px] bg-white p-4 shadow-[0_0_4px_1px_rgba(0,0,0,0.08)] [scrollbar-color:#eeeeee_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#eeeeee] [&::-webkit-scrollbar-track]:bg-transparent">
            <p className="m-0 text-[13px] font-medium leading-6 text-[#212121]">{labels.prompt.issueDetail}</p>
            <dl className="mt-3 grid gap-3 text-[12px] leading-5">
              <div>
                <dt className="font-medium text-[#8f8f8f]">{labels.table.typeCodeSmell}</dt>
                <dd className="m-0 mt-1 font-light text-[#212121]">{row.type}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#8f8f8f]">{labels.table.description}</dt>
                <dd className="m-0 mt-1 font-light text-[#212121]">{row.description}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#8f8f8f]">{labels.file}</dt>
                <dd className="m-0 mt-1 font-light text-[#212121]">{row.filePath}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#8f8f8f]">{labels.line}</dt>
                <dd className="m-0 mt-1 font-light text-[#212121]">{row.line}</dd>
              </div>
              <div>
                <dt className="font-medium text-[#8f8f8f]">{labels.suggestionsTitle}</dt>
                <dd className="m-0 mt-1 font-light text-[#212121]">{row.suggestion || labels.noSuggestion}</dd>
              </div>
            </dl>
          </aside>

          <div className="flex min-h-0 flex-col gap-4">
            <form className="rounded-[12px] bg-white p-3 shadow-[0_0_4px_1px_rgba(0,0,0,0.08)]" onSubmit={onRegenerate}>
              <label className="flex min-h-[96px] overflow-hidden rounded-[10px] border border-[#dddddd] bg-white">
                <span className="sr-only">{labels.prompt.regenerateReason}</span>
                <span className="flex w-10 shrink-0 justify-center pt-3">
                  <img className="size-5" src={starsIcon} alt="" aria-hidden="true" />
                </span>
                <textarea
                  className="min-h-[96px] flex-1 resize-none border-0 bg-transparent px-2 py-3 text-[13px] font-light leading-6 text-[#212121] outline-none placeholder:text-[#8f8f8f]"
                  value={refinement}
                  onChange={(event) => onRefinementChange(event.target.value)}
                  placeholder={labels.prompt.regenerateReason}
                />
                <button
                  className="flex w-12 shrink-0 items-center justify-center bg-[linear-gradient(180deg,#4da1fa_0%,#4d74fa_32%,#4d5dfa_100%)] transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
                  type="submit"
                  disabled={isGenerating}
                  aria-label={labels.prompt.regenerate}
                >
                  <img className="size-5 brightness-0 invert" src={starsMinimalIcon} alt="" aria-hidden="true" />
                </button>
              </label>
            </form>

            <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] bg-[#14183b] p-4 text-white shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="m-0 text-[13px] font-medium leading-6 text-white">{labels.prompt.fullPrompt}</h3>
                <div className="flex items-center gap-2">
                  {hasCopiedPrompt && <span className="rounded-[5px] bg-white/10 px-2 py-0.5 text-[11px] font-light leading-5 text-white">{labels.prompt.copied}</span>}
                  <button className="inline-flex size-8 items-center justify-center rounded-[8px] bg-white/10 transition hover:bg-white/15" type="button" onClick={onCopy} aria-label={labels.prompt.fullPrompt}>
                    <img className="size-5" src={copyIcon} alt="" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <pre className={`m-0 min-h-0 flex-1 overflow-auto whitespace-pre-wrap pr-3 font-['Roboto_Mono',monospace] text-[13px] font-normal leading-6 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35 [&::-webkit-scrollbar-track]:bg-transparent ${hasPrompt ? 'text-white' : 'text-white/50'}`}>
                {prompt}
              </pre>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

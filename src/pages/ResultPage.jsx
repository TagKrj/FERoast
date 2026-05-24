import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import addCircleIcon from '@/assets/icons/Add Circle.svg';
import bugIcon from '@/assets/icons/Bug.svg';
import bugVectorIcon from '@/assets/icons/Bugvector.svg';
import codeIcon from '@/assets/icons/Code.svg';
import copyIcon from '@/assets/icons/Copy.svg';
import dangerIcon from '@/assets/icons/Danger Triangle.svg';
import fileTextIcon from '@/assets/icons/File Text.svg';
import forbiddenIcon from '@/assets/icons/Forbidden Circle.svg';
import infoIcon from '@/assets/icons/Info Circle.svg';
import lightbulbIcon from '@/assets/icons/Lightbulb Minimalistic.svg';
import linkIcon from '@/assets/icons/Link.svg';
import maximizeIcon from '@/assets/icons/Maximize.svg';
import securityIcon from '@/assets/icons/Shield Network.svg';
import starsMinimalIcon from '@/assets/icons/Stars Minimalistic.svg';
import starsIcon from '@/assets/icons/Stars.svg';
import PromptDetailModal from '@/components/PromptDetailModal';
import { buildResultMock } from '@/constants/resultMockData';
import { useAuth } from '@/hooks/useAuth';
import { useIssuePrompt } from '@/hooks/useIssuePrompt';

const ISSUE_TYPES = {
  codeSmell: 'codeSmell',
  security: 'security',
};

const EMPTY_ROWS = [];

const GRADE_CLASS = {
  A: 'text-[#049c6b]',
  'B+': 'text-[#ff981f]',
  B: 'text-[#ff981f]',
  C: 'text-[#ff981f]',
  'C+': 'text-[#ff981f]',
  D: 'text-[#f75555]',
  F: 'text-[#f75555]',
};

const SEVERITY_CLASS = {
  High: 'text-[#f75555]',
  Medium: 'text-[#ff981f]',
  Low: 'text-[#049c6b]',
};

const SEVERITY_BORDER_CLASS = {
  High: 'border-[#f75555] text-[#f75555]',
  Medium: 'border-[#ff981f] text-[#ff981f]',
  Low: 'border-[#049c6b] text-[#049c6b]',
};

const SEVERITY_BADGE_CLASS = {
  High: 'bg-[#ffe7e7] text-[#f75555]',
  Medium: 'bg-[#fff1df] text-[#ff981f]',
  Low: 'bg-[#e7f7f1] text-[#049c6b]',
};

function normalizeSeverity(severity) {
  if (!severity) {
    return 'Medium';
  }

  const normalized = String(severity).trim().toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function ResultPage() {
  const { t } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { generatePrompt, isGeneratingPrompt } = useIssuePrompt();
  const initialResult = useMemo(() => location.state?.result ?? buildResultMock(location.state?.analysis), [location.state]);
  const [result, setResult] = useState(initialResult);
  const [activeIssueType, setActiveIssueType] = useState(ISSUE_TYPES.codeSmell);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [refinement, setRefinement] = useState('');
  const [promptMode, setPromptMode] = useState('generate');
  const [promptSeconds, setPromptSeconds] = useState(0);
  const refineInputRef = useRef(null);

  const labels = t.result;
  const codeSmellRows = result.codeSmells || EMPTY_ROWS;
  const securityRows = result.securityIssues || EMPTY_ROWS;
  const activeRows = activeIssueType === ISSUE_TYPES.codeSmell ? codeSmellRows : securityRows;
  const activeSeverityCounts = activeIssueType === ISSUE_TYPES.codeSmell
    ? result.codeSmellSeverityCounts
    : result.securitySeverityCounts;
  const selectedRow = activeRows.find((row) => row.id === selectedRowId) || activeRows[0] || null;
  const selectedPrompt = selectedRow?.fixPrompt?.trim() || '';
  const hasPrompt = Boolean(selectedPrompt);
  const fallbackSeverityCounts = useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };

    [...codeSmellRows, ...securityRows].forEach((row) => {
      const severity = normalizeSeverity(row.severity);
      counts[severity] = (counts[severity] || 0) + 1;
    });

    return counts;
  }, [codeSmellRows, securityRows]);
  const severityCounts = result.severityCounts || fallbackSeverityCounts;
  const prompt = hasPrompt ? selectedPrompt : labels.prompt.placeholder;

  useEffect(() => {
    setResult(initialResult);
  }, [initialResult]);

  useEffect(() => {
    setSelectedRowId(activeRows[0]?.id ?? null);
  }, [activeIssueType, activeRows]);

  useEffect(() => {
    setHasCopiedPrompt(false);
  }, [prompt]);

  useEffect(() => {
    if (!isGeneratingPrompt) {
      setPromptSeconds(0);
      return undefined;
    }

    setPromptSeconds(0);
    const timerId = window.setInterval(() => {
      setPromptSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isGeneratingPrompt]);

  useEffect(() => {
    if (!showRefineInput) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (refineInputRef.current && !refineInputRef.current.contains(event.target)) {
        setShowRefineInput(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [showRefineInput]);

  const updateIssuePrompt = (updatedIssue) => {
    setResult((current) => {
      const updateRows = (rows = []) => rows.map((row) => (row.id === updatedIssue.id ? { ...row, ...updatedIssue } : row));

      return {
        ...current,
        codeSmells: updateRows(current.codeSmells),
        securityIssues: updateRows(current.securityIssues),
      };
    });
    setSelectedRowId(updatedIssue.id);
    setShowRefineInput(false);
    setRefinement('');
  };

  const requestPrompt = async (regenerateInstruction = '') => {
    if (!selectedRow?.id || !result.roastId) {
      window.alert(labels.prompt.missingIssue);
      return;
    }

    if (!accessToken) {
      window.alert(labels.prompt.loginRequired);
      return;
    }

    const isRegenerate = Boolean(regenerateInstruction.trim());

    try {
      setPromptMode(isRegenerate ? 'regenerate' : 'generate');
      const updatedIssue = await generatePrompt({
        accessToken,
        issueId: selectedRow.id,
        regenerateInstruction,
        roastId: result.roastId,
      });

      updateIssuePrompt(updatedIssue);
      window.alert(isRegenerate ? labels.prompt.regenerateSuccess : labels.prompt.generateSuccess);
    } catch {
      window.alert(labels.prompt.failed);
    }
  };

  const handlePromptClick = () => {
    if (!hasPrompt) {
      requestPrompt();
      return;
    }

    setShowRefineInput(true);
  };

  const handleRegeneratePrompt = (event) => {
    event.preventDefault();

    if (!refinement.trim()) {
      window.alert(labels.prompt.missingInstruction);
      return;
    }

    requestPrompt(refinement);
  };

  const copyPrompt = async () => {
    if (!hasPrompt) {
      return;
    }

    await navigator.clipboard?.writeText(prompt);
    setHasCopiedPrompt(true);
    window.setTimeout(() => setHasCopiedPrompt(false), 1500);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-[76px] shrink-0 basis-[76px] items-center justify-between gap-4 border-b border-[#dddddd] px-5 py-[18px]">
        <RepositoryHeader result={result} />
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
        <section className="grid h-[156px] shrink-0 grid-cols-[1.59fr_3.04fr_repeat(3,minmax(130px,1fr))] gap-2">
          <ScoreCard labels={labels} result={result} />
          <SeveritySummary counts={severityCounts} labels={labels} />
          <MetricCard icon={codeIcon} label={labels.codesmell} subLabel={labels.totalIssues} value={result.codeSmellCount} />
          <MetricCard icon={securityIcon} label={labels.security} subLabel={labels.securityRisks} value={result.securityCount} />
          <MetricCard icon={fileTextIcon} label={labels.fileAnalyzed} subLabel={result.size} value={result.fileCount} />
        </section>

        <section className="relative h-[218px] shrink-0 overflow-hidden rounded-[15px] bg-white px-5 pb-3 pt-[43px] shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
          <div className="absolute left-5 top-[9px] flex h-6 items-center gap-3">
            <span className="text-[13px] font-normal leading-6 text-[#212121]">{labels.detailIssues}</span>
            <span className={`inline-flex h-[19px] min-w-[51px] items-center justify-center rounded-[4px] px-2 text-[13px] font-normal leading-6 ${SEVERITY_BADGE_CLASS[normalizeSeverity(selectedRow?.severity)]}`}>
              {normalizeSeverity(selectedRow?.severity)}
            </span>
          </div>
          {showRefineInput ? (
            <form
              ref={refineInputRef}
              className="absolute right-5 top-2.5 flex h-[34px] w-[400px] items-center overflow-hidden rounded-[8px] bg-white pl-2.5 shadow-[0_0_10px_1px_rgba(77,93,250,0.15)]"
              onSubmit={handleRegeneratePrompt}
            >
              <span className="sr-only">Prompt refinement</span>
              <img className="size-5 shrink-0" src={starsIcon} alt="" aria-hidden="true" />
              <input
                className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[9px] font-extralight leading-6 text-[#212121] outline-none placeholder:font-extralight placeholder:text-[#8f8f8f]"
                value={refinement}
                onChange={(event) => setRefinement(event.target.value)}
                placeholder={labels.prompt.regenerateReason}
              />
              <button
                className="flex size-[34px] shrink-0 items-center justify-center rounded-r-[8px] bg-[linear-gradient(180deg,#4da1fa_0%,#4d74fa_32%,#4d5dfa_100%)] shadow-[0_0_2.6px_rgba(77,93,250,0.15)] transition hover:brightness-90"
                type="submit"
                disabled={isGeneratingPrompt}
                aria-label={labels.prompt.regenerate}
              >
                <img className="size-5 brightness-0 invert" src={starsMinimalIcon} alt="" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <button
              className="absolute right-5 top-2.5 inline-flex h-[34px] min-w-max shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[8px] bg-[linear-gradient(180deg,#4da1fa_0%,#4d74fa_32%,#4d5dfa_100%)] px-4 text-[13px] font-light leading-[18px] tracking-[0.2px] text-white shadow-[4px_8px_24px_rgba(77,93,250,0.25)] transition hover:brightness-90"
              type="button"
              onClick={handlePromptClick}
              disabled={isGeneratingPrompt}
            >
              <img className="size-5 brightness-0 invert" src={starsMinimalIcon} alt="" aria-hidden="true" />
              {isGeneratingPrompt ? labels.prompt.generatingButton : hasPrompt ? labels.prompt.regenerate : labels.prompt.generate}
            </button>
          )}
          <button
            className="group absolute right-5 top-[50px] inline-flex size-[30px] items-center justify-center rounded-[6px] bg-[#eef1ff]/80 transition hover:bg-[#e3e8ff]/100"
            type="button"
            onClick={() => setIsPromptModalOpen(true)}
            aria-label={labels.prompt.openDetail}
          >
            <span
              className="block size-4 bg-[#1c274c] transition group-hover:bg-[#4d5dfa]"
              style={{
                mask: `url("${maximizeIcon}") center / contain no-repeat`,
                WebkitMask: `url("${maximizeIcon}") center / contain no-repeat`,
              }}
              aria-hidden="true"
            />
          </button>
          <div className="grid h-full min-h-0 grid-cols-[minmax(250px,0.85fr)_minmax(220px,0.7fr)_minmax(420px,1.7fr)]">
            <IssueDetail labels={labels} row={selectedRow} />
            <SuggestionPanel labels={labels} row={selectedRow} />
            <PromptPanel
              hasCopiedPrompt={hasCopiedPrompt}
              hasGeneratedPrompt={hasPrompt}
              prompt={prompt}
              labels={labels}
              onCopy={copyPrompt}
            />
          </div>
        </section>

        {isGeneratingPrompt && (
          <PromptLoadingOverlay
            label={promptMode === 'regenerate' ? labels.prompt.regenerating : labels.prompt.generating}
            seconds={promptSeconds}
            secondsLabel={labels.prompt.seconds}
          />
        )}

        <IssueTable
          activeIssueType={activeIssueType}
          codeSmellCount={result.codeSmellCount}
          rows={activeRows}
          securityCount={result.securityCount}
          selectedRow={selectedRow}
          severityCounts={activeSeverityCounts || severityCounts}
          labels={labels}
          tableLabels={labels.table}
          onRowSelect={(row) => setSelectedRowId(row.id)}
          onToggleType={() =>
            setActiveIssueType((current) => (current === ISSUE_TYPES.codeSmell ? ISSUE_TYPES.security : ISSUE_TYPES.codeSmell))
          }
        />
      </div>

      {isPromptModalOpen && (
        <PromptDetailModal
          hasCopiedPrompt={hasCopiedPrompt}
          hasPrompt={hasPrompt}
          isGenerating={isGeneratingPrompt}
          labels={labels}
          prompt={prompt}
          refinement={refinement}
          row={selectedRow}
          onClose={() => setIsPromptModalOpen(false)}
          onCopy={copyPrompt}
          onRegenerate={handleRegeneratePrompt}
          onRefinementChange={setRefinement}
        />
      )}
    </section>
  );
}

function RepositoryHeader({ result }) {
  return (
    <div className="flex h-[35px] shrink-0 items-center gap-4">
      <span className="size-[35px] shrink-0 rounded-full bg-[linear-gradient(180deg,#4d5dfa_0%,#4d90fa_43%,#4da6fa_64%,#4dd2fa_95%,#69dcff_100%)] shadow-[2px_5px_13.5px_3px_rgba(77,135,250,0.25)]" />
      <a
        className="group flex max-w-[280px] items-center gap-1 overflow-hidden text-[16px] font-medium leading-6 text-[#212121] hover:text-[#4d5dfa]"
        href={result.repositoryUrl}
        target="_blank"
        rel="noreferrer"
      >
        <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap group-hover:underline">{result.repository}</span>
        <img className="size-[11px] shrink-0" src={linkIcon} alt="" aria-hidden="true" />
      </a>
      <span className="text-[13px] text-[#a2a1a8]">•</span>
      <span className="whitespace-nowrap text-[13px] font-normal leading-6 text-[#a2a1a8]">{result.analyzedAt}</span>
    </div>
  );
}

function ScoreCard({ labels, result }) {
  const gradeClass = GRADE_CLASS[result.grade] || 'text-[#049c6b]';

  return (
    <div className="flex h-full flex-col items-center justify-center gap-[5px] overflow-hidden rounded-[15px] bg-white p-2.5 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
      <p className="m-0 whitespace-nowrap text-[13px] font-semibold leading-6 text-[#212121]">{labels.productionReadinessScore}</p>
      <div className="relative h-[100px] w-[201px] shrink-0">
        <svg className="absolute left-0 top-0 h-[100px] w-[200px]" viewBox="0 0 200 100" aria-hidden="true">
          <path d="M 18 96 A 82 82 0 0 1 182 96" fill="none" stroke="#eeeeee" strokeLinecap="round" strokeWidth="7" />
          <path d="M 18 96 A 82 82 0 0 1 57 26" fill="none" stroke="#f75555" strokeLinecap="round" strokeWidth="7" />
          <path d="M 57 26 A 82 82 0 0 1 138 24" fill="none" stroke="#ff981f" strokeLinecap="round" strokeWidth="7" />
          <path d="M 138 24 A 82 82 0 0 1 182 96" fill="none" stroke="#049c6b" strokeLinecap="round" strokeWidth="7" />
        </svg>
        <div className="absolute left-[72px] top-[46px] flex h-[54px] w-[57px] flex-col items-center justify-between">
          <span className={`text-[48px] font-normal leading-6 ${gradeClass}`}>{result.grade}</span>
          <span className="whitespace-nowrap text-[13px] font-light leading-6 text-[#212121]">{labels.score}: {result.score}</span>
        </div>
      </div>
    </div>
  );
}

function SeveritySummary({ counts, labels }) {
  return (
    <div className="grid h-full grid-cols-3 items-stretch justify-between overflow-hidden rounded-[15px] bg-white shadow-[0_0_4px_1px_rgba(0,0,0,0.08)]">
      <SeverityStat icon={forbiddenIcon} label={labels.severityLabels.high} subLabel={labels.severitySubLabels.high} value={counts.High} tone="danger" />
      <SeverityStat icon={dangerIcon} label={labels.severityLabels.medium} subLabel={labels.severitySubLabels.medium} value={counts.Medium} tone="warning" />
      <SeverityStat icon={infoIcon} label={labels.severityLabels.low} subLabel={labels.severitySubLabels.low} value={counts.Low} tone="success" />
    </div>
  );
}

function SeverityStat({ icon, label, subLabel, tone, value }) {
  const toneClass = tone === 'danger' ? 'text-[#f75555]' : tone === 'warning' ? 'text-[#ff981f]' : 'text-[#049c6b]';

  return (
    <div className="flex h-[156px] items-center justify-start overflow-hidden px-[30px] py-2.5">
      <div className="flex h-[125px] min-w-[92px] flex-col items-start justify-between">
        <div className="flex items-center gap-2.5">
          <img className="size-6" src={icon} alt="" aria-hidden="true" />
          <span className={`whitespace-nowrap text-[16px] font-medium leading-6 ${toneClass}`}>{label}</span>
        </div>
        <strong className="text-[48px] font-normal leading-6 text-[#212121]">{value}</strong>
        <span className="whitespace-nowrap text-[13px] font-normal leading-6 text-[#212121]">{subLabel}</span>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, subLabel, value }) {
  return (
    <div className="flex h-full items-center justify-start overflow-hidden rounded-[15px] bg-white px-6 py-2.5 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
      <div className="flex h-[125px] min-w-0 flex-col items-start justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <img className="size-6 shrink-0" src={icon} alt="" aria-hidden="true" />
          <span className="min-w-0 truncate whitespace-nowrap text-[16px] font-medium leading-6 text-[#212121]">{label}</span>
        </div>
        <strong className="text-[48px] font-normal leading-6 text-[#212121]">{value ?? 0}</strong>
        <span className="whitespace-nowrap text-[13px] font-normal leading-6 text-[#212121]">{subLabel}</span>
      </div>
    </div>
  );
}

function IssueDetail({ labels, row }) {
  if (!row) {
    return (
      <div className="flex items-start justify-start border-r border-[#e5e5e5] text-[13px] font-light leading-6 text-[#8f8f8f]">
        {labels.noIssueSelected}
      </div>
    );
  }

  return (
    <div className="flex h-[163px] min-w-0 flex-col items-start justify-between border-r border-[#e5e5e5] pr-3">
      <p className="m-0 max-w-full truncate text-[13px] font-medium leading-6 text-black" title={row.type}>
        {row.type}
      </p>
      <p className="m-0 line-clamp-3 max-w-full text-[12px] font-light leading-6 text-black" title={row.description}>
        {row.description}
      </p>
      <div className="flex max-w-full items-center gap-[25px] text-[13px] font-light leading-6 text-black">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-[22px] w-px shrink-0 bg-[#e5e5e5]" />
          <span className="shrink-0">{labels.file}:</span>
          <span className="min-w-0 max-w-[120px] truncate" title={row.filePath}>{row.filePath}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-[22px] w-px shrink-0 bg-[#e5e5e5]" />
          <span>{labels.line}:</span>
          <span>{row.line}</span>
        </div>
      </div>
      <a className="inline-flex items-center gap-2 text-[13px] font-normal leading-6 text-[#4d5dfa] hover:underline" href={row.filePath ? `#${row.filePath}` : '#file'}>
        <span>{labels.viewInFile}</span>
        <span aria-hidden="true">→</span>
      </a>
    </div>
  );
}

function SuggestionPanel({ labels, row }) {
  const suggestion = row?.suggestion || labels.noSuggestion;

  return (
    <div className="flex h-[163px] min-w-0 flex-col items-start border-r border-[#e5e5e5] px-4">
      <div className="flex w-full items-center justify-between gap-3">
        <p className="m-0 text-[13px] font-medium leading-6 text-black">{labels.suggestionsTitle}</p>
        <img className="size-5 shrink-0" src={lightbulbIcon} alt="" aria-hidden="true" />
      </div>
      <p className="m-0 mt-3 line-clamp-5 max-w-full text-[12px] font-light leading-6 text-black" title={suggestion}>
        {suggestion}
      </p>
    </div>
  );
}

function PromptPanel({ hasCopiedPrompt, hasGeneratedPrompt, labels, onCopy, prompt }) {
  return (
    <div className="flex h-[163px] min-w-0 flex-col gap-2.5 pl-4">
      <div className="flex items-start">
        <div>
          <h2 className="m-0 text-[13px] font-medium leading-6 text-black">{labels.prompt.title}</h2>
          <p className="m-0 line-clamp-1 text-[12px] font-light leading-6 text-black">
            {labels.prompt.description}
          </p>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-[10px] bg-[#14183b] px-2.5 pb-[35px] pt-2.5 text-white">
        <pre className={`m-0 mr-9 max-h-full overflow-y-auto whitespace-pre-wrap pr-3 font-['Roboto_Mono',monospace] text-[12px] font-normal leading-6 [scrollbar-color:rgba(255,255,255,0.35)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/35 ${hasGeneratedPrompt ? 'text-white' : 'text-white/50'}`}>
          {prompt}
        </pre>
        {hasCopiedPrompt && (
          <span className="absolute right-24 top-3 rounded-[5px] bg-white/10 px-2 py-0.5 text-[11px] font-light leading-5 text-white">
            {labels.prompt.copied}
          </span>
        )}
        <button className="absolute right-3 top-3" type="button" onClick={onCopy} aria-label="Copy prompt">
          <img className="size-6" src={copyIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function PromptLoadingOverlay({ label, seconds, secondsLabel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4" role="alert" aria-live="polite">
      <div className="w-full max-w-[420px] rounded-[15px] bg-white px-6 py-5 text-center shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <p className="m-0 text-[18px] font-medium leading-6 text-[#212121]">{label}</p>
        <p className="m-0 mt-2 text-[14px] font-light leading-6 text-[#8f8f8f]">
          {seconds} {secondsLabel}
        </p>
      </div>
    </div>
  );
}

function IssueTable({
  activeIssueType,
  codeSmellCount,
  labels,
  onRowSelect,
  onToggleType,
  rows,
  securityCount,
  selectedRow,
  severityCounts,
  tableLabels,
}) {
  const isCodeSmell = activeIssueType === ISSUE_TYPES.codeSmell;
  const switchLabel = isCodeSmell ? labels.security : labels.codesmell;
  const title = isCodeSmell ? labels.codesmell : labels.security;

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[15px] bg-white p-5 shadow-[0_0_4px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isCodeSmell ? (
            <img className="size-[25px] shrink-0" src={bugIcon} alt="" aria-hidden="true" />
          ) : (
            <span className="inline-flex size-[25px] shrink-0 items-center justify-center rounded-[5px] bg-black">
              <img className="size-[15px] brightness-0 invert" src={securityIcon} alt="" aria-hidden="true" />
            </span>
          )}
          <h2 className="m-0 text-[13px] font-normal leading-6 text-[#212121]">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <FilterPill label={`${labels.all}: ${rows.length}`} />
          <FilterPill label={`${labels.severityLabels.high}: ${severityCounts.High}`} severity="High" />
          <FilterPill label={`${labels.severityLabels.medium}: ${severityCounts.Medium}`} severity="Medium" />
          <FilterPill label={`${labels.severityLabels.low}: ${severityCounts.Low}`} severity="Low" />
          <button
            className="inline-flex h-[25px] items-center gap-[5px] rounded-[5px] bg-[linear-gradient(180deg,#4da1fa_0%,#4d74fa_32%,#4d5dfa_100%)] px-2.5 text-[12px] font-light leading-[17px] tracking-[0.2px] text-white shadow-[0_0_2.6px_rgba(77,93,250,0.15)] transition hover:brightness-90"
            type="button"
            onClick={onToggleType}
          >
            <img
              className={`size-[15px] ${isCodeSmell ? 'brightness-0 invert' : ''}`}
              src={isCodeSmell ? securityIcon : bugVectorIcon}
              alt=""
              aria-hidden="true"
            />
            {switchLabel}
          </button>
        </div>
      </div>

      <div className="min-h-0 overflow-hidden rounded-[15px] border border-dashed border-[#dddddd]">
        <div className="grid h-6 grid-cols-[47px_minmax(150px,1fr)_minmax(150px,1fr)_minmax(180px,1.2fr)_107px_91px] border-b border-[#dddddd] text-center text-[13px] font-medium leading-6 text-black">
          <span className="border-r border-[#dddddd]" />
          <span className="border-r border-[#dddddd]">{tableLabels.filePath}</span>
          <span className="border-r border-[#dddddd]">{isCodeSmell ? tableLabels.typeCodeSmell : tableLabels.typeSecurity}</span>
          <span className="border-r border-[#dddddd]">{tableLabels.description}</span>
          <span className="border-r border-[#dddddd]">{tableLabels.line}</span>
          <span>{tableLabels.severity}</span>
        </div>
        <div className="max-h-[160px] overflow-y-auto [scrollbar-color:#d8d8d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d8d8] [&::-webkit-scrollbar-track]:bg-transparent">
          {rows.map((row) => {
            const isSelected = selectedRow?.id === row.id;
            const severity = normalizeSeverity(row.severity);

            return (
              <button
                className={`grid min-h-6 w-full grid-cols-[47px_minmax(150px,1fr)_minmax(150px,1fr)_minmax(180px,1.2fr)_107px_91px] items-center border-b border-[#dddddd] text-[13px] font-light leading-6 text-black transition hover:bg-[#f7f7f7] ${isSelected ? 'bg-[#f7f7f7]' : 'bg-white'
                  }`}
                type="button"
                key={row.id}
                onClick={() => onRowSelect(row)}
              >
                <Cell centered value={row.index ?? ''} className="font-normal" />
                <Cell centered value={row.filePath} />
                <Cell centered value={row.type} />
                <Cell centered value={row.description} />
                <Cell centered value={row.line} />
                <Cell centered value={severity} className={SEVERITY_CLASS[severity] || 'text-black'} last />
              </button>
            );
          })}
        </div>
      </div>
      <span className="sr-only">{codeSmellCount + securityCount}</span>
    </section>
  );
}

function FilterPill({ label, severity }) {
  return (
    <span
      className={`inline-flex h-[25px] items-center rounded-[4px] border px-2.5 text-[12px] font-normal leading-6 ${severity ? SEVERITY_BORDER_CLASS[severity] : 'border-[#212121] text-[#212121]'
        }`}
    >
      {label}
    </span>
  );
}

function Cell({ centered = false, className = '', last = false, value }) {
  return (
    <span
      className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-[5px] ${centered ? 'text-center' : ''} ${last ? '' : 'border-r border-[#dddddd]'} ${className}`}
      title={String(value ?? '')}
    >
      {value}
    </span>
  );
}

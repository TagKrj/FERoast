import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import addCircleIcon from '@/assets/icons/Add Circle.svg';
import boltIcon from '@/assets/icons/Bolt.svg';
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
import questionIcon from '@/assets/icons/Question Circle.svg';
import securityIcon from '@/assets/icons/Shield Network.svg';
import starsMinimalIcon from '@/assets/icons/Stars Minimalistic.svg';
import starsIcon from '@/assets/icons/Stars.svg';
import PromptDetailModal from '@/components/PromptDetailModal';
import { buildResultMock } from '@/constants/resultMockData';
import { useAuth } from '@/hooks/useAuth';
import { useIssuePrompt } from '@/hooks/useIssuePrompt';
import { ANALYSIS_DOMAIN_KEYS } from '@/utils/roastMappers';

const DEFAULT_DOMAIN = 'maintainability';

const EMPTY_ROWS = [];

const DOMAIN_ICON = {
  architecture: codeIcon,
  interaction: boltIcon,
  maintainability: bugVectorIcon,
  operational: fileTextIcon,
  robustness: dangerIcon,
  security: securityIcon,
};

const GRADE_CLASS = {
  A: 'text-[#049c6b]',
  'B+': 'text-[#ff981f]',
  B: 'text-[#ff981f]',
  C: 'text-[#ff981f]',
  'C+': 'text-[#ff981f]',
  D: 'text-[#f75555]',
  F: 'text-[#f75555]',
};

const PRIORITY_TEXT_CLASS = {
  P0: 'text-[#f75555]',
  P1: 'text-[#ff981f]',
  P2: 'text-[#049c6b]',
  P3: 'text-[#8f8f8f]',
};

const PRIORITY_BORDER_CLASS = {
  P0: 'border-[#f75555] text-[#f75555]',
  P1: 'border-[#ff981f] text-[#ff981f]',
  P2: 'border-[#049c6b] text-[#049c6b]',
  P3: 'border-[#8f8f8f] text-[#8f8f8f]',
};

const PRIORITY_BADGE_CLASS = {
  P0: 'bg-[#ffe7e7] text-[#f75555]',
  P1: 'bg-[#fff1df] text-[#ff981f]',
  P2: 'bg-[#e7f7f1] text-[#049c6b]',
  P3: 'bg-[#f1f1f1] text-[#8f8f8f]',
};

function normalizePriority(priority) {
  const normalized = String(priority || '').trim().toUpperCase();

  if (['P0', 'P1', 'P2', 'P3'].includes(normalized)) {
    return normalized;
  }

  return 'P2';
}

function getDomainLabel(labels, key) {
  return labels.domains?.[key] || key;
}

function countRowsByPriority(rows = EMPTY_ROWS) {
  return rows.reduce(
    (counts, row) => {
      const priority = normalizePriority(row.priority);
      counts[priority] = (counts[priority] || 0) + 1;
      return counts;
    },
    { P0: 0, P1: 0, P2: 0, P3: 0 },
  );
}

function buildFallbackIssueDomains(result) {
  return ANALYSIS_DOMAIN_KEYS.reduce((domains, key) => {
    const items = key === 'maintainability' ? result.codeSmells || EMPTY_ROWS : key === 'security' ? result.securityIssues || EMPTY_ROWS : EMPTY_ROWS;

    domains[key] = {
      all: result.domainCounts?.[key] ?? items.length,
      items,
      key,
      priorityCounts: result[`${key}PriorityCounts`] || countRowsByPriority(items),
    };

    return domains;
  }, {});
}

export default function ResultPage() {
  const { t } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const { generatePrompt, isGeneratingPrompt } = useIssuePrompt();
  const initialResult = useMemo(() => location.state?.result ?? buildResultMock(location.state?.analysis), [location.state]);
  const [result, setResult] = useState(initialResult);
  const [activeIssueType, setActiveIssueType] = useState(DEFAULT_DOMAIN);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [hasCopiedPrompt, setHasCopiedPrompt] = useState(false);
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [refinement, setRefinement] = useState('');
  const [promptMode, setPromptMode] = useState('generate');
  const [promptSeconds, setPromptSeconds] = useState(0);
  const refineInputRef = useRef(null);

  const labels = t.result;
  const issueDomains = result.issueDomains || buildFallbackIssueDomains(result);
  const activeDomain = issueDomains[activeIssueType] || issueDomains[DEFAULT_DOMAIN];
  const activeRows = activeDomain?.items || EMPTY_ROWS;
  const activePriorityCounts = activeDomain?.priorityCounts || { P0: 0, P1: 0, P2: 0, P3: 0 };
  const selectedRow = activeRows.find((row) => row.id === selectedRowId) || activeRows[0] || null;
  const selectedPrompt = selectedRow?.fixPrompt?.trim() || '';
  const hasPrompt = Boolean(selectedPrompt);
  const fallbackPriorityCounts = useMemo(() => {
    const counts = { P0: 0, P1: 0, P2: 0, P3: 0 };

    Object.values(issueDomains).forEach((domain) => {
      (domain.items || EMPTY_ROWS).forEach((row) => {
        const priority = normalizePriority(row.priority);
        counts[priority] = (counts[priority] || 0) + 1;
      });
    });

    return counts;
  }, [issueDomains]);
  const priorityCounts = result.priorityCounts || fallbackPriorityCounts;
  const prompt = hasPrompt ? selectedPrompt : labels.prompt.placeholder;

  useEffect(() => {
    setResult(initialResult);
  }, [initialResult]);

  useEffect(() => {
    setSelectedRowId((current) => (activeRows.some((row) => row.id === current) ? current : activeRows[0]?.id ?? null));
  }, [activeRows]);

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
      const updateRows = (rows = []) => rows.map((row) => (
        row.id === updatedIssue.id
          ? { ...row, ...updatedIssue, fileUrl: updatedIssue.fileUrl || row.fileUrl }
          : row
      ));
      const currentIssueDomains = current.issueDomains || buildFallbackIssueDomains(current);
      const nextIssueDomains = Object.entries(currentIssueDomains).reduce((domains, [key, domain]) => {
        domains[key] = {
          ...domain,
          items: updateRows(domain.items),
        };

        return domains;
      }, {});

      return {
        ...current,
        codeSmells: updateRows(current.codeSmells),
        issueDomains: nextIssueDomains,
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
        <section className="grid h-[190px] shrink-0 grid-cols-[minmax(210px,1.15fr)_minmax(360px,2.3fr)_minmax(430px,3fr)] gap-2">
          <ScoreCard labels={labels} result={result} />
          <PrioritySummary counts={priorityCounts} labels={labels} />
          <DomainMetricGrid issueDomains={issueDomains} labels={labels} result={result} />
        </section>

        <section className="relative h-[218px] shrink-0 overflow-hidden rounded-[15px] bg-white px-5 pb-3 pt-[43px] shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
          <div className="absolute left-5 top-[9px] flex h-6 items-center gap-3">
            <span className="text-[13px] font-normal leading-6 text-[#212121]">{labels.detailIssues}</span>
            <span className={`inline-flex h-[19px] min-w-[51px] items-center justify-center rounded-[4px] px-2 text-[13px] font-normal leading-6 ${PRIORITY_BADGE_CLASS[normalizePriority(selectedRow?.priority)]}`}>
              {normalizePriority(selectedRow?.priority)}
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
          issueDomains={issueDomains}
          rows={activeRows}
          selectedRow={selectedRow}
          priorityCounts={activePriorityCounts}
          labels={labels}
          tableLabels={labels.table}
          onRowSelect={(row) => setSelectedRowId(row.id)}
          onDomainChange={setActiveIssueType}
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
    <div className="flex h-full flex-col items-center justify-center gap-[7px] overflow-hidden rounded-[15px] bg-white p-2.5 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
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
      <p className="m-0 max-w-full truncate text-[12px] font-light leading-5 text-[#8f8f8f]">
        {labels.fileAnalyzed}: {result.fileCount ?? 0} · {result.size}
      </p>
    </div>
  );
}

function PrioritySummary({ counts, labels }) {
  return (
    <div className="grid h-full grid-cols-4 items-stretch justify-between overflow-hidden rounded-[15px] bg-white shadow-[0_0_4px_1px_rgba(0,0,0,0.08)]">
      <PriorityStat icon={forbiddenIcon} label="P0" subLabel={labels.prioritySubLabels.p0} value={counts.P0} priority="P0" />
      <PriorityStat icon={dangerIcon} label="P1" subLabel={labels.prioritySubLabels.p1} value={counts.P1} priority="P1" />
      <PriorityStat icon={infoIcon} label="P2" subLabel={labels.prioritySubLabels.p2} value={counts.P2} priority="P2" />
      <PriorityStat icon={questionIcon} label="P3" subLabel={labels.prioritySubLabels.p3} value={counts.P3} priority="P3" />
    </div>
  );
}

function PriorityStat({ icon, label, priority, subLabel, value }) {
  const shouldTintIcon = priority === 'P3';

  return (
    <div className="flex h-full items-center justify-start overflow-hidden px-4 py-2.5">
      <div className="grid h-[145px] min-w-0 grid-rows-[24px_58px_40px] items-start gap-[11px]">
        <div className="flex items-center gap-2.5">
          {shouldTintIcon ? (
            <span
              className="block size-6 bg-[#8f8f8f]"
              style={{
                mask: `url("${icon}") center / contain no-repeat`,
                WebkitMask: `url("${icon}") center / contain no-repeat`,
              }}
              aria-hidden="true"
            />
          ) : (
            <img className="size-6" src={icon} alt="" aria-hidden="true" />
          )}
          <span className={`whitespace-nowrap text-[16px] font-medium leading-6 ${PRIORITY_TEXT_CLASS[priority]}`}>{label}</span>
        </div>
        <strong className="self-center text-[48px] font-normal leading-6 text-[#212121]">{value}</strong>
        <span className="line-clamp-2 text-[12px] font-normal leading-5 text-[#212121]">{subLabel}</span>
      </div>
    </div>
  );
}

function DomainMetricGrid({ issueDomains, labels, result }) {
  return (
    <div className="grid h-full grid-cols-3 gap-2">
      {ANALYSIS_DOMAIN_KEYS.map((key) => (
        <MetricCard
          icon={DOMAIN_ICON[key] || codeIcon}
          iconClassName={key === 'maintainability' ? 'size-[17px]' : 'size-5'}
          key={key}
          label={getDomainLabel(labels, key)}
          value={result.domainCounts?.[key] ?? issueDomains[key]?.all ?? 0}
        />
      ))}
    </div>
  );
}

function MetricCard({ icon, iconClassName = 'size-5', label, value }) {
  return (
    <div className="flex min-h-0 items-center justify-start overflow-hidden rounded-[12px] bg-white px-4 py-2 shadow-[0_0_4px_1px_rgba(0,0,0,0.08)]">
      <div className="flex h-full min-h-[74px] min-w-0 flex-col items-start justify-center gap-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`block shrink-0 bg-[#212121] ${iconClassName}`}
            style={{
              mask: `url("${icon}") center / contain no-repeat`,
              WebkitMask: `url("${icon}") center / contain no-repeat`,
            }}
            aria-hidden="true"
          />
          <span className="min-w-0 truncate whitespace-nowrap text-[13px] font-medium leading-5 text-[#212121]">{label}</span>
        </div>
        <strong className="text-[30px] font-normal leading-8 text-[#212121]">{value ?? 0}</strong>
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
      <a
        className={`inline-flex items-center gap-2 text-[13px] font-normal leading-6 ${row.fileUrl ? 'text-[#4d5dfa] hover:underline' : 'pointer-events-none text-[#a2a1a8]'}`}
        href={row.fileUrl || '#'}
        target="_blank"
        rel="noreferrer"
      >
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
  issueDomains,
  labels,
  onDomainChange,
  onRowSelect,
  priorityCounts,
  rows,
  selectedRow,
  tableLabels,
}) {
  const title = getDomainLabel(labels, activeIssueType);
  const activeIcon = DOMAIN_ICON[activeIssueType] || codeIcon;

  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[15px] bg-white p-5 shadow-[0_0_4px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="block size-[25px] shrink-0 bg-[#212121]"
            style={{
              mask: `url("${activeIcon}") center / contain no-repeat`,
              WebkitMask: `url("${activeIcon}") center / contain no-repeat`,
            }}
            aria-hidden="true"
          />
          <h2 className="m-0 text-[13px] font-normal leading-6 text-[#212121]">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <FilterPill label={`${labels.all}: ${rows.length}`} />
          <FilterPill label={`P0: ${priorityCounts.P0}`} priority="P0" />
          <FilterPill label={`P1: ${priorityCounts.P1}`} priority="P1" />
          <FilterPill label={`P2: ${priorityCounts.P2}`} priority="P2" />
          <FilterPill label={`P3: ${priorityCounts.P3}`} priority="P3" />
          <label className="inline-flex h-[28px] items-center gap-2 rounded-[6px] bg-[linear-gradient(180deg,#4da1fa_0%,#4d74fa_32%,#4d5dfa_100%)] px-2.5 text-[12px] font-light leading-[17px] tracking-[0.2px] text-white shadow-[0_0_2.6px_rgba(77,93,250,0.15)]">
            <span
              className="block size-[15px] shrink-0 bg-white"
              style={{
                mask: `url("${activeIcon}") center / contain no-repeat`,
                WebkitMask: `url("${activeIcon}") center / contain no-repeat`,
              }}
              aria-hidden="true"
            />
            <select
              className="max-w-[160px] cursor-pointer border-0 bg-transparent text-[12px] font-light text-white outline-none [color-scheme:dark]"
              value={activeIssueType}
              onChange={(event) => onDomainChange(event.target.value)}
              aria-label={labels.selectDomain}
            >
              {ANALYSIS_DOMAIN_KEYS.map((key) => (
                <option className="bg-white text-[#212121]" key={key} value={key}>
                  {getDomainLabel(labels, key)} ({issueDomains[key]?.all ?? 0})
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="min-h-0 overflow-hidden rounded-[15px] border border-dashed border-[#dddddd]">
        <div className="grid h-6 grid-cols-[47px_minmax(150px,1fr)_minmax(150px,1fr)_minmax(180px,1.2fr)_107px_91px] border-b border-[#dddddd] text-center text-[13px] font-medium leading-6 text-black">
          <span className="border-r border-[#dddddd]" />
          <span className="border-r border-[#dddddd]">{tableLabels.filePath}</span>
          <span className="border-r border-[#dddddd]">{tableLabels.typeIssue}</span>
          <span className="border-r border-[#dddddd]">{tableLabels.description}</span>
          <span className="border-r border-[#dddddd]">{tableLabels.line}</span>
          <span>{tableLabels.priority}</span>
        </div>
        <div className="max-h-[160px] overflow-y-auto [scrollbar-color:#d8d8d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d8d8] [&::-webkit-scrollbar-track]:bg-transparent">
          {rows.map((row) => {
            const isSelected = selectedRow?.id === row.id;
            const priority = normalizePriority(row.priority);

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
                <Cell centered value={priority} className={PRIORITY_TEXT_CLASS[priority] || 'text-black'} last />
              </button>
            );
          })}
        </div>
      </div>
      <span className="sr-only">{rows.length}</span>
    </section>
  );
}

function FilterPill({ label, priority }) {
  return (
    <span
      className={`inline-flex h-[25px] items-center rounded-[4px] border px-2.5 text-[12px] font-normal leading-6 ${priority ? PRIORITY_BORDER_CLASS[priority] : 'border-[#212121] text-[#212121]'
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

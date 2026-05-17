import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import addCircleIcon from '@/assets/icons/Add Circle.svg';
import bugIcon from '@/assets/icons/Bug.svg';
import linkIcon from '@/assets/icons/Link.svg';
import securityIcon from '@/assets/icons/Security.svg';
import DetailCodeSmellPopup from '@/components/DetailCodeSmellPopup';
import DetailSecurityPopup from '@/components/DetailSecurityPopup';
import { buildResultMock } from '@/constants/resultMockData';
import { useAuth } from '@/hooks/useAuth';

const SIZE_TONE_CLASS = {
  danger: 'text-[#f75555]',
  warning: 'text-[#ff981f]',
  success: 'text-[#049c6b]',
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

const GRADE_COLOR = {
  A: '#049c6b',
  'B+': '#ff981f',
  B: '#ff981f',
  C: '#ff981f',
  'C+': '#ff981f',
  D: '#f75555',
  F: '#f75555',
};

const SEVERITY_CLASS = {
  High: 'text-[#f75555]',
  Medium: 'text-[#ff981f]',
  Low: 'text-[#049c6b]',
};

export default function ResultPage() {
  const { t } = useOutletContext();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const result = useMemo(() => location.state?.result ?? buildResultMock(location.state?.analysis), [location.state]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const labels = t.result;
  const tableLabels = t.result.table;
  const displayName = user?.github?.displayName || user?.name || user?.github?.username;

  const openRow = (title, row) => {
    setSelectedTitle(`Detail ${title}`);
    setSelectedType(title);
    setSelectedRow(row);
  };

  const closePopup = () => {
    setSelectedRow(null);
    setSelectedTitle('');
    setSelectedType('');
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

      <div className="flex min-h-0 flex-1 gap-2.5 overflow-hidden bg-[rgba(77,93,250,0.02)] p-[15px]">
        <aside className="flex min-h-0 w-[442px] shrink-0 flex-col gap-2.5 overflow-hidden rounded-[15px] bg-white p-2.5 shadow-[0_0_4px_1px_rgba(0,0,0,0.1)]">
          <RepositoryHeader result={result} />
          <ScoreBlock result={result} />
          <SummaryBlock result={result} labels={labels} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2.5">
          <FindingTable
            icon={bugIcon}
            title="CodeSmell"
            labels={tableLabels}
            rows={result.codeSmells}
            onRowClick={(row) => openRow('CodeSmell', row)}
          />
          <FindingTable
            icon={securityIcon}
            title={labels.security}
            titleClassName="text-[#4d5dfa]"
            labels={tableLabels}
            rows={result.securityIssues}
            onRowClick={(row) => openRow(labels.security, row)}
          />
        </div>
      </div>

      {selectedType === 'CodeSmell' ? (
        <DetailCodeSmellPopup labels={tableLabels} row={selectedRow} onClose={closePopup} />
      ) : (
        <DetailSecurityPopup labels={tableLabels} row={selectedRow} title={selectedTitle} onClose={closePopup} />
      )}
    </section>
  );
}

function RepositoryHeader({ result }) {
  return (
    <div className="flex w-[271px] items-center justify-between">
      <span className="size-[35px] shrink-0 rounded-full bg-[linear-gradient(180deg,#4d5dfa_0%,#4d90fa_43%,#4da6fa_64%,#4dd2fa_95%,#69dcff_100%)] shadow-[2px_5px_13.5px_3px_rgba(77,135,250,0.25)]" />
      <div className="flex w-[228px] items-center justify-between text-[13px] leading-6">
        <a
          className="flex max-w-[153px] items-center gap-1 overflow-hidden font-normal text-[#212121] hover:text-[#4d5dfa]"
          href={result.repositoryUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap font-medium hover:underline">{result.repository}</span>
          <img className="size-[11px] shrink-0" src={linkIcon} alt="" aria-hidden="true" />
        </a>
        <span className="text-[#a2a1a8]">•</span>
        <span className="whitespace-nowrap font-normal text-[#a2a1a8]">{result.analyzedAt}</span>
      </div>
    </div>
  );
}

function ScoreBlock({ result }) {
  const gradeClass = GRADE_CLASS[result.grade] || 'text-[#049c6b]';
  const gradeColor = GRADE_COLOR[result.grade] || '#049c6b';
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, result.score));
  const dashOffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex size-[120px] items-center justify-center">
        <svg className="absolute inset-0 size-[120px] -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e8f3ef" strokeWidth="20" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={gradeColor}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute size-[96px] rounded-full bg-white" />
        <div className="relative flex flex-col items-center gap-1">
          <span className={`text-[48px] font-normal leading-[42px] ${gradeClass}`}>{result.grade}</span>
          <span className="text-[13px] font-light leading-4 text-black">Score: {result.score}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-col items-center gap-1 text-center text-black">
        <h1 className="m-0 text-[21px] font-medium leading-6">{result.headline}</h1>
        <p className="m-0 text-[16px] font-light leading-6">{result.summary}</p>
      </div>
    </div>
  );
}

function SummaryBlock({ labels, result }) {
  const sizeClass = SIZE_TONE_CLASS[result.sizeTone] || 'text-black';

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-between text-[13px] leading-6 text-black">
      <div>
        <p className="m-0 text-[15px] font-normal">{labels.shortReview}:</p>
        <ul className="m-0 mt-1 list-disc space-y-1 pl-5">
          {result.shortReview.map((item, index) => (
            <li className="text-[15px] font-light leading-[18px]" key={`${item}-${index}`}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-1 whitespace-nowrap text-[13px]">
        <Metric label={labels.fileCount} value={result.fileCount} />
        <Metric label={labels.size} value={result.size} valueClassName={sizeClass} />
        <Metric label="CodeSmell" value={result.codeSmellCount} />
        <Metric label={labels.security} value={result.securityCount} />
        <Metric label={labels.analysisType} value={result.analysisType} />
      </div>
    </div>
  );
}

function Metric({ label, value, valueClassName = 'text-black' }) {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <span className="font-normal text-[15px] text-black">{label}:</span>
      <span className={`font-light text-[15px] ${valueClassName}`}>{value}</span>
    </div>
  );
}

function FindingTable({ icon, labels, onRowClick, rows, title, titleClassName = 'text-black' }) {
  return (
    <section className="flex min-h-0 flex-1 flex-col rounded-[15px] bg-white p-5 shadow-[0_0_4px_1px_rgba(0,0,0,0.05)]">
      <div className="mb-2 flex items-center gap-2">
        <img className="size-[25px]" src={icon} alt="" aria-hidden="true" />
        <h2 className={`m-0 text-[13px] font-normal leading-6 ${titleClassName}`}>{title}</h2>
      </div>

      <div className="min-h-0 flex flex-1 flex-col">
        <div className="w-[calc(100%-12px)] overflow-hidden rounded-t-[10px] border border-b-0 border-dashed border-[#dddddd]">
          <div className="grid h-6 grid-cols-[47px_161px_161px_minmax(160px,1fr)_107px_91px] border-b border-[#dddddd] text-center text-[13px] font-normal leading-6 text-black">
            <span className="border-r border-[#dddddd]" />
            <span className="border-r border-[#dddddd] text-[15px] font-medium">{labels.filePath}</span>
            <span className="border-r border-[#dddddd] text-[15px] font-medium">{labels.typeCodeSmell}</span>
            <span className="border-r border-[#dddddd] text-[15px] font-medium">{labels.description}</span>
            <span className="border-r border-[#dddddd] text-[15px] font-medium">{labels.line}</span>
            <span className="text-[13px] font-normal">{labels.severity}</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-color:#d8d8d8_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#d8d8d8] [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="w-[calc(100%-12px)] overflow-hidden rounded-b-[10px] border border-t-0 border-dashed border-[#dddddd]">
            {rows.map((row, index) => (
              <button
                className={`grid min-h-8 w-full grid-cols-[47px_161px_161px_minmax(160px,1fr)_107px_91px] items-center bg-white text-left text-[13px] font-light leading-6 text-black transition hover:bg-[#f4f4f4] ${index > 0 ? 'border-b border-[#d6d6d6]' : ''}`}
                type="button"
                key={row.id}
                onClick={() => onRowClick(row)}
              >
                <Cell centered value={row.id} className="font-medium" />
                <Cell value={row.filePath} />
                <Cell value={row.type} />
                <Cell value={row.description} />
                <Cell centered value={row.line} />
                <Cell centered value={row.severity} className={SEVERITY_CLASS[row.severity] || 'text-black'} last />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Cell({ centered = false, className = '', last = false, value }) {
  return (
    <span
      className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-[5px] ${centered ? 'text-center' : ''} ${last ? '' : 'border-r border-[#dddddd]'} ${className}`}
    >
      {value}
    </span>
  );
}

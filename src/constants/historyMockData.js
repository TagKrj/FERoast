import { buildResultMock } from '@/constants/resultMockData';

const HISTORY_BASE = [
  {
    id: 'history-1',
    grade: 'A',
    repository: 'TagKrj/UTTQ_Web',
    date: '23/4/2026',
    score: 92,
    size: 'Medium',
    sizeTone: 'warning',
  },
  {
    id: 'history-2',
    grade: 'B',
    repository: 'TagKrj/UTTQ_Web',
    date: '23/4/2026',
    score: 81,
    size: 'Small',
    sizeTone: 'success',
  },
  {
    id: 'history-3',
    grade: 'B+',
    repository: 'TagKrj/UTTQ_Web',
    date: '23/4/2026',
    score: 86,
    size: 'Medium',
    sizeTone: 'warning',
  },
  {
    id: 'history-4',
    grade: 'C',
    repository: 'TagKrj/UTTQ_Web',
    date: '23/4/2026',
    score: 69,
    size: 'Large',
    sizeTone: 'danger',
  },
  {
    id: 'history-5',
    grade: 'F',
    repository: 'TagKrj/UTTQ_Web',
    date: '23/4/2026',
    score: 34,
    size: 'Large',
    sizeTone: 'danger',
  },
  {
    id: 'history-6',
    grade: 'F',
    repository: 'TagKrj/UTTQ_Web',
    date: '23/4/2026',
    score: 28,
    size: 'Large',
    sizeTone: 'danger',
  },
];

export const HISTORY_PAGE_SIZE = 10;
export const HISTORY_TOTAL_COUNT = 60;

export const HISTORY_ITEMS = HISTORY_BASE.map((item) => {
  const analysis = {
    repoUrl: `github.com/${item.repository}`,
    fileCount: item.size === 'Small' ? 412 : item.size === 'Medium' ? 1934 : 8421,
    size: item.size,
    sizeTone: item.sizeTone,
  };

  return {
    ...item,
    analysis,
    result: {
      ...buildResultMock(analysis),
      analyzedAt: item.date,
      grade: item.grade,
      score: item.score,
    },
  };
});

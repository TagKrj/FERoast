import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { mapHistoryItem, mapIssue, mapRoastToResult } from '../src/utils/roastMappers.js';

const report = {
  id: 'r1',
  grade: 'C',
  score: 55,
  roastDateDisplay: '17 Nov 2026',
  repository: {
    fullName: 'owner/repo',
    htmlUrl: 'https://github.com/owner/repo',
    defaultBranch: 'dev',
  },
  repoInfo: {
    fileCount: 42,
    sizeLabel: 'medium',
    sizeDisplay: 'Medium',
    totalIssues: 2,
    totalSecurity: 1,
    totalRobustness: 1,
    totalP0: 1,
    totalP1: 0,
    totalP2: 1,
    totalP3: 0,
    analysisTypeDisplay: 'Gemini default system analysis',
  },
  issues: {
    security: {
      all: 1,
      totalP0: 1,
      items: [{ id: 'i1', type: 'security', title: 'Hardcoded secret', filePath: 'src/a.js', startLine: 3, endLine: 5, priority: 'p0' }],
    },
    robustness: {
      all: 1,
      items: [{ id: 'i2', title: 'Unhandled promise', filePath: '/src/b.js', startLine: 9, priority: 'P2' }],
    },
  },
};

describe('mapIssue', () => {
  it('formats a line range and normalises priority', () => {
    const issue = mapIssue({ title: 'T', filePath: 'a.js', startLine: 3, endLine: 5, priority: 'p1' });

    assert.equal(issue.line, '3-5');
    assert.equal(issue.priority, 'P1');
    assert.equal(issue.type, 'T');
  });

  it('maps legacy severity when priority is missing', () => {
    assert.equal(mapIssue({ severity: 'High' }).priority, 'P1');
    assert.equal(mapIssue({ severity: 'low' }).priority, 'P3');
    assert.equal(mapIssue({}).priority, 'P2');
  });
});

describe('mapRoastToResult', () => {
  const result = mapRoastToResult(report);

  it('maps the report header', () => {
    assert.equal(result.roastId, 'r1');
    assert.equal(result.grade, 'C');
    assert.equal(result.score, 55);
    assert.equal(result.repository, 'owner/repo');
    assert.equal(result.size, 'Medium');
    assert.equal(result.sizeTone, 'warning');
    assert.equal(result.analysisType, 'Gemini default system analysis');
  });

  it('builds a GitHub deep link on the default branch', () => {
    assert.equal(
      result.issueDomains.security.items[0].fileUrl,
      'https://github.com/owner/repo/blob/dev/src/a.js#L3',
    );
    assert.equal(
      result.issueDomains.robustness.items[0].fileUrl,
      'https://github.com/owner/repo/blob/dev/src/b.js#L9',
    );
  });

  it('fills all six domains, empty ones included', () => {
    assert.deepEqual(Object.keys(result.issueDomains).sort(), [
      'architecture', 'interaction', 'maintainability', 'operational', 'robustness', 'security',
    ]);
    assert.equal(result.issueDomains.architecture.items.length, 0);
    assert.equal(result.domainCounts.architecture, 0);
  });

  it('prefers server priority totals over counting items', () => {
    assert.deepEqual(result.priorityCounts, { P0: 1, P1: 0, P2: 1, P3: 0 });
  });

  it('unwraps the report envelope', () => {
    assert.equal(mapRoastToResult({ roast: report }).roastId, 'r1');
    assert.equal(mapRoastToResult({ report }).roastId, 'r1');
  });

  it('still reads the legacy codeSmells/securityIssues shape', () => {
    const legacy = mapRoastToResult({
      id: 'old',
      codeSmells: [{ issueType: 'Long function', severity: 'medium' }],
      securityIssues: [{ issueType: 'SQL injection', severity: 'high' }],
    });

    assert.equal(legacy.codeSmells[0].type, 'Long function');
    assert.equal(legacy.securityIssues[0].priority, 'P1');
    assert.equal(legacy.totalIssues, 2);
  });
});

describe('mapHistoryItem', () => {
  it('maps counts with legacy fallbacks', () => {
    const item = mapHistoryItem({ roastId: 'h1', totalCodeSmell: 4, totalSecurity: 2 });

    assert.equal(item.id, 'h1');
    assert.equal(item.domainCounts.maintainability, 4);
    assert.equal(item.domainCounts.security, 2);
    assert.equal(item.domainCounts.architecture, 0);
  });
});

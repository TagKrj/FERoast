const SIZE_TONE_BY_LABEL = {
  large: 'danger',
  medium: 'warning',
  small: 'success',
};

export function mapIssue(issue) {
  const startLine = issue.startLine ?? '';
  const endLine = issue.endLine ?? '';
  const line = startLine && endLine && startLine !== endLine ? `${startLine}-${endLine}` : String(startLine || endLine || '');
  const filePath = issue.filePath || issue.fileName || '';
  const type = issue.title || issue.type || issue.issueType || '';

  return {
    id: issue.id || issue._id || issue.index || `${filePath}-${line}-${type}`,
    index: issue.index,
    filePath,
    type,
    description: issue.description || '',
    fixPrompt: issue.fixPrompt,
    fixPromptGeneratedAt: issue.fixPromptGeneratedAt,
    fixPromptInstruction: issue.fixPromptInstruction,
    fixPromptInstructionAnalysis: issue.fixPromptInstructionAnalysis,
    fixPromptVersion: issue.fixPromptVersion,
    line,
    severity: issue.severityDisplay || issue.severity,
    suggestion: issue.suggestion || '',
  };
}

function countBySeverity(items) {
  return items.reduce(
    (counts, item) => {
      const severity = String(item.severityDisplay || item.severity || '').toLowerCase();

      if (severity === 'high') {
        counts.High += 1;
      }

      if (severity === 'medium') {
        counts.Medium += 1;
      }

      if (severity === 'low') {
        counts.Low += 1;
      }

      return counts;
    },
    { High: 0, Medium: 0, Low: 0 },
  );
}

function mapSeverityCounts(source, fallbackItems = []) {
  const fallbackCounts = countBySeverity(fallbackItems);

  return {
    High: source?.totalHigh ?? source?.high ?? fallbackCounts.High,
    Medium: source?.totalMedium ?? source?.medium ?? fallbackCounts.Medium,
    Low: source?.totalLow ?? source?.low ?? fallbackCounts.Low,
  };
}

function getIssueItems(issueGroup) {
  if (Array.isArray(issueGroup)) {
    return issueGroup;
  }

  if (Array.isArray(issueGroup?.items)) {
    return issueGroup.items;
  }

  return [];
}

function mapShortReview(shortReview) {
  if (Array.isArray(shortReview)) {
    return shortReview;
  }

  if (!shortReview) {
    return [];
  }

  return [shortReview];
}

export function mapRoastToResult(data) {
  const roast = data.roast || data.report || data.roastReport || data.item || data;
  const sizeLabel = roast.repoInfo?.sizeLabel?.toLowerCase() || roast.sizeLabel?.toLowerCase();
  const issues = roast.issues || {};
  const codeSmellGroup = issues.codeSmells || issues.codeSmell || roast.codeSmells || roast.codeSmell;
  const securityGroup = issues.security || issues.securityIssues || roast.security || roast.securityIssues;
  const codeSmellRawItems = getIssueItems(codeSmellGroup);
  const securityRawItems = getIssueItems(securityGroup);
  const codeSmells = codeSmellRawItems.map(mapIssue);
  const securityIssues = securityRawItems.map(mapIssue);
  const codeSmellSeverityCounts = mapSeverityCounts(codeSmellGroup, codeSmellRawItems);
  const securitySeverityCounts = mapSeverityCounts(securityGroup, securityRawItems);
  const severityCounts = mapSeverityCounts(roast.repoInfo, [...codeSmellRawItems, ...securityRawItems]);

  return {
    analysisType: roast.repoInfo?.analysisTypeDisplay || roast.repoInfo?.analysisType || roast.analysisType,
    analyzedAt: roast.roastDateDisplay || roast.date || '',
    codeSmellCount: roast.repoInfo?.totalCodeSmell ?? roast.totalCodeSmell ?? codeSmellGroup?.all ?? codeSmells.length,
    codeSmellSeverityCounts,
    codeSmells,
    fileCount: roast.repoInfo?.fileCount ?? roast.fileCount,
    grade: roast.grade || '',
    headline: roast.summaryTitle || '',
    repository: roast.repository?.fullName || roast.repositoryFullName || '',
    repositoryUrl: roast.repository?.htmlUrl || roast.repositoryUrl || '#',
    roastId: roast.id || roast.roastId || roast._id,
    score: roast.score ?? 0,
    securityCount: roast.repoInfo?.totalSecurity ?? roast.totalSecurity ?? securityGroup?.all ?? securityIssues.length,
    securitySeverityCounts,
    securityIssues,
    severityCounts,
    shortReview: mapShortReview(roast.shortReview),
    size: roast.repoInfo?.sizeDisplay || roast.sizeDisplay || '',
    sizeTone: SIZE_TONE_BY_LABEL[sizeLabel] || 'warning',
    summary: roast.summary || '',
  };
}

export function mapHistoryItem(item) {
  return {
    analysisType: item.analysisType,
    date: item.roastDateDisplay,
    grade: item.grade,
    id: item.roastId || item.id || item._id,
    repository: item.repositoryFullName,
    repositoryUrl: item.repositoryUrl,
    roastDate: item.roastDate,
    size: item.sizeDisplay,
    sizeLabel: item.sizeLabel,
    totalCodeSmell: item.totalCodeSmell,
    totalSecurity: item.totalSecurity,
  };
}

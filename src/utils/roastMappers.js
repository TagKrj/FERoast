const SIZE_TONE_BY_LABEL = {
  large: 'danger',
  medium: 'warning',
  small: 'success',
};

function mapIssue(issue) {
  const startLine = issue.startLine ?? '';
  const endLine = issue.endLine ?? '';
  const line = startLine && endLine && startLine !== endLine ? `${startLine}-${endLine}` : String(startLine || endLine || '');

  return {
    id: issue.index,
    filePath: issue.filePath || issue.fileName,
    type: issue.title,
    description: issue.description,
    line,
    severity: issue.severityDisplay || issue.severity,
  };
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
  const roast = data.roast || data;
  const sizeLabel = roast.repoInfo?.sizeLabel?.toLowerCase() || roast.sizeLabel?.toLowerCase();
  const codeSmells = roast.issues?.codeSmells?.map(mapIssue) || roast.codeSmells?.map(mapIssue) || [];
  const securityIssues = roast.issues?.security?.map(mapIssue) || roast.security?.map(mapIssue) || [];

  return {
    analysisType: roast.repoInfo?.analysisTypeDisplay || roast.repoInfo?.analysisType || roast.analysisType,
    analyzedAt: roast.roastDateDisplay,
    codeSmellCount: roast.repoInfo?.totalCodeSmell ?? roast.totalCodeSmell ?? codeSmells.length,
    codeSmells,
    fileCount: roast.repoInfo?.fileCount ?? roast.fileCount,
    grade: roast.grade,
    headline: roast.summaryTitle,
    repository: roast.repository?.fullName || roast.repositoryFullName,
    repositoryUrl: roast.repository?.htmlUrl || roast.repositoryUrl,
    score: roast.score,
    securityCount: roast.repoInfo?.totalSecurity ?? roast.totalSecurity ?? securityIssues.length,
    securityIssues,
    shortReview: mapShortReview(roast.shortReview),
    size: roast.repoInfo?.sizeDisplay || roast.sizeDisplay,
    sizeTone: SIZE_TONE_BY_LABEL[sizeLabel] || 'warning',
    summary: roast.summary,
  };
}

export function mapHistoryItem(item) {
  return {
    analysisType: item.analysisType,
    date: item.roastDateDisplay,
    grade: item.grade,
    id: item.roastId,
    repository: item.repositoryFullName,
    repositoryUrl: item.repositoryUrl,
    roastDate: item.roastDate,
    size: item.sizeDisplay,
    sizeLabel: item.sizeLabel,
    totalCodeSmell: item.totalCodeSmell,
    totalSecurity: item.totalSecurity,
  };
}

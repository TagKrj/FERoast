const SIZE_TONE_BY_LABEL = {
  large: 'danger',
  medium: 'warning',
  small: 'success',
};

export const ANALYSIS_DOMAIN_KEYS = [
  'maintainability',
  'architecture',
  'security',
  'robustness',
  'operational',
  'interaction',
];

const PRIORITY_BY_SEVERITY = {
  high: 'P1',
  medium: 'P2',
  low: 'P3',
};

function normalizePriority(priority, severity) {
  const normalizedPriority = String(priority || '').trim().toUpperCase();

  if (['P0', 'P1', 'P2', 'P3'].includes(normalizedPriority)) {
    return normalizedPriority;
  }

  const normalizedSeverity = String(severity || '').trim().toLowerCase();
  return PRIORITY_BY_SEVERITY[normalizedSeverity] || 'P2';
}

function buildIssueFileUrl({ defaultBranch, filePath, repositoryUrl, startLine }) {
  if (!repositoryUrl || repositoryUrl === '#' || !filePath) {
    return '';
  }

  const normalizedRepositoryUrl = repositoryUrl.replace(/\/$/, '');
  const normalizedFilePath = String(filePath).replace(/^\/+/, '');
  const lineHash = startLine ? `#L${startLine}` : '';

  return `${normalizedRepositoryUrl}/blob/${defaultBranch || 'main'}/${normalizedFilePath}${lineHash}`;
}

export function mapIssue(issue) {
  const startLine = issue.startLine ?? '';
  const endLine = issue.endLine ?? '';
  const line = startLine && endLine && startLine !== endLine ? `${startLine}-${endLine}` : String(startLine || endLine || '');
  const filePath = issue.filePath || issue.fileName || '';
  const domain = ANALYSIS_DOMAIN_KEYS.includes(issue.type) ? issue.type : '';
  const type = issue.title || issue.issueType || issue.type || '';
  const priority = normalizePriority(issue.priority, issue.severityDisplay || issue.severity);

  return {
    id: issue.id || issue._id || issue.index || `${filePath}-${line}-${type}`,
    domain,
    index: issue.index,
    endLine,
    fileUrl: issue.fileUrl || '',
    filePath,
    type,
    description: issue.description || '',
    fixPrompt: issue.fixPrompt,
    fixPromptGeneratedAt: issue.fixPromptGeneratedAt,
    fixPromptInstruction: issue.fixPromptInstruction,
    fixPromptInstructionAnalysis: issue.fixPromptInstructionAnalysis,
    fixPromptVersion: issue.fixPromptVersion,
    line,
    priority,
    priorityColor: issue.priorityColor,
    priorityDescription: issue.priorityDescription || '',
    priorityDisplay: issue.priorityDisplay || priority,
    severity: issue.severityDisplay || issue.severity,
    startLine,
    suggestion: issue.suggestion || '',
  };
}

function countByPriority(items) {
  return items.reduce(
    (counts, item) => {
      const priority = normalizePriority(item.priority, item.severityDisplay || item.severity);
      counts[priority] = (counts[priority] || 0) + 1;

      return counts;
    },
    { P0: 0, P1: 0, P2: 0, P3: 0 },
  );
}

function mapPriorityCounts(source, fallbackItems = []) {
  const fallbackCounts = countByPriority(fallbackItems);

  return {
    P0: source?.totalP0 ?? source?.p0 ?? fallbackCounts.P0,
    P1: source?.totalP1 ?? source?.p1 ?? fallbackCounts.P1,
    P2: source?.totalP2 ?? source?.p2 ?? fallbackCounts.P2,
    P3: source?.totalP3 ?? source?.p3 ?? fallbackCounts.P3,
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
  const defaultBranch = roast.repository?.defaultBranch || roast.defaultBranch || '';
  const repositoryUrl = roast.repository?.htmlUrl || roast.repositoryUrl || '#';
  const sizeLabel = roast.repoInfo?.sizeLabel?.toLowerCase() || roast.sizeLabel?.toLowerCase();
  const issues = roast.issues || {};
  const legacyCodeSmellGroup = issues.codeSmells || issues.codeSmell || roast.codeSmells || roast.codeSmell;
  const legacySecurityGroup = issues.securityIssues || roast.security || roast.securityIssues;
  const getDomainGroup = (key) => {
    if (key === 'maintainability') {
      return issues.maintainability || legacyCodeSmellGroup;
    }

    if (key === 'security') {
      return issues.security || legacySecurityGroup;
    }

    return issues[key] || roast[key];
  };
  const issueDomains = ANALYSIS_DOMAIN_KEYS.reduce((domains, key) => {
    const group = getDomainGroup(key);
    const rawItems = getIssueItems(group);
    const items = rawItems.map((issue) => {
      const mappedIssue = mapIssue(issue);

      return {
        ...mappedIssue,
        domain: key,
        fileUrl: mappedIssue.fileUrl || buildIssueFileUrl({
          defaultBranch,
          filePath: mappedIssue.filePath,
          repositoryUrl,
          startLine: mappedIssue.startLine,
        }),
      };
    });

    domains[key] = {
      all: group?.all ?? items.length,
      items,
      key,
      priorityCounts: mapPriorityCounts(group, rawItems),
    };

    return domains;
  }, {});
  const allRawItems = ANALYSIS_DOMAIN_KEYS.flatMap((key) => getIssueItems(getDomainGroup(key)));
  const priorityCounts = mapPriorityCounts(roast.repoInfo, allRawItems);
  const codeSmells = issueDomains.maintainability.items;
  const securityIssues = issueDomains.security.items;
  const codeSmellPriorityCounts = issueDomains.maintainability.priorityCounts;
  const securityPriorityCounts = issueDomains.security.priorityCounts;

  return {
    analysisType: roast.repoInfo?.analysisTypeDisplay || roast.repoInfo?.analysisType || roast.analysisType,
    analyzedAt: roast.roastDateDisplay || roast.date || '',
    codeSmellCount: roast.repoInfo?.totalMaintainability ?? roast.repoInfo?.totalCodeSmell ?? roast.totalCodeSmell ?? issueDomains.maintainability.all,
    codeSmellPriorityCounts,
    codeSmellSeverityCounts: codeSmellPriorityCounts,
    codeSmells,
    domainCounts: {
      architecture: roast.repoInfo?.totalArchitecture ?? issueDomains.architecture.all,
      interaction: roast.repoInfo?.totalInteraction ?? issueDomains.interaction.all,
      maintainability: roast.repoInfo?.totalMaintainability ?? roast.repoInfo?.totalCodeSmell ?? issueDomains.maintainability.all,
      operational: roast.repoInfo?.totalOperational ?? issueDomains.operational.all,
      robustness: roast.repoInfo?.totalRobustness ?? issueDomains.robustness.all,
      security: roast.repoInfo?.totalSecurity ?? issueDomains.security.all,
    },
    defaultBranch,
    fileCount: roast.repoInfo?.fileCount ?? roast.fileCount,
    grade: roast.grade || '',
    headline: roast.summaryTitle || '',
    issueDomains,
    repository: roast.repository?.fullName || roast.repositoryFullName || '',
    repositoryUrl,
    roastId: roast.id || roast.roastId || roast._id,
    score: roast.score ?? 0,
    securityCount: roast.repoInfo?.totalSecurity ?? roast.totalSecurity ?? issueDomains.security.all,
    securityPriorityCounts,
    securitySeverityCounts: securityPriorityCounts,
    securityIssues,
    priorityCounts,
    severityCounts: priorityCounts,
    shortReview: mapShortReview(roast.shortReview),
    size: roast.repoInfo?.sizeDisplay || roast.sizeDisplay || '',
    sizeTone: SIZE_TONE_BY_LABEL[sizeLabel] || 'warning',
    summary: roast.summary || '',
    totalIssues: roast.repoInfo?.totalIssues ?? ANALYSIS_DOMAIN_KEYS.reduce((total, key) => total + (issueDomains[key]?.all || 0), 0),
  };
}

export function mapHistoryItem(item) {
  return {
    analysisType: item.analysisType,
    date: item.roastDateDisplay,
    defaultBranch: item.defaultBranch,
    domainCounts: {
      architecture: item.totalArchitecture ?? 0,
      interaction: item.totalInteraction ?? 0,
      maintainability: item.totalMaintainability ?? item.totalCodeSmell ?? 0,
      operational: item.totalOperational ?? 0,
      robustness: item.totalRobustness ?? 0,
      security: item.totalSecurity ?? 0,
    },
    grade: item.grade,
    id: item.roastId || item.id || item._id,
    repository: item.repositoryFullName,
    repositoryUrl: item.repositoryUrl,
    roastDate: item.roastDate,
    size: item.sizeDisplay,
    sizeLabel: item.sizeLabel,
    totalCodeSmell: item.totalCodeSmell,
    totalIssues: item.totalIssues,
    totalMaintainability: item.totalMaintainability,
    totalSecurity: item.totalSecurity,
  };
}

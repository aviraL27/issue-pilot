import { fetchClosedIssues, fetchOpenIssues, fetchPullRequests, fetchRecentCommits } from './githubService.js';

function daysBetween(a, b = new Date()) {
  return Math.max(0, Math.round((b.getTime() - new Date(a).getTime()) / 86400000));
}

export async function buildRepoHealth(owner, repo, token) {
  const [commits, openIssues, closedIssues, prs] = await Promise.all([
    fetchRecentCommits(owner, repo, token).catch(() => []),
    fetchOpenIssues(owner, repo, token).catch(() => []),
    fetchClosedIssues(owner, repo, token).catch(() => []),
    fetchPullRequests(owner, repo, token, 'closed').catch(() => [])
  ]);

  const lastCommitAt = commits[0]?.commit?.committer?.date;
  const daysSinceLastCommit = lastCommitAt ? daysBetween(lastCommitAt) : null;
  const last10Prs = prs.slice(0, 10);
  const merged = last10Prs.filter((pr) => pr.merged_at).length;
  const mergeRate = last10Prs.length ? Math.round((merged / last10Prs.length) * 100) : 0;
  const totalIssues = openIssues.length + closedIssues.length;
  const openClosedRatio = totalIssues ? Number((openIssues.length / totalIssues).toFixed(2)) : 0;
  const recentClosed = closedIssues.slice(0, 30).filter((issue) => issue.created_at && issue.closed_at);
  const avgIssueResponseTimeDays = recentClosed.length
    ? Math.round(
        recentClosed.reduce((sum, issue) => sum + daysBetween(issue.created_at, new Date(issue.closed_at)), 0) /
          recentClosed.length
      )
    : null;

  let points = 0;
  if (daysSinceLastCommit !== null && daysSinceLastCommit <= 30) points += 35;
  else if (daysSinceLastCommit !== null && daysSinceLastCommit <= 90) points += 20;
  if (mergeRate >= 60) points += 30;
  else if (mergeRate >= 30) points += 15;
  if (openClosedRatio <= 0.6) points += 20;
  else if (openClosedRatio <= 0.8) points += 10;
  if (avgIssueResponseTimeDays !== null && avgIssueResponseTimeDays <= 14) points += 15;
  else if (avgIssueResponseTimeDays !== null && avgIssueResponseTimeDays <= 45) points += 8;

  const status = points >= 70 ? 'Healthy' : points >= 40 ? 'Moderate' : 'Low Activity';
  return { score: points, status, daysSinceLastCommit, avgIssueResponseTimeDays, openClosedRatio, mergeRate };
}

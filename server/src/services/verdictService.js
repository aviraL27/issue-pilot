import { classifyIssue, predictAssignment } from './aiService.js';
import { fetchIssueComments, fetchIssueTimeline } from './githubService.js';

const CLAIM_PATTERNS = [
  /i['’]?ll work on this/i,
  /i am working on this/i,
  /i'm working on this/i,
  /taking this/i,
  /assigned to me/i,
  /i can work on/i,
  /let me work/i,
  /i['’]?ll take/i
];

function mapCategory(labels) {
  const text = labels.map((label) => label.name.toLowerCase());
  if (text.some((label) => label.includes('bug'))) return 'Bug';
  if (text.some((label) => label.includes('doc'))) return 'Documentation';
  if (text.some((label) => label.includes('test'))) return 'Testing';
  if (text.some((label) => label.includes('perf'))) return 'Performance';
  if (text.some((label) => label.includes('feature') || label.includes('enhancement'))) return 'Feature';
  return null;
}

function recentClaim(comments) {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return comments.find((comment) => {
    const recent = new Date(comment.created_at).getTime() >= sevenDaysAgo;
    return recent && CLAIM_PATTERNS.some((pattern) => pattern.test(comment.body || ''));
  });
}

function linkedPullRequest(timeline) {
  return timeline.find((event) => {
    const sourceIssue = event.source?.issue;
    return event.event === 'cross-referenced' && sourceIssue?.pull_request;
  });
}

export async function processIssue(issue, owner, repo, token) {
  const labels = issue.labels || [];
  let verdict = 'AVAILABLE';
  let verdictReason = 'No assignee, linked pull request, or recent claim found.';

  if (issue.assignees?.length) {
    verdict = 'TAKEN';
    verdictReason = `Formally assigned to ${issue.assignees.map((a) => `@${a.login}`).join(', ')}.`;
  }

  let comments = [];
  let timeline = [];
  if (verdict !== 'TAKEN') {
    [comments, timeline] = await Promise.all([
      fetchIssueComments(owner, repo, issue.number, token).catch(() => []),
      fetchIssueTimeline(owner, repo, issue.number, token).catch(() => [])
    ]);

    const prEvent = linkedPullRequest(timeline);
    const pr = prEvent?.source?.issue;
    if (pr?.pull_request?.merged_at || pr?.state === 'closed') {
      verdict = 'TAKEN';
      verdictReason = `Linked pull request ${pr.html_url ? `appears closed: ${pr.html_url}` : 'appears closed or merged'}.`;
    } else if (pr) {
      verdict = 'LIKELY_TAKEN';
      verdictReason = `Linked open pull request found${pr.html_url ? `: ${pr.html_url}` : ''}.`;
    } else {
      const claim = recentClaim(comments);
      if (claim) {
        const ai = await predictAssignment(comments);
        if (ai === 'YES' || ai === 'UNCERTAIN') {
          verdict = 'LIKELY_TAKEN';
          verdictReason = `Recent contributor claim by @${claim.user?.login || 'someone'}; AI said ${ai}.`;
        }
      }
    }
  }

  const labelNames = labels.map((label) => label.name);
  const category =
    mapCategory(labels) ||
    (labels.length ? 'Other' : await classifyIssue({ ...issue, owner, repo }).catch(() => 'Other'));

  return {
    id: issue.id,
    number: issue.number,
    title: issue.title,
    body: issue.body,
    author: issue.user?.login,
    url: issue.html_url,
    labels: labels.map((label) => ({ name: label.name, color: label.color })),
    labelNames,
    category,
    goodFirstIssue: labelNames.some((name) => name.toLowerCase() === 'good first issue'),
    helpWanted: labelNames.some((name) => name.toLowerCase() === 'help wanted'),
    commentsCount: issue.comments,
    createdAt: issue.created_at,
    updatedAt: issue.updated_at,
    assignees: issue.assignees?.map((a) => a.login) || [],
    verdict,
    verdictReason
  };
}

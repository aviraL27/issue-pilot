import IssueDetail from '../models/IssueDetail.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { fetchIssue, fetchIssueComments, resolveGitHubToken } from '../services/githubService.js';
import { processIssue } from '../services/verdictService.js';
import { summarizeIssue } from '../services/aiService.js';

export const getIssueDetail = asyncHandler(async (req, res) => {
  const { owner, repo, issueNumber } = req.params;
  const number = Number(issueNumber);
  const token = resolveGitHubToken(req.user);
  const [issue, comments] = await Promise.all([
    fetchIssue(owner, repo, number, token),
    fetchIssueComments(owner, repo, number, token).catch(() => [])
  ]);
  const processed = await processIssue(issue, owner, repo, token);
  const aiSummary = await summarizeIssue(owner, repo, number, issue, comments);

  await IssueDetail.findOneAndUpdate(
    { owner, repo, issueNumber: number },
    {
      owner,
      repo,
      issueNumber: number,
      aiSummary,
      verdict: processed.verdict,
      verdictReason: processed.verdictReason,
      lastChecked: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    { upsert: true }
  );

  res.json({ issue: processed, comments, aiSummary });
});

export const bookmarkIssue = asyncHandler(async (req, res) => {
  const { owner, repo, issueNumber, title, note } = req.body;
  const number = Number(issueNumber);
  const exists = req.user.bookmarks.some(
    (item) => item.owner === owner && item.repo === repo && item.issueNumber === number
  );
  if (!exists) req.user.bookmarks.push({ owner, repo, issueNumber: number, title, note });
  await req.user.save();
  res.status(exists ? 200 : 201).json({ bookmarks: req.user.bookmarks });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  res.json({ bookmarks: req.user.bookmarks });
});

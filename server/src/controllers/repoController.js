import RepoCache from '../models/RepoCache.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseRepoUrl } from '../utils/repoParser.js';
import { clearRepoCache, getFreshCache, isTooFresh, saveRepoCache } from '../services/cacheService.js';
import { fetchOpenIssues, resolveGitHubToken } from '../services/githubService.js';
import { processIssue } from '../services/verdictService.js';
import { buildRepoHealth } from '../services/repoHealthService.js';

async function analyzeRepo(owner, repo, token) {
  const rawIssues = await fetchOpenIssues(owner, repo, token);
  const issues = [];

  for (const issue of rawIssues) {
    issues.push(await processIssue(issue, owner, repo, token));
  }

  const health = await buildRepoHealth(owner, repo, token);
  return saveRepoCache(owner, repo, issues, health);
}

export const analyze = asyncHandler(async (req, res) => {
  const { owner, repo } = parseRepoUrl(req.body.repoUrl);
  const cached = await getFreshCache(owner, repo);
  if (cached) {
    res.json({ owner, repo, cached: true, fetchedAt: cached.fetchedAt, issues: cached.issues, health: cached.health });
    return;
  }

  const token = resolveGitHubToken(req.user);
  const cache = await analyzeRepo(owner, repo, token);
  res.json({ owner, repo, cached: false, fetchedAt: cache.fetchedAt, issues: cache.issues, health: cache.health });
});

export const reanalyze = asyncHandler(async (req, res) => {
  const { owner, repo } = parseRepoUrl(req.body.repoUrl);
  const cached = await getFreshCache(owner, repo);
  if (isTooFresh(cached)) {
    res.status(409).json({
      message: 'Already up to date',
      owner,
      repo,
      fetchedAt: cached.fetchedAt,
      issues: cached.issues,
      health: cached.health
    });
    return;
  }

  await clearRepoCache(owner, repo);
  const token = resolveGitHubToken(req.user);
  const cache = await analyzeRepo(owner, repo, token);
  res.json({ owner, repo, cached: false, fetchedAt: cache.fetchedAt, issues: cache.issues, health: cache.health });
});

export const getIssues = asyncHandler(async (req, res) => {
  const { owner, repo } = req.query;
  const cache = await RepoCache.findOne({ owner, repo });
  if (!cache) {
    const error = new Error('No cached analysis found for this repo');
    error.statusCode = 404;
    throw error;
  }
  res.json({ owner, repo, fetchedAt: cache.fetchedAt, issues: cache.issues, health: cache.health });
});

export const getHealth = asyncHandler(async (req, res) => {
  const { owner, repo } = req.query;
  const cache = await RepoCache.findOne({ owner, repo });
  if (cache?.health) {
    res.json(cache.health);
    return;
  }
  const token = resolveGitHubToken(req.user);
  res.json(await buildRepoHealth(owner, repo, token));
});

export const getWatchlist = asyncHandler(async (req, res) => {
  res.json({ watchlist: req.user.watchlist });
});

export const addWatchlist = asyncHandler(async (req, res) => {
  const { owner, repo } = parseRepoUrl(req.body.repoUrl || `${req.body.owner}/${req.body.repo}`);
  const exists = req.user.watchlist.some((item) => item.owner === owner && item.repo === repo);
  if (!exists) req.user.watchlist.push({ owner, repo });
  await req.user.save();
  res.status(exists ? 200 : 201).json({ watchlist: req.user.watchlist });
});

import RepoCache from '../models/RepoCache.js';

const THIRTY_MINUTES = 30 * 60 * 1000;
const TWO_MINUTES = 2 * 60 * 1000;

export async function getFreshCache(owner, repo) {
  const cache = await RepoCache.findOne({ owner, repo });
  if (!cache) return null;
  const age = Date.now() - cache.fetchedAt.getTime();
  return age < THIRTY_MINUTES ? cache : null;
}

export function isTooFresh(cache) {
  return cache && Date.now() - cache.fetchedAt.getTime() < TWO_MINUTES;
}

export async function saveRepoCache(owner, repo, issues, health) {
  const fetchedAt = new Date();
  const expiresAt = new Date(fetchedAt.getTime() + THIRTY_MINUTES);
  return RepoCache.findOneAndUpdate(
    { owner, repo },
    { owner, repo, issues, health, fetchedAt, expiresAt },
    { upsert: true, new: true }
  );
}

export async function clearRepoCache(owner, repo) {
  await RepoCache.deleteOne({ owner, repo });
}

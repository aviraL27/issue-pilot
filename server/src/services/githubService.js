import axios from 'axios';
import { decryptToken } from '../utils/tokenCrypto.js';

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
});

export function resolveGitHubToken(user) {
  if (user?.githubToken) return decryptToken(user.githubToken);
  return process.env.GITHUB_TOKEN;
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function paginate(url, token, params = {}) {
  const items = [];
  let page = 1;
  while (true) {
    const { data } = await github.get(url, {
      params: { per_page: 100, page, ...params },
      headers: authHeaders(token)
    });
    items.push(...data);
    if (!Array.isArray(data) || data.length < 100) break;
    page += 1;
  }
  return items;
}

export async function fetchOpenIssues(owner, repo, token) {
  const issues = await paginate(`/repos/${owner}/${repo}/issues`, token, { state: 'open' });
  return issues.filter((issue) => !issue.pull_request);
}

export async function fetchIssueComments(owner, repo, issueNumber, token) {
  return paginate(`/repos/${owner}/${repo}/issues/${issueNumber}/comments`, token);
}

export async function fetchIssueTimeline(owner, repo, issueNumber, token) {
  return paginate(`/repos/${owner}/${repo}/issues/${issueNumber}/timeline`, token);
}

export async function fetchIssue(owner, repo, issueNumber, token) {
  const { data } = await github.get(`/repos/${owner}/${repo}/issues/${issueNumber}`, {
    headers: authHeaders(token)
  });
  return data;
}

export async function fetchRepo(owner, repo, token) {
  const { data } = await github.get(`/repos/${owner}/${repo}`, {
    headers: authHeaders(token)
  });
  return data;
}

export async function fetchRecentCommits(owner, repo, token) {
  return paginate(`/repos/${owner}/${repo}/commits`, token).then((items) => items.slice(0, 30));
}

export async function fetchPullRequests(owner, repo, token, state = 'closed') {
  return paginate(`/repos/${owner}/${repo}/pulls`, token, { state, sort: 'updated', direction: 'desc' });
}

export async function fetchClosedIssues(owner, repo, token) {
  return paginate(`/repos/${owner}/${repo}/issues`, token, { state: 'closed' }).then((items) =>
    items.filter((issue) => !issue.pull_request)
  );
}

export async function verifyToken(token) {
  const { data, headers } = await github.get('/user', { headers: authHeaders(token) });
  return {
    username: data.login,
    remaining: Number(headers['x-ratelimit-remaining'] || 0),
    limit: Number(headers['x-ratelimit-limit'] || 0)
  };
}

import http from './http';

export const repoApi = {
  analyze: (repoUrl) => http.post('/repo/analyze', { repoUrl }).then((res) => res.data),
  reanalyze: (repoUrl) => http.post('/repo/reanalyze', { repoUrl }).then((res) => res.data),
  issues: (owner, repo) => http.get('/repo/issues', { params: { owner, repo } }).then((res) => res.data),
  health: (owner, repo) => http.get('/repo/health', { params: { owner, repo } }).then((res) => res.data),
  watchlist: () => http.get('/repo/watchlist').then((res) => res.data),
  addWatchlist: (repoUrl) => http.post('/repo/watchlist', { repoUrl }).then((res) => res.data)
};

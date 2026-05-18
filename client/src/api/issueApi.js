import http from './http';

export const issueApi = {
  detail: (owner, repo, number) => http.get(`/issues/${owner}/${repo}/${number}`).then((res) => res.data),
  bookmark: (payload) => http.post('/issues/bookmark', payload).then((res) => res.data),
  bookmarks: () => http.get('/issues/bookmarks').then((res) => res.data)
};

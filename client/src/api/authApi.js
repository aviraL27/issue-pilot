import http from './http';

export const authApi = {
  firebaseLogin: (payload) => http.post('/auth/firebase-login', payload).then((res) => res.data),
  me: () => http.get('/auth/me').then((res) => res.data),
  saveToken: (githubToken) => http.post('/auth/save-token', { githubToken }).then((res) => res.data),
  logout: () => http.post('/auth/logout').then((res) => res.data)
};

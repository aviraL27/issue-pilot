import { createContext, useContext, useMemo, useState } from 'react';
import { repoApi } from '../api/repoApi';

const RepoContext = createContext(null);

export function RepoProvider({ children }) {
  const [repoState, setRepoState] = useState({
    owner: '',
    repo: '',
    fetchedAt: null,
    issues: [],
    health: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function analyze(repoUrl) {
    setLoading(true);
    setError('');
    try {
      const data = await repoApi.analyze(repoUrl);
      setRepoState(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || '> Error: could not analyze repo.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function reanalyze(repoUrl) {
    setLoading(true);
    setError('');
    try {
      const data = await repoApi.reanalyze(repoUrl);
      setRepoState(data);
      return data;
    } catch (err) {
      if (err.response?.status === 409) {
        setToast('Already up to date');
        setRepoState(err.response.data);
        return err.response.data;
      }
      const message = err.response?.data?.message || '> Error: could not re-analyze repo.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 2400);
    }
  }

  const value = useMemo(
    () => ({ repoState, setRepoState, loading, error, toast, analyze, reanalyze }),
    [repoState, loading, error, toast]
  );

  return <RepoContext.Provider value={value}>{children}</RepoContext.Provider>;
}

export function useRepo() {
  return useContext(RepoContext);
}

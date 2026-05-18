import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth';
import { auth, githubProvider, googleProvider, isFirebaseConfigured } from '../firebase';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const idToken = await firebaseUser.getIdToken();
        const data = await authApi.firebaseLogin({ idToken });
        localStorage.setItem('issuepilot_jwt', data.token);
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  async function loginWithGitHub() {
    if (!isFirebaseConfigured || !auth) throw new Error('Firebase client env vars are not configured.');
    const credential = await signInWithPopup(auth, githubProvider);
    const githubCredential = GithubAuthProvider.credentialFromResult(credential);
    const idToken = await credential.user.getIdToken();
    const data = await authApi.firebaseLogin({
      idToken,
      githubAccessToken: githubCredential?.accessToken
    });
    localStorage.setItem('issuepilot_jwt', data.token);
    setUser(data.user);
    return data.user;
  }

  async function loginWithGoogle() {
    if (!isFirebaseConfigured || !auth) throw new Error('Firebase client env vars are not configured.');
    const credential = await signInWithPopup(auth, googleProvider);
    const googleCredential = GoogleAuthProvider.credentialFromResult(credential);
    const idToken = await credential.user.getIdToken();
    const data = await authApi.firebaseLogin({ idToken, googleAccessToken: googleCredential?.accessToken });
    localStorage.setItem('issuepilot_jwt', data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await authApi.logout().catch(() => undefined);
    localStorage.removeItem('issuepilot_jwt');
    if (auth) await signOut(auth);
    setUser(null);
  }

  async function saveGithubToken(token) {
    const result = await authApi.saveToken(token);
    setUser((current) => ({ ...current, hasGithubToken: true, githubUsername: result.githubUsername }));
    return result;
  }

  const value = useMemo(
    () => ({ user, loading, loginWithGitHub, loginWithGoogle, logout, saveGithubToken }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

import type { AuthState } from '@/contexts/AuthContext';
import AuthContext from '@/contexts/AuthContext';
import { CurrentUser, type CurrentUserResponse } from '@/types';
import { api } from '@/lib/api';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackend } from '@/lib/runtime';

const guest: AuthState = { isAuthenticated: false };
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState | null>(!useBackend && import.meta.env.MODE !== 'development' ? guest : null);
  const navigate = useNavigate();
  const readState = useCallback(async (): Promise<AuthState> => {
    const { data } = await api.get<CurrentUserResponse>('/api/users/me');
    if (!data.authenticated) return guest;
    const user = new CurrentUser(data.displayName, data.email, data.avatarUrl, data.username, data.roles, data.permissions, data.id);
    return { isAuthenticated: true, user, logout: async () => {
      await api.post('/api/logout'); sessionStorage.removeItem('hn_active_holland_result'); setState(guest); navigate('/');
    } };
  }, [navigate]);
  const refresh = useCallback(async () => { setState(await readState()); }, [readState]);
  useEffect(() => {
    if (!useBackend && import.meta.env.MODE !== 'development') return;
    let live = true;
    readState().then(value => { if (live) setState(value); }).catch(() => { if (live) setState(guest); });
    return () => { live = false; };
  }, [readState]);
  return <AuthContext.Provider value={state === null ? null : { ...state, refresh }}>{children}</AuthContext.Provider>;
};

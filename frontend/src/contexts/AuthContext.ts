import { CurrentUser } from '@/types';
import { createContext, useContext } from 'react';

export type AuthState =
  | {
      isAuthenticated: false;
    }
  | {
      isAuthenticated: true;
      user: CurrentUser;
      logout: () => Promise<void>;
    };

export type AuthContextType = AuthState & { refresh: () => Promise<void> };

const AuthContext = createContext<AuthContextType | null | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

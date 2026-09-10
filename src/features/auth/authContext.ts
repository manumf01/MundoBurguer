import { createContext } from 'react';
import type { AccessState, Profile } from './types';

export interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  hasSession: boolean;
  profile: Profile | null;
  access: AccessState;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Vuelve a cargar el perfil (tras una aprobación, p. ej.). */
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

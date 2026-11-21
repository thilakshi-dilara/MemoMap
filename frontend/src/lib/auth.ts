import { create } from 'zustand';
import { api, clearSession, getSession, saveSession, setUnauthorizedHandler, type Session } from './api';

export type User = { id: string; email: string; displayName: string; avatarUrl: string | null; timezone: string; createdAt: string; updatedAt: string };
type AuthResponse = Session & { user: User };

type AuthState = {
  user: User | null;
  ready: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  ready: false,
  async init() {
    if (!getSession()) return set({ ready: true });
    try {
      set({ user: await api<User>('/users/me'), ready: true });
    } catch {
      set({ user: null, ready: true });
    }
  },
  async login(email, password, remember) {
    const { user, ...session } = await api<AuthResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    saveSession(session, remember);
    set({ user });
  },
  async register(displayName, email, password) {
    const { user, ...session } = await api<AuthResponse>('/auth/register', { method: 'POST', body: { displayName, email, password }, auth: false });
    saveSession(session, true);
    set({ user });
  },
  async logout() {
    const session = getSession();
    clearSession();
    set({ user: null });
    if (session) await api('/auth/logout', { method: 'POST', body: { refreshToken: session.refreshToken }, auth: false }).catch(() => undefined);
  },
  setUser: (user) => set({ user }),
}));

setUnauthorizedHandler(() => useAuth.setState({ user: null }));

export function initials(name = '') {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'M';
}

export function firstName(name = '') {
  return name.trim().split(/\s+/)[0] ?? '';
}

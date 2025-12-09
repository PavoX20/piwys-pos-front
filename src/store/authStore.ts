import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  setToken: (token: string, username: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      isAuthenticated: false,
      setToken: (token, username) => set({ token, username, isAuthenticated: true }),
      logout: () => set({ token: null, username: null, isAuthenticated: false }),
    }),
    {
      name: 'pos-auth', // Así se guardará en tu localStorage
    }
  )
);
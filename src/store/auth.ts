import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthenticatedUser } from '../types';
import { getCurrentUser } from '../lib/auth';

interface AuthState {
  token: string | null;
  user: AuthenticatedUser | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  setUser: (user: AuthenticatedUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setToken: async (token) => {
        set({ token, isAuthenticated: true });
        const user = await getCurrentUser();
        if (user) {
          set({ user: user as AuthenticatedUser });
        }
      },
      setUser: (user) => set({ user }),
      logout: () => {
        // Clear Django session
        fetch('/d/user/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${useAuthStore.getState().token}`,
          },
        }).catch(console.error);
        
        // Clear local state
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
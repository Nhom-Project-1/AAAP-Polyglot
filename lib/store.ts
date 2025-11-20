import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
  id: number;
  username: string;
  email: string;
  fullName: string;
};

type State = {
  isLoggedIn: boolean;
  user: User | null;
  isAdmin: boolean;
  isHydrated: boolean;
};

type Actions = {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: User | null) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

const useAuthStoreBase = create<State & Actions>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      isAdmin: false,
      isHydrated: false,
      setIsLoggedIn: (isLoggedIn) => set({ isLoggedIn }),
      setUser: (user) => set({ user }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setHydrated: (hydrated) => set({ isHydrated: hydrated }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user, isAdmin: state.isAdmin }),
      onRehydrateStorage: () => (state) => { state?.setHydrated(true); }
    }
  )
);

export const useAuthStore = useAuthStoreBase;
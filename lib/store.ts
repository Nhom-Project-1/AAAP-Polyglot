/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';

type State = {
  isLoggedIn: boolean;
  user: any;
  isAdmin: boolean;
};

type Actions = {
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  setUser: (user: any) => void;
  setIsAdmin: (isAdmin: boolean) => void;
};

export const useAuthStore = create<State & Actions>((set) => ({
  isLoggedIn: false,
  user: null,
  isAdmin: false,
  setIsLoggedIn: (isLoggedIn: any) => set(() => ({ isLoggedIn })),
  setUser: (user) => set(() => ({ user })),
  setIsAdmin: (isAdmin) => set(() => ({ isAdmin })),
}));

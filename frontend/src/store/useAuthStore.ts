import { create } from "zustand";
import { AuthService } from "@/services/auth.service";
import type { UserProfile } from "@/models/auth.models";

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchMe: () => Promise<UserProfile | null>;
  setUser: (user: UserProfile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const userProfile = await AuthService.getProfile();
      set({ user: userProfile, isLoading: false });
      return userProfile;
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to fetch user profile";
      set({ user: null, isLoading: false, error: message });
      return null;
    }
  },

  setUser: (user: UserProfile | null) => set({ user }),

  clearAuth: () => set({ user: null, isLoading: false, error: null }),
}));

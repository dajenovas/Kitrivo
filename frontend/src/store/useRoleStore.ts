import { create } from "zustand";
import { RoleServices } from "@/services/roles.service";
import type { UserRole } from "@/models/auth.models";

interface RoleState {
  roles: UserRole[];
  skip: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  searchTerm: string;

  fetchRoles: (reset?: boolean) => Promise<void>;
  fetchMoreRoles: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  resetStore: () => void;
}

const DEFAULT_LIMIT = 100;

export const useRoleStore = create<RoleState>((set, get) => ({
  roles: [],
  skip: 0,
  limit: DEFAULT_LIMIT,
  hasMore: true,
  isLoading: false,
  isFetchingMore: false,
  error: null,
  searchTerm: "",

  fetchRoles: async (reset = false) => {
    const { isLoading, isFetchingMore } = get();
    if (isLoading || isFetchingMore) return;

    if (reset) {
      set({ skip: 0, roles: [], hasMore: true, error: null, isLoading: true });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await RoleServices.listRoles(0, DEFAULT_LIMIT);
      if (response.success && Array.isArray(response.data)) {
        const fetchedRoles = response.data;
        set({
          roles: fetchedRoles,
          skip: 0,
          hasMore: fetchedRoles.length >= DEFAULT_LIMIT,
          isLoading: false,
        });
      } else {
        set({ error: response.message || "Failed to fetch roles", isLoading: false });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || "Failed to load roles";
      set({ error: message, isLoading: false });
    }
  },

  fetchMoreRoles: async () => {
    const { skip, limit, roles, hasMore, isLoading, isFetchingMore } = get();
    if (!hasMore || isLoading || isFetchingMore) return;

    const nextSkip = skip + limit;
    set({ isFetchingMore: true });

    try {
      const response = await RoleServices.listRoles(nextSkip, limit);
      if (response.success && Array.isArray(response.data)) {
        const newRoles = response.data;
        if (newRoles.length === 0) {
          set({ hasMore: false, isFetchingMore: false });
          return;
        }

        // Deduplicate roles by id
        const existingIds = new Set(roles.map((r) => r.id));
        const uniqueNewRoles = newRoles.filter((r) => !existingIds.has(r.id));

        set({
          roles: [...roles, ...uniqueNewRoles],
          skip: nextSkip,
          hasMore: newRoles.length >= limit,
          isFetchingMore: false,
        });
      } else {
        set({ isFetchingMore: false });
      }
    } catch (err: any) {
      console.error("Error fetching more roles:", err);
      set({ isFetchingMore: false });
    }
  },

  setSearchTerm: (term: string) => set({ searchTerm: term }),

  resetStore: () =>
    set({
      roles: [],
      skip: 0,
      limit: DEFAULT_LIMIT,
      hasMore: true,
      isLoading: false,
      isFetchingMore: false,
      error: null,
      searchTerm: "",
    }),
}));

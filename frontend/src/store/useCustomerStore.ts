import { create } from "zustand";
import { CustomerService } from "@/services/customer.service";
import type { CustomerModel } from "@/models/customer.models";

interface CustomerState {
  customers: CustomerModel[];
  skip: number;
  limit: number;
  hasMore: boolean;
  isLoading: boolean;
  isFetchingMore: boolean;
  error: string | null;
  searchTerm: string;

  fetchCustomers: (reset?: boolean) => Promise<void>;
  fetchMoreCustomers: () => Promise<void>;
  setSearchTerm: (term: string) => Promise<void>;
  resetStore: () => void;
}

const DEFAULT_LIMIT = 20;
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  skip: 0,
  limit: DEFAULT_LIMIT,
  hasMore: true,
  isLoading: false,
  isFetchingMore: false,
  error: null,
  searchTerm: "",

  fetchCustomers: async (reset = false) => {
    const { isLoading, isFetchingMore, searchTerm } = get();
    if (isLoading || isFetchingMore) return;

    if (reset) {
      set({ skip: 0, customers: [], hasMore: true, error: null, isLoading: true });
    } else {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await CustomerService.getAllCustomers(
        searchTerm.trim() || undefined,
        undefined,
        undefined,
        0,
        DEFAULT_LIMIT
      );
      if (response.success && Array.isArray(response.data)) {
        const fetched = response.data;
        set({
          customers: fetched,
          skip: 0,
          hasMore: fetched.length >= DEFAULT_LIMIT,
          isLoading: false,
        });
      } else {
        set({ error: response.message || "Failed to fetch customers", isLoading: false });
      }
    } catch (err: any) {
      set({ error: err?.message || "Failed to load customers", isLoading: false });
    }
  },

  fetchMoreCustomers: async () => {
    const { skip, limit, customers, hasMore, isLoading, isFetchingMore, searchTerm } = get();
    if (!hasMore || isLoading || isFetchingMore) return;

    const nextSkip = skip + limit;
    set({ isFetchingMore: true });

    try {
      const response = await CustomerService.getAllCustomers(
        searchTerm.trim() || undefined,
        undefined,
        undefined,
        nextSkip,
        limit
      );
      if (response.success && Array.isArray(response.data)) {
        const newCustomers = response.data;
        if (newCustomers.length === 0) {
          set({ hasMore: false, isFetchingMore: false });
          return;
        }

        const existingIds = new Set(customers.map((c) => c.id));
        const uniqueNew = newCustomers.filter((c) => !existingIds.has(c.id));

        set({
          customers: [...customers, ...uniqueNew],
          skip: nextSkip,
          hasMore: newCustomers.length >= limit,
          isFetchingMore: false,
        });
      } else {
        set({ isFetchingMore: false });
      }
    } catch (err: any) {
      console.error("Error fetching more customers:", err);
      set({ isFetchingMore: false });
    }
  },

  setSearchTerm: async (term: string) => {
    set({ searchTerm: term, skip: 0, hasMore: true });

    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer);
    }

    searchDebounceTimer = setTimeout(async () => {
      set({ isLoading: true, customers: [] });
      try {
        const response = await CustomerService.getAllCustomers(
          term.trim() || undefined,
          undefined,
          undefined,
          0,
          DEFAULT_LIMIT
        );
        if (response.success && Array.isArray(response.data)) {
          set({
            customers: response.data,
            hasMore: response.data.length >= DEFAULT_LIMIT,
            isLoading: false,
          });
        } else {
          set({ isLoading: false });
        }
      } catch (err: any) {
        set({ isLoading: false });
      }
    }, 300);
  },

  resetStore: () =>
    set({
      customers: [],
      skip: 0,
      limit: DEFAULT_LIMIT,
      hasMore: true,
      isLoading: false,
      isFetchingMore: false,
      error: null,
      searchTerm: "",
    }),
}));

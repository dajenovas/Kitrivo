import { create } from "zustand";
import { LogsService, type AuditLogItem, type LogFilterParams } from "@/services/logs.service";

interface LogState {
  logs: AuditLogItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  
  modules: string[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  search: string;
  selectedModule: string;
  selectedAction: string;
  startDate: string;
  endDate: string;

  // Selected Log Modal
  selectedLog: AuditLogItem | null;
  detailModalOpen: boolean;

  fetchLogs: (page?: number) => Promise<void>;
  fetchModules: () => Promise<void>;
  setSearch: (search: string) => void;
  setSelectedModule: (mod: string) => void;
  setSelectedAction: (action: string) => void;
  setDateRange: (start: string, end: string) => void;
  resetFilters: () => void;
  openDetailModal: (log: AuditLogItem) => void;
  closeDetailModal: () => void;
}

let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export const useLogStore = create<LogState>((set, get) => ({
  logs: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  
  modules: [],
  isLoading: false,
  error: null,
  
  search: "",
  selectedModule: "ALL",
  selectedAction: "ALL",
  startDate: "",
  endDate: "",

  selectedLog: null,
  detailModalOpen: false,

  fetchLogs: async (targetPage) => {
    const { search, selectedModule, selectedAction, startDate, endDate, pageSize, page: currentPage } = get();
    const pageToFetch = targetPage !== undefined ? targetPage : currentPage;

    set({ isLoading: true, error: null });

    try {
      const params: LogFilterParams = {
        search: search.trim() || undefined,
        module: selectedModule !== "ALL" ? selectedModule : undefined,
        action: selectedAction !== "ALL" ? selectedAction : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page: pageToFetch,
        page_size: pageSize,
      };

      const response = await LogsService.getLogs(params);
      if (response.success && response.data) {
        set({
          logs: response.data.items,
          total: response.data.total,
          page: response.data.page,
          pageSize: response.data.page_size,
          totalPages: response.data.total_pages,
          isLoading: false,
        });
      } else {
        set({ error: response.message || "Failed to load audit logs", isLoading: false });
      }
    } catch (err: any) {
      set({ error: err?.message || "Failed to fetch audit logs", isLoading: false });
    }
  },

  fetchModules: async () => {
    try {
      const res = await LogsService.getLogModules();
      if (res.success && Array.isArray(res.data)) {
        set({ modules: res.data });
      }
    } catch (err) {
      console.error("Error fetching log modules:", err);
    }
  },

  setSearch: (term: string) => {
    set({ search: term });
    if (searchDebounceTimer) clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      get().fetchLogs(1);
    }, 300);
  },

  setSelectedModule: (mod: string) => {
    set({ selectedModule: mod });
    get().fetchLogs(1);
  },

  setSelectedAction: (action: string) => {
    set({ selectedAction: action });
    get().fetchLogs(1);
  },

  setDateRange: (start: string, end: string) => {
    set({ startDate: start, endDate: end });
    get().fetchLogs(1);
  },

  resetFilters: () => {
    set({
      search: "",
      selectedModule: "ALL",
      selectedAction: "ALL",
      startDate: "",
      endDate: "",
    });
    get().fetchLogs(1);
  },

  openDetailModal: (log: AuditLogItem) => set({ selectedLog: log, detailModalOpen: true }),
  closeDetailModal: () => set({ selectedLog: null, detailModalOpen: false }),
}));

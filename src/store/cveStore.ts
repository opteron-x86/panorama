// src/store/cveStore.ts
import { create } from 'zustand';
import { CveFilters } from '@/api/types';

interface CveState {
  filters: CveFilters;
  page: number;
  pageSize: number;
  
  setFilters: (filters: Partial<CveFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
}

export const useCveStore = create<CveState>((set) => ({
  filters: {},
  page: 1,
  pageSize: 25,
  
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      page: 1
    })),
  
  clearFilters: () => 
    set({ filters: {}, page: 1 }),
  
  setPage: (page) => 
    set({ page }),
  
  setPageSize: (pageSize) => 
    set({ pageSize, page: 1 }),
}));
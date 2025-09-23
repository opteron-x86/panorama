// src/store/filterStore.ts
import { create } from 'zustand';
import { RuleFilters } from '@/api/types';

interface FilterState {
  filters: RuleFilters;
  page: number;
  pageSize: number;
  viewMode: 'list' | 'grid';
  
  setFilters: (filters: Partial<RuleFilters>) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setViewMode: (mode: 'list' | 'grid') => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: {},
  page: 1,
  pageSize: 25,
  viewMode: 'list',
  
  setFilters: (newFilters) => 
    set((state) => ({ 
      filters: { ...state.filters, ...newFilters },
      page: 1 // Reset to page 1 on filter change
    })),
  
  clearFilters: () => 
    set({ filters: {}, page: 1 }),
  
  setPage: (page) => 
    set({ page }),
  
  setPageSize: (pageSize) => 
    set({ pageSize, page: 1 }),
  
  setViewMode: (viewMode) => 
    set({ viewMode }),
  
  reset: () => 
    set({ filters: {}, page: 1, pageSize: 25, viewMode: 'list' })
}));
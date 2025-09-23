import { Pagination } from './types';

export interface PageParams {
  page: number;
  pageSize: number;
}

export function pageToOffset(page: number, pageSize: number): Pagination {
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

export function offsetToPage(offset: number, limit: number): PageParams {
  return {
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
  };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function getPaginationMeta(
  offset: number,
  limit: number,
  total: number
): PaginationMeta {
  const page = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    pageSize: limit,
    totalPages,
    totalItems: total,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
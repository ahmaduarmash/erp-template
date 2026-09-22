import type { RecordData } from './modules';

export interface QueryOptions {
  search?: string;
  page?: number;
  pageSize?: number;
  filters?: Record<string, string | number | boolean | Array<string | number>>;
  sort?: { field: string; direction: 'asc' | 'desc' };
}

export interface QueryResult<T> {
  rows: T[];
  total: number;
}

export interface EntityRepository<T extends { id: string }> {
  query(options?: QueryOptions): Promise<QueryResult<T>>;
  get(id: string): Promise<T | null>;
  create(input: Omit<T, 'id'> & { id?: string }): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}

export interface ErpRepository {
  module(name: string): EntityRepository<RecordData>;
}

/**
 * Production integration contract.
 *
 * The browser demo intentionally keeps WorkspaceProvider as a local adapter. Real projects should
 * implement this interface with authenticated HTTP/RPC calls, tenant scoping, server pagination,
 * optimistic concurrency, durable audit logging and server-side validation.
 */
export function createUnsupportedProductionRepository(): ErpRepository {
  const unsupported = (): never => {
    throw new Error('Connect a project repository adapter before using production data.');
  };
  return {
    module: () => ({
      query: async () => unsupported(),
      get: async () => unsupported(),
      create: async () => unsupported(),
      update: async () => unsupported(),
      remove: async () => unsupported(),
    }),
  };
}

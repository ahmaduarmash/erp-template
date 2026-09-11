import { templateConfig } from '../config/template.config';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { modules, seedModule, type RecordData } from './modules';
import { readStored, writeStored } from '../lib/storage';
export interface Activity {
  id: string;
  name: string;
  action: string;
  module: string;
  date: string;
  status: string;
}
export interface Notice {
  id: string;
  title: string;
  detail: string;
  category: 'inventory' | 'finance' | 'security';
  read: boolean;
  date: string;
}
interface Workspace {
  records: Record<string, RecordData[]>;
  activity: Activity[];
  notices: Notice[];
  profile: { name: string; email: string; title: string };
  org: { name: string; email: string; currency: string };
  roles: Record<string, string[]>;
}
const seed: Workspace = {
  records: Object.fromEntries(modules.map((m) => [m.key, seedModule(m)])),
  activity: Array.from({ length: 14 }, (_, i) => ({
    id: `audit-${i}`,
    name: ['Jamie Chen', 'Alex Morgan', 'Taylor Reed'][i % 3],
    action: [
      'Updated purchase order PO-2026-0101',
      'Created a new product',
      'Reviewed journal JE-2026-0102',
      'Updated workspace appearance',
    ][i % 4],
    module: ['Inventory', 'Inventory', 'Accounting', 'Settings'][i % 4],
    date: new Date(Date.now() - i * 3600000).toISOString(),
    status: 'Success',
  })),
  notices: [
    {
      id: 'n1',
      title: 'Stock needs attention',
      detail: '3 products are below their reorder point.',
      category: 'inventory',
      read: false,
      date: new Date().toISOString(),
    },
    {
      id: 'n2',
      title: 'Invoice ready for review',
      detail: 'INV-2026-0104 was sent to your review queue.',
      category: 'finance',
      read: false,
      date: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'n3',
      title: 'Welcome to your workspace',
      detail: 'Explore your appearance settings to make it yours.',
      category: 'security',
      read: true,
      date: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  profile: { name: 'Alex Morgan', email: 'alex@example.com', title: 'Workspace administrator' },
  org: {
    name: `${templateConfig.brand.name} Operations`,
    email: 'hello@example.com',
    currency: 'USD',
  },
  roles: {
    Admin: ['View', 'Create', 'Edit', 'Delete', 'Export'],
    Manager: ['View', 'Create', 'Edit', 'Export'],
    Member: ['View'],
  },
};
type API = Workspace & {
  storageError: boolean;
  save: (module: string, row: RecordData) => void;
  remove: (module: string, ids: string[]) => void;
  markRead: (id?: string) => void;
  updateProfile: (p: Workspace['profile']) => void;
  updateOrg: (p: Workspace['org']) => void;
  updateRole: (name: string, permissions: string[]) => void;
  receiveNotice: (notice: Omit<Notice, 'id' | 'read' | 'date'>) => void;
};
const Context = createContext<API>(null!);
export const useWorkspace = () => useContext(Context);
export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Workspace>(() => {
    const saved = readStored<Workspace | null>('aster:demo-workspace:v1', null);
    return saved &&
      saved.records &&
      saved.activity &&
      saved.notices &&
      saved.profile &&
      saved.roles &&
      saved.org
      ? { ...seed, ...saved, records: { ...seed.records, ...saved.records } }
      : seed;
  });
  const [storageError, setStorageError] = useState(false);
  const value = useMemo<API>(() => {
    const update = (fn: (d: Workspace) => Workspace) =>
      setData((previous) => {
        const next = fn(previous);
        queueMicrotask(() => setStorageError(!writeStored('aster:demo-workspace:v1', next)));
        return next;
      });
    const audit = (d: Workspace, action: string, module: string) => [
      {
        id: crypto.randomUUID(),
        name: d.profile.name,
        action,
        module,
        date: new Date().toISOString(),
        status: 'Success',
      },
      ...d.activity,
    ];
    return {
      ...data,
      storageError,
      save: (module, row) =>
        update((d) => {
          const exists = d.records[module].some((r) => r.id === row.id);
          return {
            ...d,
            records: {
              ...d.records,
              [module]: exists
                ? d.records[module].map((r) => (r.id === row.id ? row : r))
                : [row, ...d.records[module]],
            },
            activity: audit(d, `${exists ? 'Updated' : 'Created'} ${row.name}`, module),
          };
        }),
      remove: (module, ids) =>
        update((d) => ({
          ...d,
          records: { ...d.records, [module]: d.records[module].filter((r) => !ids.includes(r.id)) },
          activity: audit(d, `Deleted ${ids.length} record(s)`, module),
        })),
      receiveNotice: (notice) =>
        update((d) => ({
          ...d,
          notices: [
            { ...notice, id: crypto.randomUUID(), read: false, date: new Date().toISOString() },
            ...d.notices,
          ],
        })),
      markRead: (id) =>
        update((d) => ({
          ...d,
          notices: d.notices.map((n) => (!id || n.id === id ? { ...n, read: true } : n)),
        })),
      updateProfile: (profile) =>
        update((d) => ({ ...d, profile, activity: audit(d, 'Updated profile', 'Profile') })),
      updateOrg: (org) =>
        update((d) => ({ ...d, org, activity: audit(d, 'Updated organization', 'Settings') })),
      updateRole: (name, permissions) =>
        update((d) => ({
          ...d,
          roles: { ...d.roles, [name]: permissions },
          activity: audit(d, `Updated ${name} permissions`, 'Users'),
        })),
    };
  }, [data, storageError]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

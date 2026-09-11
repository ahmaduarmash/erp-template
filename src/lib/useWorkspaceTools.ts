import { useEffect, useRef } from 'react';
import { useWorkspace } from '../data/WorkspaceProvider';
interface ModelContext {
  registerTool: (
    tool: {
      name: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
}
/** Optional feature-detected, read-only access to the same demo records shown in the UI. */
export function useWorkspaceTools() {
  const workspace = useWorkspace();
  const current = useRef(workspace);
  current.current = workspace;
  useEffect(() => {
    const context = (document as Document & { modelContext?: ModelContext }).modelContext;
    if (!context) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'read_workspace_records',
            description:
              'Read up to 100 demo records from a named workspace module. Does not change data.',
            inputSchema: {
              type: 'object',
              properties: {
                module: { type: 'string' },
                limit: { type: 'integer', minimum: 1, maximum: 100 },
              },
              required: ['module'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: true },
            execute(input) {
              if (!input || typeof input !== 'object') throw new Error('Expected an object');
              const { module, limit = 25 } = input as { module: unknown; limit?: unknown };
              if (
                typeof module !== 'string' ||
                !Object.hasOwn(current.current.records, module) ||
                typeof limit !== 'number' ||
                !Number.isInteger(limit) ||
                limit < 1 ||
                limit > 100
              )
                throw new Error('Invalid module or limit');
              return {
                module,
                total: current.current.records[module].length,
                records: current.current.records[module].slice(0, limit),
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* Optional browser API. */
    }
    return () => lifecycle.abort();
  }, []);
}

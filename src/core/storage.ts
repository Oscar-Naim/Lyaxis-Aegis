import type { AuditHistoryEntry, LocalStoreV1, PolicyConfig, Project } from './models.ts';
import { DEFAULT_POLICY } from './models.ts';
import { sanitizeAuditForPersistence } from './sanitization.ts';

const STORE_KEY = 'lyaxis-aegis:store';

const emptyStore = (): LocalStoreV1 => ({
  schemaVersion: 1,
  projects: [],
  audits: [],
  policies: [DEFAULT_POLICY],
});

function isStore(value: unknown): value is LocalStoreV1 {
  return Boolean(value && typeof value === 'object' && (value as LocalStoreV1).schemaVersion === 1);
}

export function loadStore(): LocalStoreV1 {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyStore();
    const parsed: unknown = JSON.parse(raw);
    if (isStore(parsed)) return parsed;
    return migrateStore(parsed);
  } catch {
    return emptyStore();
  }
}

export function migrateStore(value: unknown): LocalStoreV1 {
  // Version 1 is the first persistent format. Unknown data is never overwritten.
  if (!isStore(value)) return emptyStore();
  return value;
}

export function saveStore(store: LocalStoreV1): void {
  window.localStorage.setItem(STORE_KEY, JSON.stringify({ ...store, schemaVersion: 1 }));
}

export function saveAudit(project: Project, audit: AuditHistoryEntry): LocalStoreV1 {
  const store = loadStore();
  const now = new Date().toISOString();
  const nextProject: Project = { ...project, latestAuditId: audit.id, updatedAt: now };
  const projects = store.projects.some(item => item.id === project.id)
    ? store.projects.map(item => item.id === project.id ? nextProject : item)
    : [nextProject, ...store.projects];
  const safeAudit = sanitizeAuditForPersistence(audit);
  const audits = [safeAudit, ...store.audits.filter(item => item.id !== audit.id)];
  const next = { ...store, projects, audits };
  saveStore(next);
  return next;
}

export function updateAudit(audit: AuditHistoryEntry): LocalStoreV1 {
  const store = loadStore();
  const next = {
    ...store,
    audits: store.audits.map(item => item.id === audit.id ? sanitizeAuditForPersistence(audit) : item),
  };
  saveStore(next);
  return next;
}

export function deleteProject(projectId: string): LocalStoreV1 {
  const store = loadStore();
  const next = {
    ...store,
    projects: store.projects.filter(project => project.id !== projectId),
    audits: store.audits.filter(audit => audit.projectId !== projectId),
  };
  saveStore(next);
  return next;
}

export function savePolicy(policy: PolicyConfig): LocalStoreV1 {
  const store = loadStore();
  const next = {
    ...store,
    policies: [policy, ...store.policies.filter(item => item.id !== policy.id)],
  };
  saveStore(next);
  return next;
}

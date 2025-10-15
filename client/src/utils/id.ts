import api from '../services/api';

async function fetchMaxId(endpoint: string, idField: string = 'id'): Promise<number> {
  const res = await api.get(endpoint);
  const items: Array<Record<string, unknown>> = res.data || [];
  if (!Array.isArray(items) || items.length === 0) return 0;
  const numericIds = items
    .map(item => Number((item as Record<string, unknown>)[idField] as number))
    .filter(n => Number.isFinite(n));
  if (numericIds.length === 0) return 0;
  return Math.max(...numericIds);
}

export async function generateNextId(
  endpoint: string,
  idField: string = 'id',
  startAt: number = 1
): Promise<number> {
  const maxId = await fetchMaxId(endpoint, idField);
  if (maxId < startAt - 1) {
    return startAt;
  }
  return maxId + 1;
}

export const generateUserId = () => generateNextId('/users', 'id', 1);
export const generateBoardId = () => generateNextId('/boards', 'id', 101);
export const generateListId = () => generateNextId('/lists', 'id', 201);
export const generateTaskId = () => generateNextId('/tasks', 'id', 301);
export const generateTagId = () => generateNextId('/tags', 'id', 401);



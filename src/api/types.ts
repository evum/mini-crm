import type { TaskStatus } from '@/lib/crm';

export type ListFilters = { search: string; page: number };
export type TaskFilters = ListFilters & { status: TaskStatus | '' };

import type { Tables, Enums } from './database.types';

export type Profile = Tables<'profiles'>;
export type TaskStatus = Enums<'task_status'>;
export type Task = Tables<'tasks'> & {
	object_name: string;
	assignee_name: string | null;
	author_name: string | null;
};
export type Building = Tables<'objects'> & {
	task_counts: Record<TaskStatus | 'total', number>;
};
export type Page<T> = {
	items: T[];
	total: number;
	limit: number;
	offset: number;
};
export const PAGE_SIZE = 12;

export type TaskHistory = Tables<'task_status_history'> & {
	changed_by_name: string | null;
};
export type ObjectDetails = {
	object: Tables<'objects'>;
	task_counts: Building['task_counts'];
	permissions: {
		can_edit: boolean;
		can_delete: boolean;
		can_create_task: boolean;
	};
	tasks: Page<Task>;
};
export type TaskDetails = {
	task: Tables<'tasks'>;
	object: Pick<Building, 'id' | 'name' | 'address'>;
	assignee: { id: string | null; full_name: string | null };
	author: { id: string | null; full_name: string | null };
	actions: {
		can_edit: boolean;
		can_delete: boolean;
		expected_status: TaskStatus;
		transitions: {
			action: string;
			target_status: TaskStatus;
			comment_required: boolean;
		}[];
	};
	history: Page<TaskHistory>;
};

export function formatDateTime(value: string) {
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(new Date(value));
}

export const statuses: Record<
	TaskStatus,
	{ label: string; className: string }
> = {
	new: { label: 'Новая', className: 'bg-slate-100 text-slate-700' },
	in_progress: {
		label: 'В работе',
		className: 'bg-blue-50 text-blue-700'
	},
	in_review: {
		label: 'На проверке',
		className: 'bg-amber-50 text-amber-800'
	},
	rework: {
		label: 'На доработке',
		className: 'bg-orange-50 text-orange-800'
	},
	accepted: {
		label: 'Принята',
		className: 'bg-emerald-50 text-emerald-800'
	}
};

export function isAccessError(error: unknown) {
	return (
		typeof error === 'object' &&
		error !== null &&
		'code' in error &&
		error.code === '42501'
	);
}

export function formatDate(value: string) {
	return new Intl.DateTimeFormat('ru-RU', {
		day: 'numeric',
		month: 'short',
		year: 'numeric'
	}).format(new Date(value));
}

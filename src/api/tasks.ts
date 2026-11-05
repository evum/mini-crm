import { getApiClient } from './client';
import type { TaskFilters } from './types';
import {
	PAGE_SIZE,
	type Page,
	type Task,
	type TaskDetails,
	type TaskHistory
} from '@/lib/crm';
import type { TaskStatus } from '@/lib/crm';
import type { Tables } from '@/lib/database.types';

export type TaskInput = {
	title: string;
	description: string;
	objectId: string;
	assigneeId: string;
};

export async function createTask(input: TaskInput) {
	const { data, error } = await getApiClient()
		.rpc('create_task', {
			p_title: input.title.trim(),
			p_description: input.description.trim(),
			p_object_id: input.objectId,
			p_assignee_id: input.assigneeId
		})
		.single<Tables<'tasks'>>();
	if (error) throw error;
	if (!data) throw new Error('Task was not returned');
	return data;
}

export async function updateTask(input: TaskInput & { id: string }) {
	const { data, error } = await getApiClient()
		.rpc('update_task', {
			p_task_id: input.id,
			p_title: input.title.trim(),
			p_description: input.description.trim(),
			p_object_id: input.objectId,
			p_assignee_id: input.assigneeId
		})
		.single<Tables<'tasks'>>();
	if (error) throw error;
	if (!data) throw new Error('Task was not returned');
	return data;
}

export async function deleteTask(id: string) {
	const { error } = await getApiClient().rpc('delete_task', { p_task_id: id });
	if (error) throw error;
}

export type ChangeTaskStatusInput = {
	taskId: string;
	expectedStatus: TaskStatus;
	newStatus: TaskStatus;
	comment: string;
};

export async function changeTaskStatus(input: ChangeTaskStatusInput) {
	const comment = input.comment.trim();
	if (input.newStatus === 'rework' && !comment) {
		throw Object.assign(new Error('A comment is required'), { code: '23514' });
	}
	const { data, error } = await getApiClient()
		.rpc('change_task_status', {
			p_task_id: input.taskId,
			p_expected_status: input.expectedStatus,
			p_new_status: input.newStatus,
			p_comment: comment || undefined
		})
		.single<Tables<'tasks'>>();
	if (error) throw error;
	return data;
}

export async function listMyTasks(filters: TaskFilters, signal: AbortSignal) {
	const { data, error } = await getApiClient()
		.rpc('list_my_tasks', {
			p_search: filters.search,
			p_status: filters.status || undefined,
			p_limit: PAGE_SIZE,
			p_offset: filters.page * PAGE_SIZE
		})
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as Page<Task>;
}

export async function listObjectTasks(
	objectId: string,
	filters: TaskFilters,
	signal: AbortSignal
) {
	const { data, error } = await getApiClient()
		.rpc('list_tasks', {
			p_object_id: objectId,
			p_search: filters.search,
			p_status: filters.status || undefined,
			p_offset: filters.page * PAGE_SIZE,
			p_limit: PAGE_SIZE
		})
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as Page<Task>;
}

export async function getTaskDetails(taskId: string, signal: AbortSignal) {
	const { data, error } = await getApiClient()
		.rpc('get_task_details', { p_task_id: taskId })
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as TaskDetails;
}

export async function listTaskHistory(
	taskId: string,
	page: number,
	signal: AbortSignal
) {
	const { data, error } = await getApiClient()
		.rpc('list_task_history', {
			p_task_id: taskId,
			p_limit: PAGE_SIZE,
			p_offset: page * PAGE_SIZE
		})
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as Page<TaskHistory>;
}

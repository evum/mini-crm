import { useQuery } from '@tanstack/react-query';
import { getObjectDetails } from '@/api/objects';
import { getTaskDetails, listObjectTasks, listTaskHistory } from '@/api/tasks';
import type { TaskFilters } from '@/api/types';

export function useObjectDetails(userId: string, objectId: string) {
	return useQuery({
		queryKey: ['object-details', userId, objectId],
		queryFn: ({ signal }) => getObjectDetails(objectId, signal),
		retry: false
	});
}

export function useObjectTasks(
	userId: string,
	objectId: string,
	filters: TaskFilters,
	enabled: boolean
) {
	return useQuery({
		queryKey: ['object-tasks', userId, objectId, filters],
		enabled,
		queryFn: ({ signal }) => listObjectTasks(objectId, filters, signal),
		retry: false
	});
}

export function useTaskDetails(userId: string, taskId: string) {
	return useQuery({
		queryKey: ['task-details', userId, taskId],
		queryFn: ({ signal }) => getTaskDetails(taskId, signal),
		retry: false
	});
}

export function useTaskHistory(
	userId: string,
	taskId: string,
	page: number,
	enabled: boolean
) {
	return useQuery({
		queryKey: ['task-history', userId, taskId, page],
		enabled,
		queryFn: ({ signal }) => listTaskHistory(taskId, page, signal),
		retry: false
	});
}

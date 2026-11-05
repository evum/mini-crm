import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeTaskStatus } from '@/api/tasks';

const taskQueryKeys = new Set([
	'task-details',
	'task-history',
	'my-tasks',
	'object-tasks',
	'object-details',
	'objects'
]);

export function useChangeTaskStatus(userId: string) {
	const queryClient = useQueryClient();
	const refreshTasks = () =>
		queryClient.invalidateQueries({
			predicate: (query) =>
				taskQueryKeys.has(String(query.queryKey[0])) &&
				query.queryKey[1] === userId
		});

	return useMutation({
		mutationFn: changeTaskStatus,
		retry: false,
		onSuccess: refreshTasks,
		onError: (error) => {
			// Re-read permissions and the expected status after a server rejection.
			if (
				'code' in error &&
				['40001', '42501', '23514'].includes(String(error.code))
			) {
				return refreshTasks();
			}
		}
	});
}

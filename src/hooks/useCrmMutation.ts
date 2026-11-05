import { useMutation, useQueryClient } from '@tanstack/react-query';

const crmKeys = new Set([
	'objects',
	'object-details',
	'object-tasks',
	'my-tasks',
	'task-details',
	'task-history',
	'object-options',
	'executor-options'
]);

export function useCrmMutation<TInput, TData>(
	userId: string,
	mutationFn: (input: TInput) => Promise<TData>,
	onSaved: (data: TData) => void
) {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn,
		retry: false,
		onSuccess: async (data) => {
			// Navigate away from deleted records before re-reading their caches.
			onSaved(data);
			await queryClient.invalidateQueries({
				predicate: (query) =>
					crmKeys.has(String(query.queryKey[0])) && query.queryKey[1] === userId
			});
		}
	});
}

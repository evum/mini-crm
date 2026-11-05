import { useQuery } from '@tanstack/react-query';
import { getCurrentProfile } from '@/api/profiles';

export function useProfile(userId: string | undefined) {
	return useQuery({
		queryKey: ['profile', userId],
		enabled: Boolean(userId),
		queryFn: ({ signal }) => getCurrentProfile(userId, signal),
		retry: false,
		staleTime: 0
	});
}

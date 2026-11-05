import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	getSession,
	signIn as signInRequest,
	signOut as signOutRequest,
	subscribeToAuthChanges,
	type Session
} from '@/api/auth';
import { isApiConfigured } from '@/api/client';

const sessionKey = ['auth', 'session'] as const;

export function useAuth() {
	const queryClient = useQueryClient();
	const sessionQuery = useQuery({
		queryKey: sessionKey,
		queryFn: getSession,
		enabled: isApiConfigured,
		staleTime: Infinity,
		gcTime: 0,
		retry: false
	});

	useEffect(() => {
		const unsubscribe = subscribeToAuthChanges((event, session) => {
			// A stale in-flight session read must not overwrite an auth event.
			void queryClient.cancelQueries({ queryKey: sessionKey });
			const previous = queryClient.getQueryData<Session | null>(sessionKey);
			if (event === 'SIGNED_OUT' || previous?.user.id !== session?.user.id) {
				queryClient.removeQueries({
					predicate: (query) => query.queryKey[0] !== 'auth'
				});
			}
			queryClient.setQueryData(sessionKey, session);
		});
		return unsubscribe;
	}, [queryClient]);

	const signIn = useMutation({
		gcTime: 0,
		mutationFn: signInRequest,
		onSuccess: (session) => queryClient.setQueryData(sessionKey, session)
	});

	const signOut = useMutation({
		mutationFn: signOutRequest,
		onSuccess: () => {
			queryClient.removeQueries({
				predicate: (query) => query.queryKey[0] !== 'auth'
			});
			queryClient.setQueryData(sessionKey, null);
			signIn.reset();
		}
	});

	return {
		session: sessionQuery.data,
		initializing: sessionQuery.isLoading,
		sessionError: sessionQuery.error,
		signIn,
		signOut
	};
}

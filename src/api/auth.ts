import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getApiClient, isApiConfigured } from './client';

export type { Session } from '@supabase/supabase-js';

export type SignInCredentials = {
	email: string;
	password: string;
};

export async function getSession() {
	if (!isApiConfigured) return null;
	const { data, error } = await getApiClient().auth.getSession();
	if (error) throw error;
	return data.session;
}

export function subscribeToAuthChanges(
	callback: (event: AuthChangeEvent, session: Session | null) => void
) {
	if (!isApiConfigured) return () => {};
	const {
		data: { subscription }
	} = getApiClient().auth.onAuthStateChange(callback);
	return () => subscription.unsubscribe();
}

export async function signIn({ email, password }: SignInCredentials) {
	const { data, error } = await getApiClient().auth.signInWithPassword({
		email: email.trim(),
		password
	});
	if (error) throw error;
	return data.session;
}

export async function signOut() {
	if (!isApiConfigured) return;
	const { error } = await getApiClient().auth.signOut();
	if (error) throw error;
}

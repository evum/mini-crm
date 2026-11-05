import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

// Only a publishable key may be shipped to the browser.
const client =
	url && /^https?:\/\//.test(url) && key?.startsWith('sb_publishable_')
		? createClient<Database>(url, key)
		: null;

export const isApiConfigured = Boolean(client);

export function getApiClient() {
	if (!client) throw new Error('Supabase is not configured');
	return client;
}

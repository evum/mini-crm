import { getApiClient } from './client';
import { PAGE_SIZE, type Page, type Profile } from '@/lib/crm';
import type { ListFilters } from './types';

export type Executor = Pick<Profile, 'id' | 'full_name'>;

export async function listExecutors(filters: ListFilters, signal: AbortSignal) {
	const { data, error } = await getApiClient()
		.rpc('list_executors', {
			p_search: filters.search,
			p_limit: PAGE_SIZE,
			p_offset: filters.page * PAGE_SIZE
		})
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as Page<Executor>;
}

export async function getCurrentProfile(
	userId: string | undefined,
	signal: AbortSignal
) {
	if (!userId) throw new Error('Authentication required');
	const { data, error } = await getApiClient()
		.rpc('get_current_profile')
		.abortSignal(signal)
		.single<Profile>();
	if (error) throw error;
	if (
		!data ||
		data.id !== userId ||
		!data.is_active ||
		!['executor', 'dispatcher'].includes(data.role)
	) {
		throw Object.assign(new Error('Active profile required'), {
			code: '42501'
		});
	}
	return data;
}

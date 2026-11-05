import { getApiClient } from './client';
import type { Profile } from '@/lib/crm';

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

import { getApiClient } from './client';
import type { ListFilters } from './types';
import {
	PAGE_SIZE,
	type Building,
	type ObjectDetails,
	type Page
} from '@/lib/crm';

export async function listObjects(filters: ListFilters, signal: AbortSignal) {
	const { data, error } = await getApiClient()
		.rpc('list_objects', {
			p_search: filters.search,
			p_limit: PAGE_SIZE,
			p_offset: filters.page * PAGE_SIZE
		})
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as Page<Building>;
}

export async function getObjectDetails(objectId: string, signal: AbortSignal) {
	const { data, error } = await getApiClient()
		.rpc('get_object_details', { p_object_id: objectId })
		.abortSignal(signal);
	if (error) throw error;
	return data as unknown as ObjectDetails;
}

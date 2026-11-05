import { getApiClient } from './client';
import type { ListFilters } from './types';
import {
	PAGE_SIZE,
	type Building,
	type ObjectDetails,
	type Page
} from '@/lib/crm';
import type { Tables } from '@/lib/database.types';

export type ObjectInput = { name: string; address: string };

export async function createObject(input: ObjectInput) {
	const { data, error } = await getApiClient()
		.rpc('create_object', {
			p_name: input.name.trim(),
			p_address: input.address.trim()
		})
		.single<Tables<'objects'>>();
	if (error) throw error;
	if (!data) throw new Error('Object was not returned');
	return data;
}

export async function updateObject(input: ObjectInput & { id: string }) {
	const { data, error } = await getApiClient()
		.rpc('update_object', {
			p_object_id: input.id,
			p_name: input.name.trim(),
			p_address: input.address.trim()
		})
		.single<Tables<'objects'>>();
	if (error) throw error;
	if (!data) throw new Error('Object was not returned');
	return data;
}

export async function deleteObject(id: string) {
	const { error } = await getApiClient().rpc('delete_object', {
		p_object_id: id
	});
	if (error) throw error;
}

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

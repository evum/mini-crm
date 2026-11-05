import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
	Workspace,
	type WorkspaceProps
} from '@/components/workspace/workspace';
import {
	EmptyList,
	ListError,
	ListLoading,
	Pagination,
	SearchForm
} from '@/components/workspace/listControls';
import { listObjects } from '@/api/objects';
import Object from './object';
import { CreateObjectButton } from './objectManagement';

export function Objects(props: WorkspaceProps) {
	const executor = props.profile.role === 'executor';
	const [filters, setFilters] = useState({ search: '', page: 0 });
	const objects = useQuery({
		queryKey: ['objects', props.profile.id, filters],
		queryFn: ({ signal }) => listObjects(filters, signal),
		retry: false
	});

	return (
		<Workspace {...props} section='objects'>
			<div className='mb-8 flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
						{executor ? 'Мои объекты' : 'Объекты'}
					</h1>
					<p className='mt-3 text-sm text-muted-foreground'>
						{executor
							? 'Объекты, на которых вам назначены задачи. Счётчики учитывают только ваши задачи.'
							: 'Строительные объекты и текущий ход работ.'}
					</p>
				</div>
				{objects.data && !objects.error && (
					<span className='rounded-lg border bg-white px-4 py-2 text-sm text-muted-foreground'>
						Найдено объектов:{' '}
						<strong className='text-foreground'>{objects.data.total}</strong>
					</span>
				)}
			</div>
			<div className='mb-6'>
				{!executor && (
					<div className='mb-5'>
						<CreateObjectButton userId={props.profile.id} />
					</div>
				)}
				<SearchForm
					placeholder='Поиск по названию или адресу'
					onSearch={(search) => setFilters({ search, page: 0 })}
				/>
			</div>
			{objects.isPending ? (
				<ListLoading />
			) : objects.error ? (
				<ListError error={objects.error} retry={() => void objects.refetch()} />
			) : objects.data.items.length === 0 ? (
				<EmptyList
					filtered={Boolean(filters.search)}
					subject={
						executor
							? 'У вас пока нет объектов с назначенными задачами'
							: 'Объектов пока нет'
					}
				/>
			) : (
				<ul
					className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'
					aria-label={executor ? 'Мои объекты' : 'Объекты'}
				>
					{objects.data.items.map((object) => (
						<Object key={object.id} object={object} />
					))}
				</ul>
			)}
			{objects.data && !objects.error && (
				<Pagination
					page={filters.page}
					total={objects.data.total}
					setPage={(page) => setFilters((current) => ({ ...current, page }))}
					busy={objects.isFetching}
				/>
			)}
		</Workspace>
	);
}

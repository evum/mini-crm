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
	Pagination
} from '@/components/workspace/listControls';
import { listMyTasks } from '@/api/tasks';
import Task from './task';
import TaskFiltersPanel from './taskFiltersPanel';
import { TaskFilters } from '@/api/types';

export function MyTasks(props: WorkspaceProps) {
	const [filters, setFilters] = useState<TaskFilters>({
		search: '',
		status: '',
		page: 0
	});
	const tasks = useQuery({
		queryKey: ['my-tasks', props.profile.id, filters],
		queryFn: ({ signal }) => listMyTasks(filters, signal),
		retry: false
	});

	return (
		<Workspace {...props}>
			<div className='mb-8 flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-3xl font-semibold tracking-tight md:text-4xl'>
						Мои задачи
					</h1>
					<p className='mt-3 text-sm text-muted-foreground'>
						Все назначенные вам работы — в одном месте.
					</p>
				</div>
				{tasks.data && !tasks.error && (
					<span className='rounded-lg border bg-white px-4 py-2 text-sm text-muted-foreground'>
						Найдено задач:{' '}
						<strong className='text-foreground'>
							{tasks.data.total}
						</strong>
					</span>
				)}
			</div>
			<TaskFiltersPanel filters={filters} setFilters={setFilters} />
			{tasks.isPending ? (
				<ListLoading />
			) : tasks.error ? (
				<ListError
					error={tasks.error}
					retry={() => void tasks.refetch()}
				/>
			) : tasks.data.items.length === 0 ? (
				<EmptyList
					filtered={Boolean(filters.search || filters.status)}
					subject='Назначенных задач пока нет'
				/>
			) : (
				<ul
					className='grid gap-4 lg:grid-cols-2'
					aria-label='Мои задачи'
				>
					{tasks.data.items.map((task) => (
						<li
							key={task.id}
							className='relative flex flex-col rounded-xl border bg-white p-6 transition-colors hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring'
						>
							<Task task={task} />
						</li>
					))}
				</ul>
			)}
			{tasks.data && !tasks.error && (
				<Pagination
					page={filters.page}
					total={tasks.data.total}
					setPage={(page) =>
						setFilters((current) => ({ ...current, page }))
					}
					busy={tasks.isFetching}
				/>
			)}
		</Workspace>
	);
}

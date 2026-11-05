import { useState } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
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
import { useObjectDetails, useObjectTasks } from '@/hooks/useDetails';
import { taskHref } from '@/hooks/useRoute';
import { formatDate, statuses, type TaskStatus } from '@/lib/crm';
import { ObjectManagement } from './objectManagement';
import { CreateTaskButton } from '@/components/tasks/taskManagement';

type Props = WorkspaceProps & { objectId: string };

export function ObjectDetailsScreen({ objectId, ...props }: Props) {
	const details = useObjectDetails(props.profile.id, objectId);
	const [filters, setFilters] = useState({
		search: '',
		status: '' as TaskStatus | '',
		page: 0
	});
	const tasks = useObjectTasks(
		props.profile.id,
		objectId,
		filters,
		Boolean(details.data) && !details.error
	);

	return (
		<Workspace {...props} section='objects'>
			<a
				href='#/objects'
				className='mb-6 inline-flex items-center gap-2 rounded-sm text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring'
			>
				<ArrowLeft className='size-4' aria-hidden='true' />
				{props.profile.role === 'executor' ? 'К моим объектам' : 'К объектам'}
			</a>
			{details.isPending ? (
				<ListLoading />
			) : details.error ? (
				<ListError error={details.error} retry={() => void details.refetch()} />
			) : (
				<>
					<header className='mb-8 rounded-xl border bg-white p-6 md:p-8'>
						<p className='mb-3 text-[10px] font-medium tracking-[2px] text-muted-foreground'>
							ОБЪЕКТ
						</p>
						<h1 className='text-3xl font-semibold tracking-tight wrap-anywhere md:text-4xl'>
							{details.data.object.name}
						</h1>
						<p className='mt-4 flex items-start gap-2 text-sm text-muted-foreground'>
							<MapPin className='mt-0.5 size-4 shrink-0' aria-hidden='true' />
							<span className='wrap-anywhere'>
								{details.data.object.address}
							</span>
						</p>
						{props.profile.role === 'executor' && (
							<p className='mt-4 text-xs text-muted-foreground'>
								Показаны только назначенные вам задачи по этому объекту.
							</p>
						)}
						<dl className='mt-6 grid grid-cols-2 gap-5 border-t pt-6 sm:grid-cols-3 lg:grid-cols-6'>
							<div>
								<dt className='text-xs text-muted-foreground'>Всего задач</dt>
								<dd className='mt-2 text-2xl font-semibold'>
									{details.data.task_counts.total}
								</dd>
							</div>
							{Object.entries(statuses).map(([status, info]) => (
								<div key={status}>
									<dt className='text-xs text-muted-foreground'>
										{info.label}
									</dt>
									<dd className='mt-2 text-2xl font-semibold'>
										{details.data.task_counts[status as TaskStatus]}
									</dd>
								</div>
							))}
						</dl>
						{props.profile.role === 'dispatcher' && (
							<ObjectManagement
								userId={props.profile.id}
								details={details.data}
								refreshing={details.isFetching}
							/>
						)}
					</header>
					<section aria-labelledby='object-tasks-title'>
						<h2 id='object-tasks-title' className='mb-5 text-xl font-semibold'>
							Задачи объекта
						</h2>
						{props.profile.role === 'dispatcher' &&
							details.data.permissions.can_create_task && (
								<div className='mb-5'>
									<CreateTaskButton
										userId={props.profile.id}
										objectId={objectId}
										objectName={details.data.object.name}
										disabled={details.isFetching}
									/>
								</div>
							)}
						<div className='mb-6 flex flex-wrap gap-3'>
							<SearchForm
								placeholder='Поиск по названию или описанию'
								onSearch={(search) =>
									setFilters((current) => ({
										...current,
										search,
										page: 0
									}))
								}
							/>
							<label className='sr-only' htmlFor='object-task-status'>
								Статус задачи
							</label>
							<select
								id='object-task-status'
								value={filters.status}
								onChange={(event) =>
									setFilters((current) => ({
										...current,
										status: event.target.value as TaskStatus | '',
										page: 0
									}))
								}
								className='h-10 rounded-md border bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring'
							>
								<option value=''>Все статусы</option>
								{Object.entries(statuses).map(([status, info]) => (
									<option key={status} value={status}>
										{info.label}
									</option>
								))}
							</select>
						</div>
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
								subject='Задач по объекту пока нет'
							/>
						) : (
							<ul className='space-y-3' aria-label='Задачи объекта'>
								{tasks.data.items.map((task) => (
									<li
										key={task.id}
										className='relative rounded-xl border bg-white p-5 transition-colors hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring md:p-6'
									>
										<div className='flex flex-wrap items-start justify-between gap-3'>
											<h3 className='min-w-0 text-base font-semibold wrap-anywhere'>
												<a
													href={taskHref(task.id)}
													className='rounded-sm after:absolute after:inset-0 after:rounded-xl hover:text-primary hover:underline focus-visible:outline-none'
												>
													{task.title}
												</a>
											</h3>
											<span
												className={`rounded-full px-3 py-1 text-xs font-medium ${statuses[task.status].className}`}
											>
												{statuses[task.status].label}
											</span>
										</div>
										<p className='mt-3 line-clamp-2 text-sm leading-6 whitespace-pre-line text-muted-foreground wrap-anywhere'>
											{task.description || 'Описание не добавлено.'}
										</p>
										<dl className='mt-4 flex flex-wrap gap-x-8 gap-y-3 text-xs'>
											<div>
												<dt className='text-muted-foreground'>Исполнитель</dt>
												<dd className='mt-1'>
													{task.assignee_name || 'Не указан'}
												</dd>
											</div>
											<div>
												<dt className='text-muted-foreground'>Создана</dt>
												<dd className='mt-1'>
													<time dateTime={task.created_at}>
														{formatDate(task.created_at)}
													</time>
												</dd>
											</div>
										</dl>
									</li>
								))}
							</ul>
						)}
						{tasks.data && !tasks.error && (
							<Pagination
								page={filters.page}
								total={tasks.data.total}
								setPage={(page) =>
									setFilters((current) => ({
										...current,
										page
									}))
								}
								busy={tasks.isFetching}
							/>
						)}
					</section>
				</>
			)}
		</Workspace>
	);
}

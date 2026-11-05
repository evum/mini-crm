import { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
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
import { useTaskDetails, useTaskHistory } from '@/hooks/useDetails';
import { objectHref } from '@/hooks/useRoute';
import { formatDateTime, statuses } from '@/lib/crm';
import { TaskStatusActions } from './taskStatusActions';

type Props = WorkspaceProps & { taskId: string };

export function TaskDetailsScreen({ taskId, ...props }: Props) {
	const details = useTaskDetails(props.profile.id, taskId);
	const [page, setPage] = useState(0);
	const history = useTaskHistory(
		props.profile.id,
		taskId,
		page,
		Boolean(details.data) && !details.error
	);

	return (
		<Workspace {...props}>
			<a
				href='#/'
				className='mb-6 inline-flex items-center gap-2 rounded-sm text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring'
			>
				<ArrowLeft className='size-4' aria-hidden='true' />
				{props.profile.role === 'executor' ? 'К моим задачам' : 'К объектам'}
			</a>
			{details.isPending ? (
				<ListLoading />
			) : details.error ? (
				<ListError error={details.error} retry={() => void details.refetch()} />
			) : (
				<>
					<header className='mb-8'>
						<a
							href={objectHref(details.data.object.id)}
							className='mb-5 inline-flex items-center gap-2 rounded-sm text-sm text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring'
						>
							<Building2 className='size-4 shrink-0' aria-hidden='true' />
							<span className='wrap-anywhere'>{details.data.object.name}</span>
						</a>
						<div className='flex flex-wrap items-start justify-between gap-4'>
							<h1 className='min-w-0 text-3xl leading-tight font-semibold tracking-tight wrap-anywhere md:max-w-4xl md:text-4xl'>
								{details.data.task.title}
							</h1>
							<span
								className={`rounded-full px-3 py-1.5 text-xs font-medium ${statuses[details.data.task.status].className}`}
							>
								{statuses[details.data.task.status].label}
							</span>
						</div>
					</header>
					<div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]'>
						<section
							aria-labelledby='task-description-title'
							className='rounded-xl border bg-white p-6 md:p-8'
						>
							<h2 id='task-description-title' className='text-lg font-semibold'>
								Описание задачи
							</h2>
							<p className='mt-4 text-sm leading-7 whitespace-pre-wrap wrap-anywhere'>
								{details.data.task.description || 'Описание не добавлено.'}
							</p>
						</section>
						<section
							aria-labelledby='task-info-title'
							className='rounded-xl border bg-white p-6'
						>
							<h2 id='task-info-title' className='text-lg font-semibold'>
								Информация
							</h2>
							<dl className='mt-5 space-y-5 text-sm'>
								<div>
									<dt className='text-xs text-muted-foreground'>Объект</dt>
									<dd className='mt-1.5 wrap-anywhere'>
										<a
											href={objectHref(details.data.object.id)}
											className='text-primary hover:underline'
										>
											{details.data.object.name}
										</a>
									</dd>
								</div>
								<div>
									<dt className='text-xs text-muted-foreground'>Адрес</dt>
									<dd className='mt-1.5 wrap-anywhere'>
										{details.data.object.address}
									</dd>
								</div>
								<div>
									<dt className='text-xs text-muted-foreground'>Исполнитель</dt>
									<dd className='mt-1.5'>
										{details.data.assignee.full_name || 'Не указан'}
									</dd>
								</div>
								<div>
									<dt className='text-xs text-muted-foreground'>Автор</dt>
									<dd className='mt-1.5'>
										{details.data.author.full_name || 'Не указан'}
									</dd>
								</div>
								<div>
									<dt className='text-xs text-muted-foreground'>
										Дата создания
									</dt>
									<dd className='mt-1.5'>
										<time dateTime={details.data.task.created_at}>
											{formatDateTime(details.data.task.created_at)}
										</time>
									</dd>
								</div>
							</dl>
						</section>
					</div>
					<TaskStatusActions
						userId={props.profile.id}
						taskId={taskId}
						actions={details.data.actions}
						refreshing={details.isFetching}
						onChanged={() => setPage(0)}
						onRefresh={() => {
							void details.refetch();
							void history.refetch();
						}}
					/>
					<section aria-labelledby='task-history-title' className='mt-8'>
						<h2 id='task-history-title' className='mb-5 text-xl font-semibold'>
							История статусов
						</h2>
						{history.isPending ? (
							<ListLoading />
						) : history.error ? (
							<ListError
								error={history.error}
								retry={() => void history.refetch()}
							/>
						) : history.data.items.length === 0 ? (
							<EmptyList filtered={false} subject='История пока пуста' />
						) : (
							<ol className='space-y-3' aria-label='История статусов'>
								{history.data.items.map((event) => (
									<li
										key={event.id}
										className='rounded-xl border bg-white p-5 md:p-6'
									>
										<div className='flex flex-wrap items-center gap-2 text-xs'>
											<span className='text-muted-foreground'>
												{event.from_status
													? statuses[event.from_status].label
													: 'Создание задачи'}
											</span>
											<ArrowRight
												className='size-3.5 text-muted-foreground'
												aria-label='переход в статус'
											/>
											<span
												className={`rounded-full px-2.5 py-1 font-medium ${statuses[event.to_status].className}`}
											>
												{statuses[event.to_status].label}
											</span>
										</div>
										<p className='mt-3 text-xs leading-5 text-muted-foreground'>
											{event.changed_by_name || 'Пользователь'} ·{' '}
											<time dateTime={event.changed_at}>
												{formatDateTime(event.changed_at)}
											</time>
										</p>
										{event.comment && (
											<p className='mt-4 border-l-2 border-primary/30 pl-4 text-sm leading-6 whitespace-pre-wrap wrap-anywhere'>
												{event.comment}
											</p>
										)}
									</li>
								))}
							</ol>
						)}
						{history.data && !history.error && (
							<Pagination
								page={page}
								total={history.data.total}
								setPage={setPage}
								busy={history.isFetching}
							/>
						)}
					</section>
				</>
			)}
		</Workspace>
	);
}

import { Building2, CalendarDays, UserRound } from 'lucide-react';
import { objectHref, taskHref } from '@/hooks/useRoute';
import { formatDate, statuses, Task } from '@/lib/crm';

const Task = ({ task }: { task: Task }) => (
	<>
		<div className='mb-4 flex items-start justify-between gap-3'>
			<span className='flex min-w-0 items-center gap-2 text-xs text-muted-foreground'>
				<Building2 className='size-4 shrink-0' aria-hidden='true' />
				<span className='truncate'>
					<a
						href={objectHref(task.object_id)}
						className='relative z-10 hover:text-primary hover:underline'
					>
						{task.object_name}
					</a>
				</span>
			</span>
			<span
				className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${statuses[task.status].className}`}
			>
				{statuses[task.status].label}
			</span>
		</div>
		<h2 className='text-base leading-6 font-semibold wrap-anywhere'>
			<a
				href={taskHref(task.id)}
				className='rounded-sm after:absolute after:inset-0 after:rounded-xl hover:text-primary hover:underline focus-visible:outline-none'
			>
				{task.title}
			</a>
		</h2>
		<p className='mt-2 line-clamp-3 text-sm leading-6 whitespace-pre-line text-muted-foreground wrap-anywhere'>
			{task.description || 'Описание не добавлено.'}
		</p>
		<div className='mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs text-muted-foreground'>
			<span className='mt-4 flex items-center gap-2'>
				<UserRound className='size-3.5' aria-hidden='true' />
				Автор: {task.author_name || 'Не указан'}
			</span>
			<span className='mt-4 flex items-center gap-2'>
				<CalendarDays className='size-3.5' aria-hidden='true' />
				<time dateTime={task.created_at}>
					{formatDate(task.created_at)}
				</time>
			</span>
		</div>
	</>
);

export default Task;

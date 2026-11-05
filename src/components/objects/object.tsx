import { Building2, MapPin } from 'lucide-react';
import { objectHref } from '@/hooks/useRoute';
import { cn } from '@/lib/utils';
import { Building } from '@/lib/crm';

export default function Object({ object }: { object: Building }) {
	const counts = object.task_counts;
	const progress = counts.total
		? Math.round((counts.accepted / counts.total) * 100)
		: 0;
	return (
		<li
			key={object.id}
			className={cn(
				'flex flex-col rounded-xl border bg-white p-6 relative transition-colors hover:border-primary/40 focus-within:ring-2 focus-within:ring-ring'
			)}
		>
			<span className='mb-5 grid size-11 place-items-center rounded-xl bg-accent text-primary'>
				<Building2 className='size-6' aria-hidden='true' />
			</span>
			<h2 className='text-lg leading-7 font-semibold wrap-anywhere'>
				<a
					href={objectHref(object.id)}
					className={cn(
						'rounded-sm hover:text-primary hover:underline after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none'
					)}
				>
					{object.name}
				</a>
			</h2>
			<p className='mt-2 mb-6 flex items-start gap-2 text-xs leading-5 text-muted-foreground'>
				<MapPin
					className='mt-0.5 size-3.5 shrink-0'
					aria-hidden='true'
				/>
				<span className='wrap-anywhere'>{object.address}</span>
			</p>
			<div className='mt-auto'>
				<div className='mb-2 flex justify-between gap-3 text-xs'>
					<span className='text-muted-foreground'>
						Принято задач: {counts.accepted} из {counts.total}
					</span>
					<span className='font-medium text-primary'>
						{progress}%
					</span>
				</div>
				<div
					role='progressbar'
					aria-label={`Принятые задачи: ${object.name}`}
					aria-valuenow={progress}
					aria-valuemin={0}
					aria-valuemax={100}
					className='h-1.5 overflow-hidden rounded-full bg-muted'
				>
					<div
						className='h-full rounded-full bg-primary'
						style={{ width: `${progress}%` }}
					/>
				</div>
				<dl className='mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 text-xs'>
					<div>
						<dt className='text-muted-foreground'>Новые</dt>
						<dd className='mt-1 font-medium'>{counts.new}</dd>
					</div>
					<div>
						<dt className='text-muted-foreground'>В работе</dt>
						<dd className='mt-1 font-medium'>
							{counts.in_progress}
						</dd>
					</div>
					<div>
						<dt className='text-muted-foreground'>На проверке</dt>
						<dd className='mt-1 font-medium'>{counts.in_review}</dd>
					</div>
					<div>
						<dt className='text-muted-foreground'>На доработке</dt>
						<dd className='mt-1 font-medium'>{counts.rework}</dd>
					</div>
				</dl>
			</div>
		</li>
	);
}

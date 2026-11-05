import { statuses, type TaskStatus } from '@/lib/crm';
import { SearchForm } from '../workspace/listControls';
import { TaskFilters } from '@/api/types';
import { Dispatch, SetStateAction } from 'react';

type TaskFiltersPanelProps = {
	filters: TaskFilters;
	setFilters: Dispatch<SetStateAction<TaskFilters>>;
};

const TaskFiltersPanel = ({ filters, setFilters }: TaskFiltersPanelProps) => (
	<div className='mb-6 flex flex-wrap items-center gap-3'>
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
		<label className='sr-only' htmlFor='task-status'>
			Статус задачи
		</label>
		<select
			id='task-status'
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
			{Object.entries(statuses).map(([value, status]) => (
				<option key={value} value={value}>
					{status.label}
				</option>
			))}
		</select>
	</div>
);

export default TaskFiltersPanel;

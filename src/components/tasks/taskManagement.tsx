import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/login/button';
import { DeleteConfirmation } from '@/components/workspace/deleteConfirmation';
import { TaskEditor } from './taskEditor';
import { deleteTask } from '@/api/tasks';
import { objectHref } from '@/hooks/useRoute';
import type { TaskDetails } from '@/lib/crm';

type CreateProps = {
	userId: string;
	objectId: string;
	objectName: string;
	disabled: boolean;
};

export function CreateTaskButton({
	userId,
	objectId,
	objectName,
	disabled
}: CreateProps) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button disabled={disabled} onClick={() => setOpen(true)}>
				<Plus aria-hidden='true' />
				Новая задача
			</Button>
			{open && (
				<TaskEditor
					userId={userId}
					objectId={objectId}
					objectName={objectName}
					onClose={() => setOpen(false)}
				/>
			)}
		</>
	);
}

export function TaskManagement({
	userId,
	details,
	refreshing
}: {
	userId: string;
	details: TaskDetails;
	refreshing: boolean;
}) {
	const [mode, setMode] = useState<'edit' | 'delete' | null>(null);
	return (
		<div className='mt-5 flex flex-wrap gap-3'>
			{details.actions.can_edit && (
				<Button
					variant='outline'
					disabled={refreshing}
					onClick={() => setMode('edit')}
				>
					<Pencil aria-hidden='true' />
					Редактировать задачу
				</Button>
			)}
			{details.actions.can_delete && (
				<Button
					variant='outline'
					disabled={refreshing}
					className='text-destructive'
					onClick={() => setMode('delete')}
				>
					<Trash2 aria-hidden='true' />
					Удалить задачу
				</Button>
			)}
			{mode === 'edit' && details.actions.can_edit && (
				<TaskEditor
					userId={userId}
					initial={details}
					objectId={details.object.id}
					objectName={details.object.name}
					onClose={() => setMode(null)}
				/>
			)}
			{mode === 'delete' && details.actions.can_delete && (
				<DeleteConfirmation
					userId={userId}
					title='Удалить задачу?'
					description={`Задача «${details.task.title}» исчезнет из списков и станет недоступна исполнителю. История изменений сохранится в системе.`}
					onDelete={() => deleteTask(details.task.id)}
					onClose={() => setMode(null)}
					onDeleted={() => {
						setMode(null);
						window.location.hash = objectHref(details.object.id);
					}}
				/>
			)}
		</div>
	);
}

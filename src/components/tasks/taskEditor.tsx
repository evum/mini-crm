import { useState, type FormEvent } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/login/input';
import { Label } from '@/components/login/label';
import { Button } from '@/components/login/button';
import { EntityPicker } from '@/components/workspace/entityPicker';
import { MutationError } from '@/components/workspace/mutationError';
import { createTask, updateTask, type TaskInput } from '@/api/tasks';
import { useCrmMutation } from '@/hooks/useCrmMutation';
import { taskHref } from '@/hooks/useRoute';
import type { TaskDetails } from '@/lib/crm';

type Props = {
	userId: string;
	initial?: TaskDetails;
	objectId: string;
	objectName: string;
	onClose: () => void;
};

export function TaskEditor({
	userId,
	initial,
	objectId,
	objectName,
	onClose
}: Props) {
	const [fields, setFields] = useState<TaskInput>({
		title: initial?.task.title || '',
		description: initial?.task.description || '',
		objectId: initial?.task.object_id || objectId,
		assigneeId: initial?.task.assignee_id || ''
	});
	const [labels, setLabels] = useState({
		object: initial?.object.name || objectName,
		assignee: initial?.assignee.full_name || ''
	});
	const [validation, setValidation] = useState('');
	const mutation = useCrmMutation(
		userId,
		(input: TaskInput) =>
			initial
				? updateTask({ ...input, id: initial.task.id })
				: createTask(input),
		(task) => {
			onClose();
			window.location.hash = taskHref(task.id);
		}
	);
	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending) return;
		if (!fields.title.trim() || !fields.objectId || !fields.assigneeId) {
			setValidation('Укажите название задачи, объект и исполнителя.');
			return;
		}
		setValidation('');
		mutation.mutate(fields);
	}
	return (
		<Dialog
			open
			onOpenChange={(open) => {
				if (!open && !mutation.isPending) onClose();
			}}
		>
			<DialogContent
				className='max-h-[90svh] overflow-y-auto sm:max-w-xl'
				showCloseButton={!mutation.isPending}
				onEscapeKeyDown={(event) => {
					const focused = document.activeElement;
					if (
						focused?.getAttribute('role') === 'combobox' &&
						focused.getAttribute('aria-expanded') === 'true'
					) {
						event.preventDefault();
					}
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{initial ? 'Редактировать задачу' : 'Новая задача'}
					</DialogTitle>
					<DialogDescription>
						{initial
							? 'Измените данные или назначьте другого исполнителя. Статус задачи сохранится.'
							: 'Заполните данные и назначьте исполнителя. Задача будет создана в статусе «Новая».'}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={submit}
					className='space-y-5'
					aria-busy={mutation.isPending}
				>
					<div className='space-y-2'>
						<Label htmlFor='task-title'>Название</Label>
						<Input
							id='task-title'
							required
							autoFocus
							value={fields.title}
							disabled={mutation.isPending}
							onChange={(event) =>
								setFields((current) => ({
									...current,
									title: event.target.value
								}))
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='task-description'>Описание</Label>
						<Textarea
							id='task-description'
							rows={4}
							value={fields.description}
							disabled={mutation.isPending}
							onChange={(event) =>
								setFields((current) => ({
									...current,
									description: event.target.value
								}))
							}
						/>
					</div>
					<EntityPicker
						userId={userId}
						kind='objects'
						value={fields.objectId}
						selectedLabel={labels.object}
						disabled={mutation.isPending}
						onChange={(id, label) => {
							setFields((current) => ({ ...current, objectId: id }));
							setLabels((current) => ({ ...current, object: label }));
						}}
					/>
					<EntityPicker
						userId={userId}
						kind='executors'
						value={fields.assigneeId}
						selectedLabel={labels.assignee}
						disabled={mutation.isPending}
						onChange={(id, label) => {
							setFields((current) => ({ ...current, assigneeId: id }));
							setLabels((current) => ({ ...current, assignee: label }));
						}}
					/>
					{validation && (
						<p role='alert' className='text-sm text-destructive'>
							{validation}
						</p>
					)}
					<MutationError error={mutation.error} />
					<DialogFooter>
						<Button
							type='button'
							variant='outline'
							disabled={mutation.isPending}
							onClick={onClose}
						>
							Отмена
						</Button>
						<Button type='submit' disabled={mutation.isPending}>
							{mutation.isPending
								? 'Сохраняем…'
								: initial
									? 'Сохранить'
									: 'Создать задачу'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

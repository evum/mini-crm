import { useState, type FormEvent } from 'react';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/login/input';
import { Label } from '@/components/login/label';
import { Button } from '@/components/login/button';
import { MutationError } from '@/components/workspace/mutationError';
import { createObject, updateObject, type ObjectInput } from '@/api/objects';
import { useCrmMutation } from '@/hooks/useCrmMutation';
import { objectHref } from '@/hooks/useRoute';
import type { Tables } from '@/lib/database.types';

type Props = {
	userId: string;
	initial?: Tables<'objects'>;
	onClose: () => void;
};

export function ObjectEditor({ userId, initial, onClose }: Props) {
	const [fields, setFields] = useState<ObjectInput>({
		name: initial?.name || '',
		address: initial?.address || ''
	});
	const [validation, setValidation] = useState('');
	const mutation = useCrmMutation(
		userId,
		(input: ObjectInput) =>
			initial
				? updateObject({ ...input, id: initial.id })
				: createObject(input),
		(object) => {
			onClose();
			window.location.hash = objectHref(object.id);
		}
	);
	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending) return;
		if (!fields.name.trim() || !fields.address.trim()) {
			setValidation(
				'Название и адрес не могут быть пустыми или состоять из пробелов.'
			);
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
				className='max-h-[90svh] overflow-y-auto'
				showCloseButton={!mutation.isPending}
			>
				<DialogHeader>
					<DialogTitle>
						{initial ? 'Редактировать объект' : 'Новый объект'}
					</DialogTitle>
					<DialogDescription>
						Укажите название стройки и адрес.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={submit}
					className='space-y-5'
					aria-busy={mutation.isPending}
				>
					<div className='space-y-2'>
						<Label htmlFor='object-name'>Название</Label>
						<Input
							id='object-name'
							required
							autoFocus
							value={fields.name}
							disabled={mutation.isPending}
							onChange={(event) =>
								setFields((current) => ({
									...current,
									name: event.target.value
								}))
							}
						/>
					</div>
					<div className='space-y-2'>
						<Label htmlFor='object-address'>Адрес</Label>
						<Input
							id='object-address'
							required
							value={fields.address}
							disabled={mutation.isPending}
							onChange={(event) =>
								setFields((current) => ({
									...current,
									address: event.target.value
								}))
							}
						/>
					</div>
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
									: 'Создать объект'}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

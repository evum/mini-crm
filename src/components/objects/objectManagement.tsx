import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/login/button';
import { DeleteConfirmation } from '@/components/workspace/deleteConfirmation';
import { ObjectEditor } from './objectEditor';
import { deleteObject } from '@/api/objects';
import type { ObjectDetails } from '@/lib/crm';

export function CreateObjectButton({ userId }: { userId: string }) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Button onClick={() => setOpen(true)}>
				<Plus aria-hidden='true' />
				Новый объект
			</Button>
			{open && <ObjectEditor userId={userId} onClose={() => setOpen(false)} />}
		</>
	);
}

export function ObjectManagement({
	userId,
	details,
	refreshing
}: {
	userId: string;
	details: ObjectDetails;
	refreshing: boolean;
}) {
	const [mode, setMode] = useState<'edit' | 'delete' | null>(null);
	return (
		<div className='mt-6 flex flex-wrap gap-3'>
			{details.permissions.can_edit && (
				<Button
					variant='outline'
					disabled={refreshing}
					onClick={() => setMode('edit')}
				>
					<Pencil aria-hidden='true' />
					Редактировать объект
				</Button>
			)}
			{details.permissions.can_delete && (
				<Button
					variant='outline'
					disabled={refreshing}
					className='text-destructive'
					onClick={() => setMode('delete')}
				>
					<Trash2 aria-hidden='true' />
					Удалить объект
				</Button>
			)}
			{mode === 'edit' && details.permissions.can_edit && (
				<ObjectEditor
					userId={userId}
					initial={details.object}
					onClose={() => setMode(null)}
				/>
			)}
			{mode === 'delete' && details.permissions.can_delete && (
				<DeleteConfirmation
					userId={userId}
					title='Удалить объект?'
					description={`Объект «${details.object.name}» и все его задачи исчезнут из приложения. История задач сохранится в системе.`}
					onDelete={() => deleteObject(details.object.id)}
					onClose={() => setMode(null)}
					onDeleted={() => {
						setMode(null);
						window.location.hash = '#/objects';
					}}
				/>
			)}
		</div>
	);
}

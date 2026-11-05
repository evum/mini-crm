import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/login/button';
import { MutationError } from './mutationError';
import { useCrmMutation } from '@/hooks/useCrmMutation';

type Props = {
	userId: string;
	title: string;
	description: string;
	onDelete: () => Promise<void>;
	onDeleted: () => void;
	onClose: () => void;
};

export function DeleteConfirmation({
	userId,
	title,
	description,
	onDelete,
	onDeleted,
	onClose
}: Props) {
	const mutation = useCrmMutation(userId, onDelete, onDeleted);
	return (
		<AlertDialog
			open
			onOpenChange={(open) => {
				if (!open && !mutation.isPending) onClose();
			}}
		>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription className='wrap-anywhere'>
						{description}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<MutationError error={mutation.error} />
				<AlertDialogFooter>
					<AlertDialogCancel disabled={mutation.isPending}>
						Отмена
					</AlertDialogCancel>
					<Button
						type='button'
						variant='destructive'
						disabled={mutation.isPending}
						onClick={() => mutation.mutate(undefined)}
					>
						{mutation.isPending ? 'Удаляем…' : 'Удалить'}
					</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

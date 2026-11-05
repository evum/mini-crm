import { useRef, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Button } from '@/components/login/button';
import { Label } from '@/components/login/label';
import { Alert, AlertDescription } from '@/components/login/alert';
import { useChangeTaskStatus } from '@/hooks/useChangeTaskStatus';
import { statuses, type TaskDetails } from '@/lib/crm';

const actionLabels: Record<string, string> = {
	start: 'Взять в работу',
	submit: 'Отправить на проверку',
	accept: 'Принять задачу',
	return: 'Вернуть на доработку'
};

function errorMessage(error: Error) {
	const code = 'code' in error ? error.code : undefined;
	if (code === '40001')
		return 'Задача уже изменена другим пользователем. Данные обновлены — проверьте статус и повторите действие.';
	if (code === '42501')
		return 'Нет прав на это действие. Возможно, задачу переназначили или ваши права изменились.';
	if (code === '23514')
		return 'Переход недоступен или не заполнен обязательный комментарий. Проверьте данные.';
	return 'Не удалось изменить статус. Проверьте соединение. Если запрос мог выполниться, обновите карточку перед повторной попыткой.';
}

type Props = {
	userId: string;
	taskId: string;
	actions: TaskDetails['actions'];
	refreshing: boolean;
	onChanged: () => void;
	onRefresh: () => void;
};

export function TaskStatusActions({
	userId,
	taskId,
	actions,
	refreshing,
	onChanged,
	onRefresh
}: Props) {
	const mutation = useChangeTaskStatus(userId);
	const [comment, setComment] = useState('');
	const [validationError, setValidationError] = useState('');
	const [notice, setNotice] = useState('');
	const commentRef = useRef<HTMLTextAreaElement>(null);
	const busy = mutation.isPending || refreshing;
	const commentRequired = actions.transitions.some(
		(transition) => transition.comment_required
	);

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (busy) return;
		const submitter = (event.nativeEvent as SubmitEvent).submitter;
		const action =
			submitter instanceof HTMLButtonElement
				? submitter.value
				: actions.transitions[0]?.action;
		const transition = actions.transitions.find(
			(item) => item.action === action
		);
		if (!transition) return;
		setNotice('');
		mutation.reset();
		if (transition.comment_required && !comment.trim()) {
			setValidationError(
				'Укажите причину возврата на доработку. Комментарий не может состоять только из пробелов.'
			);
			commentRef.current?.focus();
			return;
		}
		setValidationError('');
		mutation.mutate(
			{
				taskId,
				expectedStatus: actions.expected_status,
				newStatus: transition.target_status,
				comment
			},
			{
				onSuccess: () => {
					setComment('');
					setNotice(
						`Статус изменён: ${statuses[transition.target_status].label}.`
					);
					onChanged();
				}
			}
		);
	}

	return (
		<section
			aria-labelledby='task-actions-title'
			className='mt-6 rounded-xl border bg-white p-6 md:p-8'
		>
			<h2 id='task-actions-title' className='text-lg font-semibold'>
				Действия с задачей
			</h2>
			{notice && (
				<p role='status' className='mt-4 text-sm text-primary'>
					{notice}
				</p>
			)}
			{actions.transitions.length === 0 ? (
				<p className='mt-4 text-sm text-muted-foreground'>
					Для текущего статуса нет доступных переходов.
				</p>
			) : (
				<form
					onSubmit={submit}
					noValidate
					className='mt-5'
					aria-busy={mutation.isPending}
				>
					<Label htmlFor='status-comment'>
						Комментарий
						{commentRequired
							? ' — обязателен при возврате на доработку'
							: ' (необязательно)'}
					</Label>
					<textarea
						ref={commentRef}
						id='status-comment'
						value={comment}
						onChange={(event) => {
							setComment(event.target.value);
							setValidationError('');
						}}
						disabled={busy}
						rows={3}
						placeholder={
							commentRequired
								? 'Опишите, что нужно исправить'
								: 'Добавьте пояснение к смене статуса'
						}
						aria-invalid={Boolean(validationError)}
						aria-describedby={
							validationError ? 'status-comment-error' : undefined
						}
						className='mt-3 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm leading-6 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50'
					/>
					{validationError && (
						<p
							id='status-comment-error'
							role='alert'
							className='mt-2 text-sm text-destructive'
						>
							{validationError}
						</p>
					)}
					<div className='mt-4 flex flex-wrap gap-3'>
						{actions.transitions.map((transition) => (
							<Button
								key={transition.action}
								type='submit'
								name='action'
								value={transition.action}
								variant={transition.action === 'return' ? 'outline' : 'default'}
								disabled={busy}
							>
								{mutation.isPending &&
									mutation.variables?.newStatus ===
										transition.target_status && (
										<LoaderCircle
											className='animate-spin motion-reduce:animate-none'
											aria-hidden='true'
										/>
									)}
								{actionLabels[transition.action] ||
									statuses[transition.target_status].label}
							</Button>
						))}
					</div>
				</form>
			)}
			{mutation.error && (
				<Alert variant='destructive' className='mt-4'>
					<AlertDescription>
						<p>{errorMessage(mutation.error)}</p>
						<Button
							type='button'
							variant='outline'
							size='sm'
							disabled={busy}
							className='mt-3'
							onClick={onRefresh}
						>
							Обновить карточку
						</Button>
					</AlertDescription>
				</Alert>
			)}
		</section>
	);
}

import { Alert, AlertDescription } from '@/components/login/alert';

export function MutationError({ error }: { error: Error | null }) {
	if (!error) return null;
	const code = 'code' in error ? error.code : undefined;
	const message =
		code === '42501'
			? 'Нет доступа к действию. Объект или задача могли быть удалены либо ваши права изменились.'
			: code === '40001'
				? 'Данные изменились. Закройте форму, обновите карточку и повторите действие.'
				: code === '23514' || code === '23503' || code === '22P02'
					? 'Проверьте поля формы: объект должен существовать, а исполнитель — быть активным.'
					: 'Не удалось сохранить изменения. Проверьте соединение. Перед повторной отправкой убедитесь, что изменения не были сохранены.';
	return (
		<Alert variant='destructive' className='mt-4'>
			<AlertDescription>{message}</AlertDescription>
		</Alert>
	);
}

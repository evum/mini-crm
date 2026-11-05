import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/login/button';
import { Alert, AlertDescription } from '@/components/login/alert';
import type { useAuth } from '@/hooks/useAuth';
import { isAccessError } from '@/lib/crm';

type Props = Pick<ReturnType<typeof useAuth>, 'signOut'> & {
	error: unknown;
	retry: () => void;
	busy: boolean;
};

export function ProfileError({ error, retry, busy, signOut }: Props) {
	return (
		<main className='grid min-h-svh place-items-center px-6'>
			<section className='w-full max-w-md rounded-xl border bg-white p-8'>
				<ShieldAlert
					className='mb-5 size-8 text-primary'
					aria-hidden='true'
				/>
				<h1 className='text-2xl font-semibold'>
					{isAccessError(error)
						? 'Доступ не предоставлен'
						: 'Не удалось загрузить профиль'}
				</h1>
				<p className='mt-3 text-sm leading-6 text-muted-foreground'>
					{isAccessError(error)
						? 'Для работы нужен активный профиль. Обратитесь к администратору.'
						: 'Проверьте подключение к интернету и попробуйте ещё раз.'}
				</p>
				{signOut.error && (
					<Alert variant='destructive' className='mt-4'>
						<AlertDescription>
							Не удалось выйти. Повторите попытку.
						</AlertDescription>
					</Alert>
				)}
				<div className='mt-6 flex gap-3'>
					<Button onClick={retry} disabled={busy}>
						Повторить
					</Button>
					<Button
						variant='outline'
						onClick={() => signOut.mutate()}
						disabled={signOut.isPending}
					>
						Выйти
					</Button>
				</div>
			</section>
		</main>
	);
}

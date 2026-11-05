import type { ReactNode } from 'react';
import { Building2, ClipboardList, LogOut } from 'lucide-react';
import { Button } from '@/components/login/button';
import { Alert, AlertDescription } from '@/components/login/alert';
import type { useAuth } from '@/hooks/useAuth';
import type { Profile } from '@/lib/crm';

export type WorkspaceProps = Pick<ReturnType<typeof useAuth>, 'signOut'> & {
	profile: Profile;
};

export function Workspace({
	profile,
	signOut,
	section,
	children
}: WorkspaceProps & {
	children: ReactNode;
	section?: 'tasks' | 'objects';
}) {
	const executor = profile.role === 'executor';
	const activeSection = section ?? (executor ? 'tasks' : 'objects');

	return (
		<div className='min-h-svh bg-[#f5f7f3]'>
			<header className='border-b bg-background'>
				<div className='mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 lg:px-10'>
					<a
						href='#/'
						className='flex items-center gap-3 rounded-sm font-semibold tracking-tight text-primary focus-visible:outline-2 focus-visible:outline-ring'
					>
						<span className='grid size-9 place-items-center rounded-lg bg-primary text-white'>
							<Building2 className='size-5' aria-hidden='true' />
						</span>
						<span className='text-xl'>
							mini<span className='font-normal'>CRM</span>
						</span>
					</a>
					<div className='flex items-center gap-4'>
						<div className='text-right'>
							<p className='text-sm font-medium'>{profile.full_name}</p>
							<p className='mt-1 text-xs text-muted-foreground'>
								{executor ? 'Исполнитель' : 'Постановщик'}
							</p>
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={() => signOut.mutate()}
							disabled={signOut.isPending}
						>
							<LogOut aria-hidden='true' />
							{signOut.isPending ? 'Выходим…' : 'Выйти'}
						</Button>
					</div>
				</div>
			</header>
			<main className='mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-12'>
				<nav
					aria-label='Разделы приложения'
					className='mb-8 flex flex-wrap gap-2'
				>
					{executor && (
						<Button
							asChild
							variant={activeSection === 'tasks' ? 'default' : 'ghost'}
						>
							<a
								href='#/'
								aria-current={activeSection === 'tasks' ? 'page' : undefined}
							>
								<ClipboardList aria-hidden='true' />
								Мои задачи
							</a>
						</Button>
					)}
					<Button
						asChild
						variant={activeSection === 'objects' ? 'default' : 'ghost'}
					>
						<a
							href='#/objects'
							aria-current={activeSection === 'objects' ? 'page' : undefined}
						>
							<Building2 aria-hidden='true' />
							{executor ? 'Мои объекты' : 'Объекты'}
						</a>
					</Button>
				</nav>
				{signOut.error && (
					<Alert variant='destructive' className='mb-6'>
						<AlertDescription>
							Не удалось выйти. Проверьте соединение и попробуйте ещё раз.
						</AlertDescription>
					</Alert>
				)}
				{children}
			</main>
		</div>
	);
}

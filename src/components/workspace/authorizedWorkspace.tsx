import { useRoute } from '@/hooks/useRoute';
import { Objects } from '@/components/objects/objectsList';
import { ObjectDetailsScreen } from '@/components/objects/objectDetails';
import { MyTasks } from '@/components/tasks/tasksList';
import { TaskDetailsScreen } from '@/components/tasks/taskDetails';
import { Workspace, type WorkspaceProps } from './workspace';

export function AuthorizedWorkspace(props: WorkspaceProps) {
	const route = useRoute();

	if (route.screen === 'objects') {
		return <Objects {...props} />;
	}

	if (route.screen === 'object') {
		return (
			<ObjectDetailsScreen
				key={route.id}
				{...props}
				objectId={route.id}
			/>
		);
	}
	if (route.screen === 'task') {
		return (
			<TaskDetailsScreen key={route.id} {...props} taskId={route.id} />
		);
	}
	if (route.screen === 'not-found') {
		return (
			<Workspace {...props}>
				<h1 className='text-3xl font-semibold'>Страница не найдена</h1>
				<a
					href='#/'
					className='mt-6 inline-block text-primary underline'
				>
					Вернуться к списку
				</a>
			</Workspace>
		);
	}

	return props.profile.role === 'executor' ? (
		<MyTasks {...props} />
	) : (
		<Objects {...props} />
	);
}

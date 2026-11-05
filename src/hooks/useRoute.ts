import { useEffect, useSyncExternalStore } from 'react';

type Route =
	| { screen: 'home' }
	| { screen: 'objects' }
	| { screen: 'object'; id: string }
	| { screen: 'task'; id: string }
	| { screen: 'not-found' };

function subscribe(callback: () => void) {
	window.addEventListener('hashchange', callback);
	return () => window.removeEventListener('hashchange', callback);
}

function getSnapshot() {
	return window.location.hash;
}

export function useRoute(): Route {
	const hash = useSyncExternalStore(subscribe, getSnapshot, () => '');
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [hash]);
	if (!hash || hash === '#' || hash === '#/') return { screen: 'home' };
	if (hash === '#/objects') return { screen: 'objects' };
	const match =
		/^#\/(objects|tasks)\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
			hash
		);
	if (!match) return { screen: 'not-found' };
	return {
		screen: match[1] === 'objects' ? 'object' : 'task',
		id: match[2]
	};
}

export const objectHref = (id: string) => `#/objects/${id}`;
export const taskHref = (id: string) => `#/tasks/${id}`;

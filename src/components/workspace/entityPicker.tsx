import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Check, ChevronDown } from 'lucide-react';
import { listObjects } from '@/api/objects';
import { listExecutors } from '@/api/profiles';
import { Input } from '@/components/login/input';
import { Label } from '@/components/login/label';
import { Button } from '@/components/login/button';
import { cn } from '@/lib/utils';

type Props = {
	userId: string;
	kind: 'objects' | 'executors';
	value: string;
	selectedLabel: string;
	onChange: (id: string, label: string) => void;
	disabled: boolean;
};

export function EntityPicker({
	userId,
	kind,
	value,
	selectedLabel,
	onChange,
	disabled
}: Props) {
	const id = useId();
	const inputRef = useRef<HTMLInputElement>(null);
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState<string | null>(null);
	const [activeId, setActiveId] = useState<string | null>(null);
	const label = kind === 'objects' ? 'Объект' : 'Исполнитель';
	const options = useInfiniteQuery({
		queryKey: [
			kind === 'objects' ? 'object-options' : 'executor-options',
			userId,
			search?.trim() || ''
		],
		enabled: open && !disabled,
		initialPageParam: 0,
		queryFn: async ({ pageParam, signal }) => {
			const filters = { search: search?.trim() || '', page: pageParam };
			if (kind === 'objects') {
				const page = await listObjects(filters, signal);
				return {
					...page,
					items: page.items.map((item) => ({ id: item.id, label: item.name }))
				};
			}
			const page = await listExecutors(filters, signal);
			return {
				...page,
				items: page.items.map((item) => ({
					id: item.id,
					label: item.full_name
				}))
			};
		},
		getNextPageParam: (last, pages) =>
			last.offset + last.limit < last.total ? pages.length : undefined,
		retry: false
	});
	const items = options.data?.pages.flatMap((page) => page.items) ?? [];
	const activeIndex = items.findIndex((item) => item.id === activeId);
	const expanded = open && !disabled;
	const text = search ?? selectedLabel;
	const invalid = Boolean(text && !value && !expanded);

	useEffect(() => {
		inputRef.current?.setCustomValidity(
			value
				? ''
				: `Выберите ${kind === 'objects' ? 'объект' : 'исполнителя'} из списка.`
		);
	}, [value, kind]);

	useEffect(() => {
		if (expanded && activeIndex >= 0) {
			document
				.getElementById(`${id}-option-${activeId}`)
				?.scrollIntoView({ block: 'nearest' });
		}
	}, [activeId, activeIndex, expanded, id]);

	function choose(item: { id: string; label: string }) {
		onChange(item.id, item.label);
		setSearch(null);
		setOpen(false);
		setActiveId(null);
	}

	function keyDown(event: KeyboardEvent<HTMLInputElement>) {
		if (event.nativeEvent.isComposing) return;
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			setOpen(true);
			const index =
				event.key === 'ArrowDown'
					? (activeIndex + 1) % Math.max(1, items.length)
					: activeIndex <= 0
						? items.length - 1
						: activeIndex - 1;
			setActiveId(items[index]?.id ?? null);
		} else if (event.key === 'Enter' && expanded) {
			event.preventDefault();
			const item = items[activeIndex >= 0 ? activeIndex : 0];
			if (item && !options.error) choose(item);
		} else if (event.key === 'Escape' && expanded) {
			event.preventDefault();
			event.stopPropagation();
			setOpen(false);
			setActiveId(null);
		}
	}

	return (
		<div
			className='space-y-2'
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
					setOpen(false);
					setActiveId(null);
				}
			}}
		>
			<Label htmlFor={id}>{label}</Label>
			<div className='relative'>
				<Input
					ref={inputRef}
					id={id}
					role='combobox'
					type='text'
					autoComplete='off'
					required
					value={text}
					disabled={disabled}
					placeholder={
						kind === 'objects'
							? 'Введите название или адрес объекта'
							: 'Введите имя исполнителя'
					}
					aria-expanded={expanded}
					aria-controls={expanded ? `${id}-list` : undefined}
					aria-autocomplete='list'
					aria-activedescendant={
						expanded && activeIndex >= 0
							? `${id}-option-${activeId}`
							: undefined
					}
					aria-invalid={invalid}
					aria-describedby={invalid ? `${id}-hint` : undefined}
					onFocus={() => setOpen(true)}
					onClick={() => setOpen(true)}
					onKeyDown={keyDown}
					onChange={(event) => {
						setSearch(event.target.value);
						setOpen(true);
						setActiveId(null);
						// Editing the label invalidates the previous selection immediately.
						onChange('', '');
					}}
					className='pr-9'
				/>
				<ChevronDown
					className='pointer-events-none absolute top-2.5 right-3 size-4 text-muted-foreground'
					aria-hidden='true'
				/>
			</div>
			{expanded && (
				<div className='overflow-hidden rounded-md border bg-background shadow-sm'>
					<ul
						id={`${id}-list`}
						role='listbox'
						aria-label={label}
						aria-busy={options.isFetching}
						className='max-h-48 overflow-y-auto p-1'
					>
						{!options.error &&
							items.map((item) => (
								<li
									key={item.id}
									id={`${id}-option-${item.id}`}
									role='option'
									aria-selected={item.id === value}
									onMouseDown={(event) => event.preventDefault()}
									onClick={() => choose(item)}
									onPointerMove={() => setActiveId(item.id)}
									className={cn(
										'flex cursor-pointer items-center justify-between gap-3 rounded-sm px-3 py-2 text-sm wrap-anywhere hover:bg-accent',
										item.id === activeId && 'bg-accent'
									)}
								>
									<span>{item.label}</span>
									{item.id === value && (
										<Check className='size-4 shrink-0' aria-hidden='true' />
									)}
								</li>
							))}
					</ul>
					{options.isPending && (
						<p
							role='status'
							className='px-4 py-3 text-xs text-muted-foreground'
						>
							Загружаем варианты…
						</p>
					)}
					{!options.isPending && !options.error && items.length === 0 && (
						<p
							role='status'
							className='px-4 py-3 text-xs text-muted-foreground'
						>
							Подходящих вариантов нет.
						</p>
					)}
					{options.error && (
						<div role='alert' className='px-4 py-3 text-xs text-destructive'>
							Не удалось загрузить варианты.{' '}
							<Button
								type='button'
								variant='link'
								size='sm'
								onClick={() => void options.refetch()}
							>
								Повторить
							</Button>
						</div>
					)}
					{options.hasNextPage && !options.error && (
						<Button
							type='button'
							variant='ghost'
							size='sm'
							className='w-full rounded-none border-t'
							disabled={options.isFetchingNextPage}
							onMouseDown={(event) => event.preventDefault()}
							onClick={() => void options.fetchNextPage()}
						>
							{options.isFetchingNextPage ? 'Загружаем…' : 'Показать ещё'}
						</Button>
					)}
				</div>
			)}
			{invalid && (
				<p id={`${id}-hint`} className='text-xs text-destructive'>
					Выберите подходящий вариант из списка.
				</p>
			)}
		</div>
	);
}

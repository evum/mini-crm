import { useState, type FormEvent } from 'react'
import { ChevronLeft, ChevronRight, LoaderCircle, Search } from 'lucide-react'
import { Input } from '@/components/login/input'
import { Button } from '@/components/login/button'
import { Alert, AlertDescription } from '@/components/login/alert'
import { isAccessError, PAGE_SIZE } from '@/lib/crm'

export function SearchForm({ onSearch, placeholder }: { onSearch: (value: string) => void; placeholder: string }) {
  const [value, setValue] = useState('')
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSearch(value.trim()) }
  return (
    <form onSubmit={submit} role="search" className="flex w-full max-w-xl gap-2">
      <div className="relative min-w-0 flex-1"><Search className="absolute top-3 left-3 size-4 text-muted-foreground" aria-hidden="true" /><Input type="search" aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => { setValue(event.target.value); if (!event.target.value) onSearch('') }} className="h-10 bg-white pl-10" /></div>
      <Button type="submit" className="h-10">Найти</Button>
    </form>
  )
}

export function ListError({ error, retry }: { error: unknown; retry: () => void }) {
  return <Alert variant="destructive" className="my-6"><AlertDescription><p>{isAccessError(error) ? 'Доступ к данным закрыт. Возможно, ваши права изменились. Обратитесь к администратору.' : 'Не удалось загрузить данные. Проверьте соединение и повторите попытку.'}</p><Button variant="outline" size="sm" className="mt-3" onClick={retry}>Повторить</Button></AlertDescription></Alert>
}

export function ListLoading() {
  return <div role="status" className="flex items-center justify-center gap-3 rounded-xl border bg-white px-6 py-20 text-sm text-muted-foreground"><LoaderCircle className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />Загружаем данные…</div>
}

export function EmptyList({ filtered, subject }: { filtered: boolean; subject: string }) {
  return <div role="status" className="rounded-xl border border-dashed bg-white px-6 py-20 text-center"><h2 className="font-medium">{filtered ? 'Ничего не найдено' : subject}</h2><p className="mt-2 text-sm text-muted-foreground">{filtered ? 'Попробуйте другой запрос или измените фильтры.' : 'Когда появятся данные, вы увидите их здесь.'}</p></div>
}

export function Pagination({ page, total, setPage, busy }: { page: number; total: number; setPage: (page: number) => void; busy: boolean }) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  if (pages === 1 && page === 0) return null
  return <nav aria-label="Страницы списка" className="mt-6 flex items-center justify-between gap-4"><p className="text-xs text-muted-foreground">Страница {page + 1} из {pages}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 0 || busy} onClick={() => setPage(page - 1)}><ChevronLeft aria-hidden="true" />Назад</Button><Button variant="outline" size="sm" disabled={(page + 1) * PAGE_SIZE >= total || busy} onClick={() => setPage(page + 1)}>Далее<ChevronRight aria-hidden="true" /></Button></div></nav>
}

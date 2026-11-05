import { LoaderCircle } from 'lucide-react'

export function SessionLoading() {
  return (
    <main className="grid min-h-svh place-items-center px-6">
      <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
        <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Восстанавливаем сессию…
      </div>
    </main>
  )
}

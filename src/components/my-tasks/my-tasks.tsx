import { Alert, AlertDescription } from '@/components/login/alert'
import { Button } from '@/components/login/button'
import type { useAuth } from '@/hooks/use-auth'

type MyTasksProps = Pick<ReturnType<typeof useAuth>, 'signOut'> & {
  email?: string
}

// Placeholder for the future task list; no task data is requested yet.
export function MyTasks({ email, signOut }: MyTasksProps) {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
        <div>
          <p className="text-sm font-semibold text-primary">miniCRM</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Мои задачи</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm text-muted-foreground wrap-anywhere">{email}</span>
          <Button variant="outline" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
            {signOut.isPending ? 'Выходим…' : 'Выйти'}
          </Button>
        </div>
      </header>
      {signOut.error && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>Не удалось выйти. Проверьте соединение и попробуйте ещё раз.</AlertDescription>
        </Alert>
      )}
      <section className="py-12" aria-label="Список задач">
        <p className="text-sm text-muted-foreground">Раздел «Мои задачи» будет реализован позднее.</p>
      </section>
    </main>
  )
}

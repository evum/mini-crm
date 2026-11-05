import { useState, type FormEvent, type ReactNode } from 'react'
import { isAuthError } from '@supabase/supabase-js'
import { ArrowRight, Building2, Eye, EyeOff, LoaderCircle, LockKeyhole } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/login/alert'
import { Button } from '@/components/login/button'
import { Input } from '@/components/login/input'
import { Label } from '@/components/login/label'
import type { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'

function authMessage(error: Error) {
  if (isAuthError(error)) {
    if (error.code === 'invalid_credentials') return 'Неверный email или пароль. Проверьте данные и попробуйте ещё раз.'
    if (error.code === 'email_not_confirmed') return 'Email ещё не подтверждён. Обратитесь к администратору.'
    if (error.status === 429) return 'Слишком много попыток. Подождите немного и попробуйте снова.'
  }
  return 'Не удалось войти. Проверьте подключение к интернету и повторите попытку.'
}

function ErrorNotice({ children }: { children: ReactNode }) {
  return <Alert variant="destructive" className="mt-4 border-destructive/20 bg-destructive/5"><AlertDescription>{children}</AlertDescription></Alert>
}

function Blueprint() {
  return (
    <div className="blueprint" aria-hidden="true">
      <div className="plan-grid" />
      <div className="plan-building top-[42px] left-[13%] h-[105px] w-[48%]"><span /><span /><span /></div>
      <div className="plan-building top-[165px] left-[36%] h-[77px] w-[47%]"><span /><span /></div>
      <div className="plan-building top-[42px] left-[68%] h-[105px] w-[15%]" />
      <div className="absolute top-7 left-[9%] h-[230px] w-4/5 border border-dashed border-[#a9c4ae44]" />
      <span className="absolute top-[25px] left-[14%] text-[8px] tracking-[2px] text-[#b5ceb9]">ОБЪЕКТ / 01</span>
      <span className="absolute top-[250px] left-[38%] text-[8px] tracking-[2px] text-[#b5ceb9]">ПЛАН РАБОТ</span>
      <span className="absolute top-[150px] left-[61%] size-[9px] rounded-full border-2 border-[#c6d9ad] bg-primary ring-5 ring-[#c6d9ad15]" />
    </div>
  )
}

type LoginProps = Pick<ReturnType<typeof useAuth>, 'signIn' | 'sessionError'>

export function Login({ signIn, sessionError }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const busy = signIn.isPending

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!supabase || busy) return
    signIn.mutate({ email, password }, {
      onSuccess: () => {
        setPassword('')
        setShowPassword(false)
        signIn.reset()
      },
    })
  }

  return (
    <main className="grid min-h-svh md:grid-cols-[48%_52%]">
      <aside className="relative flex flex-col overflow-hidden bg-primary px-6 py-7 text-primary-foreground md:min-h-[850px] md:px-9 md:pt-12 md:pb-8 xl:px-14" aria-label="О приложении">
        <a href="/" aria-label="miniCRM — главная" className="relative z-10 flex w-fit items-center gap-3 rounded-sm text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
          <span className="grid size-11 place-items-center rounded-xl border border-white/25"><Building2 className="size-6" aria-hidden="true" /></span>
          <span>mini<span className="font-normal text-white/80">CRM</span></span>
        </a>
        <div className="relative z-10 mt-8 md:mt-24">
          <div className="flex items-center gap-3 text-[9px] font-medium tracking-[2px] text-[#bacdc2] md:text-[10px]"><span className="h-px w-6 bg-[#b5cf97]" />РАБОЧЕЕ ПРОСТРАНСТВО</div>
          <h1 className="mt-5 text-[32px] leading-[1.18] font-medium tracking-[-1px] md:mt-7 md:text-[clamp(36px,3.5vw,58px)] md:tracking-[-2px]">Каждый объект. <br className="hidden md:block" />Каждая задача.<br /><span className="text-[#c6d9ad]">Всё под контролем.</span></h1>
          <p className="mt-6 hidden text-sm leading-[1.85] text-[#b9cec5] md:block">От первой задачи до приёмки работ —<br /> ваша команда в одном пространстве.</p>
        </div>
        <Blueprint />
        <div className="relative z-10 mt-auto hidden items-center gap-2 text-[10px] text-[#b2c9be] md:flex"><span className="size-[5px] rounded-full bg-[#c6d9ad]" />Единый ритм вашей команды<span className="ml-auto hidden text-[9px] tracking-wide text-[#94afa2] xl:block">miniCRM / 01</span></div>
      </aside>

      <section className="flex min-h-[590px] min-w-0 flex-col px-6 pt-8 pb-6 md:px-9 md:pt-12 md:pb-8 xl:px-14" aria-labelledby="login-title">
        <div className="hidden items-center justify-end gap-2 text-[11px] text-muted-foreground md:flex"><span className="size-[5px] rounded-full bg-[#839b77]" />Управление строительными проектами</div>
        <div className="mx-auto my-auto w-full max-w-[420px] pt-5 pb-12 md:max-w-[390px] md:py-[70px]">
          <div className="mb-5 text-[9px] font-medium tracking-[1.6px] text-[#7b8878]">ВАША КОМАНДА. ВАШИ ПРОЕКТЫ.</div>
          <>
              <h2 id="login-title" className="text-3xl leading-tight font-semibold tracking-tight md:text-[34px]">С возвращением</h2>
              <p className="mt-3 mb-9 max-w-[350px] text-[13px] leading-[1.8] text-muted-foreground">Войдите, чтобы продолжить работу с объектами и задачами.</p>
              <form onSubmit={submit} aria-label="Вход в приложение" aria-busy={busy}>
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" name="email" type="email" autoComplete="username" placeholder="name@company.ru" value={email} onChange={event => setEmail(event.target.value)} required maxLength={254} disabled={busy} spellCheck={false} autoCapitalize="none" className="h-[50px] bg-white px-4 text-[13px] md:text-[13px]" />
                </div>
                <div className="mt-6 space-y-2.5">
                  <Label htmlFor="password" className="text-xs">Пароль</Label>
                  <div className="relative">
                    <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Введите пароль" value={password} onChange={event => setPassword(event.target.value)} required disabled={busy} className="h-[50px] bg-white pr-14 pl-4 text-[13px] md:text-[13px]" />
                    <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 size-[42px] text-muted-foreground" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'} aria-pressed={showPassword}>
                      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </Button>
                  </div>
                </div>
                {signIn.error && <ErrorNotice>{authMessage(signIn.error)}</ErrorNotice>}
                {sessionError && !signIn.error && <ErrorNotice>Не удалось восстановить сессию. Попробуйте войти снова.</ErrorNotice>}
                {!supabase && <ErrorNotice>Вход пока недоступен. Обратитесь к администратору для настройки подключения.</ErrorNotice>}
                <Button className="relative mt-7 h-[51px] w-full text-xs" type="submit" disabled={busy || !supabase}>
                  {busy ? <><LoaderCircle className="animate-spin motion-reduce:animate-none" aria-hidden="true" />Входим…</> : <>Войти в пространство<ArrowRight className="absolute right-4" aria-hidden="true" /></>}
                </Button>
              </form>
              <div className="mt-8 flex gap-3 border-t pt-6"><LockKeyhole className="mt-0.5 size-[18px] shrink-0 text-[#849078]" aria-hidden="true" /><p className="text-[10px] leading-[1.9] text-[#717b6a]">Доступ только для участников команды.<br /><span className="text-[#969d8e]">Для получения аккаунта обратитесь к администратору.</span></p></div>
          </>
        </div>
        <footer className="mx-auto flex w-full max-w-[420px] justify-between gap-4 text-[9px] text-[#9b9f94] md:max-w-none"><span>© {new Date().getFullYear()} miniCRM</span><span>От планов — к результату.</span></footer>
      </section>
    </main>
  )
}

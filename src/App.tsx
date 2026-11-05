import { Login } from '@/components/login/login'
import { SessionLoading } from '@/components/login/session-loading'
import { MyTasks } from '@/components/my-tasks/my-tasks'
import { useAuth } from '@/hooks/use-auth'

export default function App() {
  const { session, initializing, sessionError, signIn, signOut } = useAuth()

  if (initializing) return <SessionLoading />

  return session
    ? <MyTasks email={session.user.email} signOut={signOut} />
    : <Login signIn={signIn} sessionError={sessionError} />
}

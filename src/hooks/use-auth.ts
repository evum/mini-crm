import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const sessionKey = ['auth', 'session'] as const

export function useAuth() {
  const queryClient = useQueryClient()
  const sessionQuery = useQuery({
    queryKey: sessionKey,
    queryFn: async () => {
      if (!supabase) return null
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      return data.session
    },
    enabled: Boolean(supabase),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  })

  useEffect(() => {
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // A stale in-flight session read must not overwrite an auth event.
      void queryClient.cancelQueries({ queryKey: sessionKey })
      const previous = queryClient.getQueryData<Session | null>(sessionKey)
      if (event === 'SIGNED_OUT' || previous?.user.id !== session?.user.id) {
        queryClient.removeQueries({ predicate: query => query.queryKey[0] !== 'auth' })
      }
      queryClient.setQueryData(sessionKey, session)
    })
    return () => subscription.unsubscribe()
  }, [queryClient])

  const signIn = useMutation({
    gcTime: 0,
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      if (!supabase) throw new Error('Supabase is not configured')
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (error) throw error
      return data.session
    },
    onSuccess: session => queryClient.setQueryData(sessionKey, session),
  })

  const signOut = useMutation({
    mutationFn: async () => {
      if (!supabase) return
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.removeQueries({ predicate: query => query.queryKey[0] !== 'auth' })
      queryClient.setQueryData(sessionKey, null)
      signIn.reset()
    },
  })

  return {
    session: sessionQuery.data,
    initializing: sessionQuery.isLoading,
    sessionError: sessionQuery.error,
    signIn,
    signOut,
  }
}

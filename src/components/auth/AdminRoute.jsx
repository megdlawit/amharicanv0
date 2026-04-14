import { useState, useEffect } from 'react'
import { Navigate, Outlet }    from 'react-router-dom'
import { useAuthStore }        from '@/store/useAuthStore'
import { supabase }            from '@/lib/supabase'

export default function AdminRoute() {
  const { user, profile, loading } = useAuthStore()

  // Second-source role check — queries DB directly
  // Guards against the fallback profile having role='user' due to a 500 error
  const [dbRole,      setDbRole]      = useState(null)   // null = not checked yet
  const [roleChecked, setRoleChecked] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    const check = async () => {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      setDbRole(data?.role ?? 'user')
      setRoleChecked(true)
    }
    check()
  }, [user?.id])

  // Still loading auth session
  if (loading) return <Spinner />

  // Not logged in at all
  if (!user) return <Navigate to="/login" replace />

  // Waiting for direct DB role check
  if (!roleChecked) return <Spinner />

  // Neither source says admin → redirect
  const isAdmin = dbRole === 'admin' || profile?.role === 'admin'
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <Outlet />
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-400 font-medium">Checking access…</p>
      </div>
    </div>
  )
}

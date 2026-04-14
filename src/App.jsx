import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

import Landing      from '@/pages/Landing'
import Login        from '@/pages/Login'
import Signup       from '@/pages/Signup'
import Onboarding   from '@/pages/Onboarding'
import Dashboard    from '@/pages/Dashboard'
import LessonPage   from '@/pages/LessonPage'
import Profile      from '@/pages/Profile'
import Admin        from '@/pages/Admin'
import NotFound     from '@/pages/NotFound'
import Feature        from '@/pages/Feature'

import CourseCatalog from '@/pages/lms/CourseCatalog'
import CourseDetail  from '@/pages/lms/CourseDetail'
import Leaderboard   from '@/pages/lms/Leaderboard'
import Achievements  from '@/pages/lms/Achievements'
import Vocabulary    from '@/pages/lms/Vocabulary'
import Practice      from '@/pages/lms/Practice'
import Conversation  from '@/pages/lms/Conversation'
import Community     from '@/pages/lms/Community'
import VideoLessons  from '@/pages/lms/VideoLessons'

import ProtectedRoute from '@/components/auth/ProtectedRoute'
import AdminRoute     from '@/components/auth/AdminRoute'

export default function App() {
  const { init, loading } = useAuthStore()
  useEffect(() => { init() }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-[3px] border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"       element={<Landing />} />
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding"   element={<Onboarding />} />
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/lesson/:id"   element={<LessonPage />} />
          <Route path="/profile"      element={<Profile />} />
          <Route path="/Feature"         elementt={<Feature />} />
          <Route path="/courses"      element={<CourseCatalog />} />
          <Route path="/courses/:id"  element={<CourseDetail />} />
          <Route path="/leaderboard"  element={<Leaderboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/vocabulary"   element={<Vocabulary />} />
          <Route path="/practice"     element={<Practice />} />
          <Route path="/conversation" element={<Conversation />} />
          <Route path="/community"    element={<Community />} />
          <Route path="/videos"       element={<VideoLessons />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

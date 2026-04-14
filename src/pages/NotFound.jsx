import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-50 flex flex-col items-center justify-center text-center px-4">
      <p className="font-amharic text-8xl text-brand-200 mb-4">404</p>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-500 mb-8">This page doesn't exist. Let's get you back on track.</p>
      <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </div>
  )
}

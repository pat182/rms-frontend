
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {login} from '../api/auth'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleFocus = () => {
    setError('')
  }

  async function handleSubmit(e) {
   
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const response =  await login(email, password);
      const result = await response.json();
      if (!response.ok) {
        if(response.status == 401)
          setError(result?.detail)
        return
      }
      localStorage.setItem(
        'user',
        JSON.stringify(result.token.user)
      )
      localStorage.setItem('csrf_token', result.csrf);
      
      navigate('/dashboard', { replace: true })

    }catch(err){
      setError('Unable to connect to the server.')
    }finally{
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full">
      <div className="flex min-h-screen w-full overflow-hidden bg-white">

        {/* Left decorative panel */}
        <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-cyan-400 to-sky-600 md:block">
          <div className="absolute inset-0">
            <div className="absolute -left-[-350px] h-200 w-80 rotate-[-65deg] -top-50 bg-cyan-300/40" />
            <div className="absolute -left-20 -top-20 h-200 w-80 rotate-75 bg-cyan-300/40" />
            <div className="absolute -left-20 top-44 h-200 w-96 rotate-45 bg-sky-300/40" />
            <div className="absolute -right-20 top-48 h-100 w-80 rotate-45 bg-blue-600/50" />
            <div className="absolute -bottom-40 left-20 h-220 w-96 rotate-45 bg-blue-700/40" />
            <div className="absolute bottom-10 -right-24 h-100 w-200 rotate-75 bg-cyan-300/40" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/10" />
          </div>
        </div>

        {/* Right login panel */}
        <div className="flex w-full items-center justify-center bg-white px-6 py-12 sm:px-12 md:w-1/2">
          <div className="w-full max-w-sm">

            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                RMS
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Restaurant Management System
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleFocus}
                  required
                  className="w-full rounded-full border border-slate-200 py-3 pl-12 pr-5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <svg
                  className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <rect x="5" y="10" width="14" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>

                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleFocus}
                  required
                  className="w-full rounded-full border border-slate-200 py-3 pl-12 pr-5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {error && <p className="text-red-500">{error}</p>}

              {/* Forgot password */}
              <div className="flex justify-end">
                <a
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Forgot Password?
                </a>
              </div>

              {/* Sign in */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer rounded-full bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.99]"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  )
}

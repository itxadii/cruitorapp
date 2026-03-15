import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    navigate('/')
  }

  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto w-full max-w-md rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-semibold text-white">Sign in</h1>
        <p className="mt-2 text-white/70">Enter your email and password to access your account.</p>

        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <label className="block text-white/80">
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              type="email"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="block text-white/80">
            Password
            <input
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              type="password"
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>}

          <button
            type="submit"
            className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90"
          >
            Sign in
          </button>

          <p className="text-center text-sm text-white/70">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-sky-200 hover:text-white">
              Sign up
            </Link>
          </p>
        </form>
      </motion.section>
    </main>
  )
}

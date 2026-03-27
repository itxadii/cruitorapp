import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, resetPassword, confirmResetPassword } from 'aws-amplify/auth'

export function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [step, setStep] = useState<'login' | 'forgot' | 'reset'>('login')
  const [resetEmail, setResetEmail] = useState('')
  const [resetForm, setResetForm] = useState({ code: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const { nextStep } = await signIn({ username: form.email, password: form.password })
      if (nextStep.signInStep === 'DONE') {
        navigate('/app')
      } else {
        setError('Additional verification required. Please contact support.')
      }
    } catch (err: any) {
      if (err.name === 'UserNotConfirmedException') {
        setError('Email not confirmed. Please check your inbox for the verification code.')
      } else if (err.name === 'NotAuthorizedException') {
        setError('Incorrect email or password.')
      } else if (err.name === 'UserNotFoundException') {
        setError('No account found with this email.')
      } else {
        setError(err.message || 'Sign in failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!resetEmail.trim()) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    try {
      await resetPassword({ username: resetEmail })
      setResetSent(true)
      setStep('reset')
    } catch (err: any) {
      setError(err.message || 'Could not send reset code.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!resetForm.code || !resetForm.password || !resetForm.confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (resetForm.password !== resetForm.confirm) {
      setError('Passwords must match.')
      return
    }
    if (resetForm.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await confirmResetPassword({
        username: resetEmail,
        confirmationCode: resetForm.code,
        newPassword: resetForm.password,
      })
      setStep('login')
      setForm((prev) => ({ ...prev, email: resetEmail }))
      setError('')
    } catch (err: any) {
      setError(err.message || 'Invalid code or password.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"

  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto w-full max-w-md rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* ── Login ── */}
        {step === 'login' && (
          <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-semibold text-white">Sign in</h1>
            <p className="mt-2 text-white/70">Enter your email and password to access your account.</p>

            <form className="mt-8 grid gap-4" onSubmit={handleLogin}>
              <label className="block text-white/80">
                Email
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block text-white/80">
                Password
                <input
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </label>

              <button
                type="button"
                onClick={() => { setStep('forgot'); setError(''); setResetEmail(form.email) }}
                className="text-right text-xs text-sky-300/80 hover:text-sky-200 transition -mt-2"
              >
                Forgot password?
              </button>

              {error && <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>

              <p className="text-center text-sm text-white/70">
                Don't have an account?{' '}
                <Link to="/signup" className="font-semibold text-sky-200 hover:text-white">
                  Sign up
                </Link>
              </p>
            </form>
          </motion.div>
        )}

        {/* ── Forgot Password ── */}
        {step === 'forgot' && (
          <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-semibold text-white">Reset password</h1>
            <p className="mt-2 text-white/70">Enter your email and we'll send you a reset code.</p>

            <form className="mt-8 grid gap-4" onSubmit={handleForgotPassword}>
              <label className="block text-white/80">
                Email
                <input
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                />
              </label>

              {error && <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90 disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send reset code'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('login'); setError('') }}
                className="text-center text-sm text-white/40 hover:text-white/60 transition"
              >
                ← Back to sign in
              </button>
            </form>
          </motion.div>
        )}

        {/* ── Confirm Reset ── */}
        {step === 'reset' && (
          <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-3xl font-semibold text-white">New password</h1>
            <p className="mt-2 text-white/70">
              Enter the code sent to{' '}
              <span className="font-semibold text-sky-300">{resetEmail}</span> and choose a new password.
            </p>

            <form className="mt-8 grid gap-4" onSubmit={handleConfirmReset}>
              <label className="block text-white/80">
                Reset code
                <input
                  value={resetForm.code}
                  onChange={(e) => setResetForm((prev) => ({ ...prev, code: e.target.value }))}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
                  placeholder="······"
                  required
                />
              </label>

              <label className="block text-white/80">
                New password
                <input
                  value={resetForm.password}
                  onChange={(e) => setResetForm((prev) => ({ ...prev, password: e.target.value }))}
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </label>

              <label className="block text-white/80">
                Confirm new password
                <input
                  value={resetForm.confirm}
                  onChange={(e) => setResetForm((prev) => ({ ...prev, confirm: e.target.value }))}
                  type="password"
                  className={inputClass}
                  placeholder="••••••••"
                  required
                />
              </label>

              {error && <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>}

              {resetSent && (
                <div className="rounded-2xl bg-green-500/20 px-4 py-3 text-sm text-green-100">
                  Code sent! Check your inbox.
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90 disabled:opacity-60"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('forgot'); setError('') }}
                className="text-center text-sm text-white/40 hover:text-white/60 transition"
              >
                ← Back
              </button>
            </form>
          </motion.div>
        )}
      </motion.section>
    </main>
  )
}
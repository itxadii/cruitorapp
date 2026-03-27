import { motion, AnimatePresence } from 'framer-motion'
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

  const inputClass = "mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-[#8e3afc] focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 transition-all font-medium"

  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12 relative z-10">
      <motion.section
        className="relative mx-auto w-full max-w-md p-10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 bg-[#8e3afc] pointer-events-none" />

        <AnimatePresence mode="wait">
          {/* ── Login ── */}
          {step === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="relative z-10">
              <h1 className="text-3xl font-black font-['Lato'] text-gray-900 tracking-tight">Sign in</h1>
              <p className="mt-2 text-gray-600 font-['Lato']">Enter your email and password to access your account.</p>

              <form className="mt-8 grid gap-5" onSubmit={handleLogin}>
                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
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

                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
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
                  className="text-right text-sm font-bold text-[#8e3afc] hover:text-[#7a2edb] transition-colors -mt-3"
                >
                  Forgot password?
                </button>

                {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 font-['Lato']">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-2xl bg-[#8e3afc] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 font-['Merriweather']"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <p className="text-center text-sm text-gray-600 font-['Lato'] mt-2">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-bold text-[#8e3afc] hover:text-[#7a2edb] transition-colors">
                    Sign up
                  </Link>
                </p>
              </form>
            </motion.div>
          )}

          {/* ── Forgot Password ── */}
          {step === 'forgot' && (
            <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="relative z-10">
              <h1 className="text-3xl font-black font-['Lato'] text-gray-900 tracking-tight">Reset password</h1>
              <p className="mt-2 text-gray-600 font-['Lato']">Enter your email and we'll send you a reset code.</p>

              <form className="mt-8 grid gap-5" onSubmit={handleForgotPassword}>
                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
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

                {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 font-['Lato']">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-2xl bg-[#8e3afc] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 font-['Lato']"
                >
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => { setStep('login'); setError('') }}
                    className="text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors font-['Lato'] flex items-center justify-center gap-1"
                  >
                    ← Back to sign in
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ── Confirm Reset ── */}
          {step === 'reset' && (
            <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="relative z-10">
              <h1 className="text-3xl font-black font-['Montserrat'] text-gray-900 tracking-tight">New password</h1>
              <p className="mt-2 text-gray-600 font-['Lato']">
                Enter the code sent to <span className="font-bold text-[#8e3afc]">{resetEmail}</span> and choose a new password.
              </p>

              <form className="mt-8 grid gap-5" onSubmit={handleConfirmReset}>
                <label className="block text-sm font-bold text-gray-700 font-['Lato'] text-center">
                  Reset code
                  <input
                    value={resetForm.code}
                    onChange={(e) => setResetForm((prev) => ({ ...prev, code: e.target.value }))}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-3 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-gray-900 placeholder-gray-300 focus:border-[#8e3afc] focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 transition-all"
                    placeholder="······"
                    required
                  />
                </label>

                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
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

                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
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

                {error && <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 font-['Lato']">{error}</div>}

                {resetSent && (
                  <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-600 font-['Lato']">
                    Code sent! Check your inbox.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-2xl bg-[#8e3afc] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 font-['Montserrat']"
                >
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setError('') }}
                    className="text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors font-['Lato'] flex items-center justify-center gap-1"
                  >
                    ← Back
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  )
}
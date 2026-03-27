import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'

export function Signup() {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' })
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'signup' | 'confirm'>('signup')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)
  const navigate = useNavigate()

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!form.email || !form.password || !form.confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords must match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const { nextStep } = await signUp({
        username: form.email,
        password: form.password,
        options: { userAttributes: { email: form.email } },
      })

      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setStep('confirm')
      } else {
        navigate('/app')
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter the confirmation code.')
      return
    }

    setLoading(true)
    try {
      await confirmSignUp({ username: form.email, confirmationCode: code })
      navigate('/login')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendSignUpCode({ username: form.email })
      setResent(true)
      setTimeout(() => setResent(false), 4000)
    } catch (err: any) {
      setError(err.message || 'Could not resend code.')
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto w-full max-w-md rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="wait">
          {step === 'signup' ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-semibold text-white">Create an account</h1>
              <p className="mt-2 text-white/70">Sign up to start saving your searches and tracking companies.</p>

              <form className="mt-8 grid gap-4" onSubmit={handleSignup}>
                <label className="block text-white/80">
                  Email
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
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
                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
                    placeholder="••••••••"
                    required
                  />
                </label>

                <label className="block text-white/80">
                  Confirm password
                  <input
                    value={form.confirm}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
                    placeholder="••••••••"
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90 disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-sm text-white/70">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-sky-200 hover:text-white">
                    Sign in
                  </Link>
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-semibold text-white">Check your email</h1>
              <p className="mt-2 text-white/70">
                We sent a 6-digit code to{' '}
                <span className="font-semibold text-sky-300">{form.email}</span>. Enter it below.
              </p>

              <form className="mt-8 grid gap-4" onSubmit={handleConfirm}>
                <label className="block text-white/80">
                  Confirmation code
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
                    placeholder="······"
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-2xl bg-red-500/20 px-4 py-3 text-sm text-red-100">{error}</div>
                )}

                {resent && (
                  <div className="rounded-2xl bg-green-500/20 px-4 py-3 text-sm text-green-100">
                    Code resent! Check your inbox.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90 disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify email'}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  className="text-center text-sm text-white/50 hover:text-white/80 transition"
                >
                  Didn't get the code? <span className="text-sky-300 font-semibold">Resend</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setStep('signup'); setError('') }}
                  className="text-center text-sm text-white/40 hover:text-white/60 transition"
                >
                  ← Back to signup
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </main>
  )
}
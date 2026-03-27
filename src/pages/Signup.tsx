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
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12 relative z-10">
      <motion.section
        className="relative mx-auto w-full max-w-md p-10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Ambient Glow matching your new theme */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 bg-[#8e3afc] pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 'signup' ? (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10"
            >
              <h1 className="text-3xl font-black font-['Lato'] text-gray-900 tracking-tight">Create an account</h1>
              <p className="mt-2 text-gray-600 font-['Lato']">Sign up to start saving your searches and tracking companies.</p>

              <form className="mt-8 grid gap-5" onSubmit={handleSignup}>
                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
                  Email
                  <input
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    type="email"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-[#8e3afc] focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 transition-all font-medium"
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
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-[#8e3afc] focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </label>

                <label className="block text-sm font-bold text-gray-700 font-['Lato']">
                  Confirm password
                  <input
                    value={form.confirm}
                    onChange={(e) => setForm((prev) => ({ ...prev, confirm: e.target.value }))}
                    type="password"
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:border-[#8e3afc] focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 transition-all font-medium"
                    placeholder="••••••••"
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 font-['Lato']">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 rounded-2xl bg-[#8e3afc] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 font-['Merriweather']"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>

                <p className="text-center text-sm text-gray-600 font-['Lato'] mt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-[#8e3afc] hover:text-[#7a2edb] transition-colors">
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
              className="relative z-10"
            >
              <h1 className="text-3xl font-black font-['Montserrat'] text-gray-900 tracking-tight">Check your email</h1>
              <p className="mt-2 text-gray-600 font-['Lato'] leading-relaxed">
                We sent a 6-digit code to{' '}
                <span className="font-bold text-[#8e3afc]">{form.email}</span>. Enter it below to verify your account.
              </p>

              <form className="mt-8 grid gap-5" onSubmit={handleConfirm}>
                <label className="block text-sm font-bold text-gray-700 font-['Lato'] text-center">
                  Confirmation code
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-3 w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-4 text-center text-3xl font-black tracking-[0.5em] text-gray-900 placeholder-gray-300 focus:border-[#8e3afc] focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 transition-all"
                    placeholder="······"
                    required
                  />
                </label>

                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600 font-['Lato']">{error}</div>
                )}

                {resent && (
                  <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-600 font-['Lato']">
                    Code resent! Check your inbox.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length < 6}
                  className="mt-2 rounded-2xl bg-[#8e3afc] px-6 py-4 text-base font-bold text-white shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0 font-['Montserrat']"
                >
                  {loading ? 'Verifying...' : 'Verify email'}
                </button>

                <div className="flex flex-col gap-3 mt-4">
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-center text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors font-['Lato']"
                  >
                    Didn't get the code? <span className="text-[#8e3afc] font-bold">Resend</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('signup'); setError('') }}
                    className="text-center text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors font-['Lato'] flex items-center justify-center gap-1"
                  >
                    ← Back to signup
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
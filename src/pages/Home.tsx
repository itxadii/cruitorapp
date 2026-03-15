import { motion } from 'framer-motion'
import { useState } from 'react'

export function Home() {
  const [company, setCompany] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto flex w-full max-w-4xl flex-col gap-10 rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Find the right jobs, fast
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-white/70">
            Enter a company name to explore opportunities and stay up to date when new roles drop.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
          className="grid gap-4 sm:grid-cols-[1fr_auto]"
        >
          <label className="flex w-full flex-col gap-2">
            <span className="text-sm font-medium text-white/80">Enter a company name</span>
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 shadow-inner shadow-black/25 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/30"
            />
          </label>

          <button
            type="submit"
            className="rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90 focus:outline-none focus:ring-4 focus:ring-sky-400/40"
          >
            Search
          </button>

          {submitted && (
            <motion.div
              className="col-span-full rounded-2xl bg-white/10 p-4 text-center text-white/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Looking for roles at <span className="font-semibold text-sky-200">{company || '...'}</span>.
            </motion.div>
          )}
        </form>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-6 text-white/80">
            <h2 className="text-xl font-semibold text-white">Modern UI</h2>
            <p className="mt-2 text-sm">Glassmorphism, smooth animations, and a minimal layout.</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 text-white/80">
            <h2 className="text-xl font-semibold text-white">Get Started</h2>
            <p className="mt-2 text-sm">Create an account to save searches and track your favorite companies.</p>
          </div>
        </div>
      </motion.section>
    </main>
  )
}

import { motion } from 'framer-motion'
import { useState } from 'react'

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto w-full max-w-3xl rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-semibold text-white">Contact Us</h1>
        <p className="mt-2 text-white/70">Have a question or need help? Send us a message.</p>

        <form
          className="mt-8 grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <label className="block text-white/80">
            Name
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-2 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
              placeholder="Your name"
              required
            />
          </label>

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
            Message
            <textarea
              value={form.message}
              onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
              className="mt-2 h-32 w-full resize-none rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-sky-300 focus:ring-2 focus:ring-sky-500/30"
              placeholder="How can we help?"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-2 rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90"
          >
            Send message
          </button>

          {submitted && (
            <motion.div
              className="rounded-2xl bg-white/10 p-4 text-center text-white/80"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Thanks! We'll get back to you soon.
            </motion.div>
          )}
        </form>
      </motion.section>
    </main>
  )
}

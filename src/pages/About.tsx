import { motion } from 'framer-motion'

export function About() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto w-full max-w-3xl rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-semibold text-white">About JobGmail</h1>
        <p className="mt-4 text-white/70">
          JobGmail is a modern landing experience built with React, Tailwind, and Framer Motion. The goal is to make job searching smoother and more enjoyable while offering a clean, polished UI.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Built for speed</h2>
            <p className="mt-2 text-white/70">Fast navigation with instant transitions and responsive layouts.</p>
          </div>
          <div className="rounded-2xl bg-white/5 p-6">
            <h2 className="text-xl font-semibold text-white">Scalable</h2>
            <p className="mt-2 text-white/70">Designed to grow with additional pages and authentication flows.</p>
          </div>
        </div>
      </motion.section>
    </main>
  )
}

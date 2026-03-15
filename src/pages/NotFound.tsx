import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12">
      <motion.section
        className="mx-auto w-full max-w-md rounded-3xl bg-black/40 p-10 shadow-[0_25px_45px_rgba(0,0,0,0.35)] backdrop-blur-xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-5xl font-bold text-white">404</h1>
        <p className="mt-4 text-white/70">We couldn't find the page you're looking for.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-2xl bg-sky-500/90 px-6 py-3 text-sm font-semibold text-black shadow-xl shadow-sky-500/30 transition hover:bg-sky-400/90"
        >
          Go back home
        </Link>
      </motion.section>
    </main>
  )
}

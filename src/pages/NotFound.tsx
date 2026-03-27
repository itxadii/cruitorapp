import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-88px)] flex-col items-center justify-center px-4 py-12 relative z-10">
      <motion.section
        className="relative mx-auto w-full max-w-md p-10 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden text-center flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20 bg-[#8e3afc] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center w-full">
          {/* Custom Icon Box */}
          <div className="w-20 h-20 bg-[#8e3afc]/10 rounded-3xl flex items-center justify-center mb-6 border border-[#8e3afc]/20 text-[#8e3afc] shadow-inner">
            <Compass size={40} strokeWidth={1.5} />
          </div>

          <h1 className="text-7xl font-black font-['Montserrat'] text-gray-900 tracking-tight">
            404
          </h1>
          
          <h2 className="mt-4 text-2xl font-bold font-['Montserrat'] text-gray-800">
            Lost in space
          </h2>
          
          <p className="mt-3 text-gray-600 font-['Lato'] leading-relaxed">
            We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps it never existed at all.
          </p>
          
          <Link
            to="/"
            className="mt-8 inline-flex items-center justify-center w-full rounded-2xl bg-[#8e3afc] px-8 py-4 text-base font-bold text-white shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all duration-300 font-['Montserrat']"
          >
            Go back home
          </Link>
        </div>
      </motion.section>
    </main>
  )
}
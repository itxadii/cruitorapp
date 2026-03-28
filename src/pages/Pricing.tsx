import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle2, Rocket, Zap, Clock } from 'lucide-react';

export function Pricing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <main className="relative pt-24 pb-24 px-6 max-w-5xl mx-auto z-10 flex flex-col justify-center">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#8e3afc]/15 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-12 w-full"
      >
        
        {/* --- Header Section --- */}
        <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8e3afc]/10 border border-[#8e3afc]/20 text-[#8e3afc] font-bold text-xs uppercase tracking-widest mb-6 font-['Lato'] shadow-sm">
            <Clock size={16} />
            <span>Pricing Launching Soon</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 font-['Lato'] tracking-tight">
            Simple pricing. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8e3afc] to-[#BDA6CE]">But not just yet.</span>
          </h1>
          <p className="text-lg text-gray-600 font-['Lato'] leading-relaxed">
            Cruitor is currently undergoing rigorous testing to ensure we deliver the absolute best outreach experience. While we finalize our premium plans, we are opening up <span className="font-bold text-gray-900">full, unrestricted access for free.</span>
          </p>
        </motion.div>

        {/* --- The "Early Access" Pricing Card --- */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto w-full">
          <div className="relative p-8 md:p-12 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border-2 border-[#8e3afc]/30 shadow-[0_20px_40px_rgba(142,58,252,0.1)] overflow-hidden text-center group">
            
            {/* Animated Spotlight Hover */}
            <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full blur-3xl opacity-20 bg-[#8e3afc] group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" />

            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white font-bold text-sm font-['Lato'] shadow-md">
                <Sparkles size={16} className="text-[#8e3afc]" />
                Early Access Beta
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-6xl font-black text-gray-900 font-['Lato']">$0</span>
              <span className="text-xl font-bold text-gray-400 font-['Lato'] mt-4">/ right now</span>
            </div>

            <p className="text-gray-600 font-['Lato'] font-medium mb-10 max-w-sm mx-auto">
              Jump in, test the scout engine, connect your Gmail, and land your next role on us. 
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-10 text-left max-w-md mx-auto">
              <div className="flex items-center gap-3 text-gray-700 font-['Lato'] font-bold">
                <CheckCircle2 size={20} className="text-[#8e3afc]" /> Unlimited email searches
              </div>
              <div className="flex items-center gap-3 text-gray-700 font-['Lato'] font-bold">
                <CheckCircle2 size={20} className="text-[#8e3afc]" /> Direct Gmail integration
              </div>
              <div className="flex items-center gap-3 text-gray-700 font-['Lato'] font-bold">
                <CheckCircle2 size={20} className="text-[#8e3afc]" /> Proven outreach templates
              </div>
              <div className="flex items-center gap-3 text-gray-700 font-['Lato'] font-bold">
                <CheckCircle2 size={20} className="text-[#8e3afc]" /> Bulk sending capabilities
              </div>
            </div>

            <Link 
              to="/signup" 
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#8e3afc] text-white rounded-2xl font-bold font-['Lato'] text-lg shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-1 transition-all duration-300"
            >
              Start Applying for Free <Rocket size={20} />
            </Link>
          </div>
        </motion.div>

        {/* --- FAQ Teaser --- */}
        <motion.div variants={itemVariants} className="text-center max-w-xl mx-auto pt-8">
          <p className="text-gray-500 font-['Lato'] text-sm flex items-center justify-center gap-2">
            <Zap size={16} className="text-yellow-500" />
            Pricing plans will be announced via email before any changes are made to your account. You will never be charged without explicit consent.
          </p>
        </motion.div>

      </motion.div>
    </main>
  );
}
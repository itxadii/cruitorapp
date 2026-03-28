import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Mail, 
  Zap, 
  FileText, 
  Gauge, 
  ShieldCheck, 
  Lock, 
  MailCheck, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export function Features() {
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
    <main className="relative pt-24 pb-24 px-6 max-w-7xl mx-auto z-10">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-20 md:space-y-32"
      >
        
        {/* --- 1. HERO SECTION --- */}
        <motion.section variants={itemVariants} className="text-center max-w-3xl mx-auto pt-10">
          <h1 className="text-5xl md:text-7xl font-black font-['Lato'] text-gray-900 mb-6 tracking-tight">
            Everything you need to reach the <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8e3afc] to-[#BDA6CE]">right people</span> faster.
          </h1>
          <p className="text-xl text-gray-600 font-['Lato'] leading-relaxed">
            Cruitor is designed to remove friction from job outreach — from finding the right contacts to sending personalized emails in seconds.
          </p>
        </motion.section>

        {/* --- 2. CORE FEATURES GRID --- */}
        <motion.section variants={itemVariants}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <FeatureDetailCard 
              icon={<Search size={32} />}
              title="Find HR Emails Instantly"
              desc="Stop wasting hours searching. Enter any company name and Cruitor discovers relevant contacts. No manual digging. No guesswork."
              bullets={['HR emails', 'Hiring contacts', 'Careers inboxes']}
              accent="#8e3afc"
            />

            <FeatureDetailCard 
              icon={<Filter size={32} />}
              title="Smart Filtering"
              desc="Not all emails are useful. Cruitor filters out noise and surfaces only the decision-makers so you don’t send emails into the void."
              bullets={['Hiring-related emails', 'Recruitment contacts', 'Decision-makers']}
              accent="#00A4EF"
            />

            <FeatureDetailCard 
              icon={<Mail size={32} />}
              title="Send From Your Gmail"
              desc="No third-party sending tools. Connect securely and send directly from your own account to maintain authenticity and trust."
              bullets={['Connect securely', 'Send from your account', 'Your outreach stays personal']}
              accent="#FF9900"
            />

            <FeatureDetailCard 
              icon={<Zap size={32} />}
              title="One-Click Outreach"
              desc="Go from search → send in seconds. No repetitive typing. No switching tabs."
              bullets={['Use pre-built templates', 'Customize your message', 'Send to multiple instantly']}
              accent="#00A884"
            />

            <FeatureDetailCard 
              icon={<FileText size={32} />}
              title="Smart Templates"
              desc="Don’t know what to write? Cruitor helps you focus on the opportunity, not the wording."
              bullets={['Clean, professional templates', 'Messages that get responses', 'Highly customizable drafts']}
              accent="#E83D84"
            />

            <FeatureDetailCard 
              icon={<Gauge size={32} />}
              title="Built for Speed"
              desc="What used to take hours now takes seconds. Everything happens in one seamless workspace."
              bullets={['No switching between tools', 'No manual copy-paste', 'No searching across platforms']}
              accent="#4A4458"
            />

          </div>
        </motion.section>

        {/* --- 3. SECURITY & TRUST --- */}
        <motion.section variants={itemVariants} className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 font-bold text-sm mb-4 border border-green-500/20">
              <ShieldCheck size={16} />
              <span>Security First</span>
            </div>
            <h2 className="text-3xl font-black font-['Lato'] text-gray-900">
              Built with strict safety principles.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <SecurityCard 
              icon={<Lock size={28} />}
              title="Google OAuth Secure"
              desc="Connects via official Google APIs. We never see or store your Gmail password."
            />
            <SecurityCard 
              icon={<ShieldCheck size={28} />}
              title="100% Your Control"
              desc="You review every email before sending. No automated blasts. No hidden actions."
            />
            <SecurityCard 
              icon={<MailCheck size={28} />}
              title="Verified & Spam-Free"
              desc="Every email is validated before sending. Protects your reputation and reduces bounce."
            />
          </div>
        </motion.section>

        {/* --- 4. AUDIENCE & FINAL THOUGHT CTA --- */}
        <motion.section variants={itemVariants}>
          <div className="bg-[#0a0a0a] rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
            {/* Dark mode glow effect for the CTA box */}
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#8e3afc]/30 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#00A4EF]/20 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-black font-['Lato'] text-white mb-6">
                You don’t need to apply everywhere.
              </h2>
              <p className="text-xl text-gray-400 font-['Lato'] mb-10 leading-relaxed">
                You need to reach the right people — quickly. Whether you are a <span className="text-white font-bold">student applying for internships</span>, a <span className="text-white font-bold">developer looking for opportunities</span>, or just tired of manual outreach, Cruitor makes it possible.
              </p>
              
              <Link 
                to="/signup" 
                className="inline-flex items-center gap-3 px-10 py-5 bg-[#8e3afc] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-1 transition-all duration-300"
              >
                Start Applying Faster <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </motion.section>

      </motion.div>
    </main>
  );
}

// --- Helper Components ---

function FeatureDetailCard({ icon, title, desc, bullets, accent }: { icon: React.ReactNode, title: string, desc: string, bullets: string[], accent: string }) {
  return (
    <div className="relative p-8 bg-white/50 backdrop-blur-2xl rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-500 group overflow-hidden flex flex-col h-full text-left">
      
      {/* Dynamic Internal Spotlight */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* Giant Animated Watermark Icon */}
      <div
        className="absolute -bottom-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none flex items-center justify-center w-48 h-48 group-hover:scale-110 group-hover:-rotate-12"
        style={{ color: accent }}
      >
        <div className="scale-[4]">
          {icon}
        </div>
      </div>

      {/* Elevated Icon Dock */}
      <div
        className="relative z-10 mb-6 w-14 h-14 flex items-center justify-center rounded-xl bg-white shadow-sm border border-gray-100 group-hover:-translate-y-1 transition-transform duration-500"
      >
        <div 
          className="absolute inset-0 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" 
          style={{ backgroundColor: accent }} 
        />
        <div className="relative z-10" style={{ color: accent }}>
          {icon}
        </div>
      </div>

      <h3 className="relative z-10 text-2xl font-black text-gray-900 mb-3 font-['Lato']">
        {title}
      </h3>

      <p className="relative z-10 text-gray-600 font-medium leading-relaxed font-['Lato'] mb-6 flex-1">
        {desc}
      </p>

      {/* Feature Bullet Points */}
      <ul className="relative z-10 space-y-2.5 mt-auto pt-6 border-t border-gray-100">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm font-bold text-gray-700 font-['Lato']">
            <CheckCircle2 size={18} className="text-[#8e3afc] shrink-0 mt-0.5" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SecurityCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm hover:bg-white/60 transition-colors duration-300 text-center flex flex-col items-center">
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-gray-100 text-gray-800">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-gray-900 mb-3 font-['Lato']">
        {title}
      </h4>
      <p className="text-gray-600 leading-relaxed font-['Lato'] font-medium">
        {desc}
      </p>
    </div>
  );
}
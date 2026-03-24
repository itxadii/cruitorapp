import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-[#B4D3D9] via-[#F2EAE0] to-[#B4D3D9]">
      
      {/* Hero Section */}
      <section className="relative px-6 py-24 lg:py-32 flex flex-col items-center text-center overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          {/* Main Headline: Roboto Flex */}
          <h1 className="text-5xl md:text-7xl font-roboto font-black tracking-tight text-[#2D2D2D] mb-6 leading-[1.1]">
            Stop Searching for <span className="text-[#8e3afc] font-bitcount">HR Emails</span> Manually.
          </h1>
          
          {/* Description: Noto Serif */}
          <p className="text-lg md:text-xl font-noto text-[#4A4A4A]/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Cruitor automates the outreach process. Find HR contacts for any company and send your resume in seconds using your own Gmail API integration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center font-roboto">
            <Link 
              to="/signup" 
              className="px-10 py-4 bg-[#8e3afc] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#9B8EC7]/20 hover:bg-[#7a2edb] transition-all"
            >
              Start Applying Now
            </Link>
            
            <Link 
              to="/about" 
              className="px-10 py-4 bg-slate-400 backdrop-blur-md border-2 border-[#9B8EC7]/20 text-[#4A4458] rounded-2xl font-bold text-lg hover:bg-slate-500 transition-all"
            >
              How it works
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 w-full">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Auto-Discovery" 
            desc="Our scout engine crawls career pages and search snippets to find verified HR and talent acquisition emails."
            icon="🔍"
            accent="#BDA6CE"
          />
          <FeatureCard 
            title="Gmail Integration" 
            desc="Securely connect your Gmail to send personalized cold emails directly from your own sent folder."
            icon="📧"
            accent="#9B8EC7"
          />
          <FeatureCard 
            title="Smart Templates" 
            desc="Use proven templates that get responses. Simply enter the company name and let Cruitor do the rest."
            icon="🚀"
            accent="#B4D3D9"
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ title, desc, icon, accent }: { title: string, desc: string, icon: string, accent: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="p-8 bg-white/70 backdrop-blur-lg rounded-[2.5rem] border border-white/50 shadow-sm hover:shadow-2xl hover:shadow-[#9B8EC7]/10 transition-all group"
    >
      <div 
        className="text-4xl mb-6 w-16 h-16 flex items-center justify-center rounded-2xl shadow-inner"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        {icon}
      </div>
      {/* Title: Bitcount Ink for that "Stamped/Ink" feel */}
      <h3 className="text-2xl font-bitcount font-bold text-[#2D2D2D] mb-2 group-hover:text-[#8e3afc] transition-colors">
        {title}
      </h3>
      {/* Body: Roboto Flex for clear reading */}
      <p className="text-[#666666] font-roboto leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
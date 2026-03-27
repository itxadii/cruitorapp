import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ConnectionGraphic from '../components/ConnectionGraphic'; // Assuming you put it here!

export function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      
      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-12 flex flex-col items-center text-center overflow-hidden w-full max-w-6xl mx-auto">
        
        {/* --- MOVED: Animated Network Graphic is now at the Top --- */}
        <ConnectionGraphic />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }} // Added a slight delay so the graphic draws first
          className="max-w-4xl z-10 relative"
        >
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-['Merriweather'] font-black tracking-tight text-[#424242] mb-6 leading-[1.1]">
            Get Interviews Faster — Instantly Find <span className="text-[#8e3afc] font-bitcount">Company Emails</span> & Send Outreach in 1 Click
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl font-['Montserrat'] text-[#4A4A4A]/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Cruitor automates the outreach process. Find HR contacts for any company and send your resume in seconds using your own Gmail.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center font-['Lato'] mb-16">
            <Link 
              to="/signup" 
              className="px-10 py-4 bg-[#8e3afc] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#9B8EC7]/20 hover:bg-[#7a2edb] transition-all"
            >
             Send Your First Outreach Email
            </Link>
            
            <Link 
              to="/about" 
              className="px-10 py-4 bg-slate-400 backdrop-blur-md border-2 border-[#9B8EC7]/20 text-[#4A4458] rounded-2xl font-bold font-['Lato'] text-lg hover:bg-slate-500 hover:text-white transition-all"
            >
              How it works
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-10 w-full relative z-10">
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

// --- Existing Feature Card ---
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
      <h3 className="text-2xl font-bitcount font-bold text-[#2D2D2D] mb-2 group-hover:text-[#8e3afc] transition-colors">
        {title}
      </h3>
      <p className="text-[#666666] font-roboto leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
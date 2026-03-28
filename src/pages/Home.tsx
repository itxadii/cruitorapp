import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ConnectionGraphic from '../components/ConnectionGraphic'; // Assuming you put it here!
import { Search, Mail, Rocket, ChevronRight } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
import InteractiveDemo from '../components/InteractiveDemo'; 

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
            Instantly Find <span className="text-[#8e3afc] font-bitcount">Company Emails</span> & Send Outreach in 1 Click
          </h1>
          
          {/* Description */}
          <p className="text-lg md:text-xl font-['Montserrat'] text-[#4A4A4A]/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Cruitor automates the outreach process. Find HR contacts for any company and send your resume in seconds using your own Gmail.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center font-['Lato'] mb-16">
            <Link 
              to="/signup" 
              className="px-10 py-4 flex bg-[#8f39ff] text-white rounded-2xl border-2 border-slate-700 font-bold text-lg shadow-xl shadow-[#9B8EC7]/20 hover:bg-[#7a2edb] transition-all"
            >
             Send Your First Outreach Email <ChevronRight size={28} strokeWidth={2.5} className="" />
            </Link>
            
            <Link 
              to="/about" 
              className="px-10 py-4 bg-accent-foreground backdrop-blur-md border-2 border-[#9B8EC7]/20 text-[#4A4458] rounded-2xl font-bold font-['Lato'] text-lg hover:bg-slate-800 hover:text-white transition-all"
            >
              How it works
            </Link>
          </div>
        </motion.div>
      </section>
      <InteractiveDemo />
      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-10 w-full relative z-10">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Find HR Emails Instantly" 
            desc="Enter any company name and get verified HR & hiring emails in seconds."
            icon={<Search size={28} strokeWidth={2.5} />} // Passing the Lucide component
            accent="#BDA6CE"
          />
          <FeatureCard 
            title="Send Emails from Your Gmail" 
            desc="Securely connect your Gmail and send outreach directly—no tools needed."
            icon={<Mail size={28} strokeWidth={2.5} />} // Passing the Lucide component
            accent="#9B8EC7"
          />
          <FeatureCard 
            title="Apply in One Click" 
            desc="Use proven templates and reach multiple companies instantly."
            icon={<Rocket size={28} strokeWidth={2.5} />} // Passing the Lucide component
            accent="#B4D3D9"
          />
        </div>
      </section>
    </main>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, Shield, Sparkles, CheckCircle2, XCircle, ArrowRight, Target } from 'lucide-react';

export function About() {
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
    <main className="relative pt-24 pb-24 px-6 max-w-5xl mx-auto z-10">
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-16 md:space-y-24"
      >
        
        {/* --- 1. HERO SECTION --- */}
        <motion.section variants={itemVariants} className="text-center max-w-3xl mx-auto pt-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8e3afc]/10 text-[#8e3afc] font-bold text-sm mb-6 border border-[#8e3afc]/20">
            <Target size={16} />
            <span>Our Mission</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black font-['Merriweather'] text-gray-900 mb-6 leading-tight">
            We built Cruitor because applying to jobs is <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">broken.</span>
          </h1>
          <p className="text-xl text-gray-600 font-['Lato'] leading-relaxed">
            Every student knows this pain. You find a company. You search for HR emails. You scroll LinkedIn, Google, random websites. You copy emails, write messages, send one by one. <br/><br/>
            <span className="font-bold text-gray-900">It’s slow. It’s frustrating. And most people give up. We didn’t accept that.</span>
          </p>
        </motion.section>

        {/* --- 2. THE SOLUTION (Glassmorphism Card) --- */}
        <motion.section variants={itemVariants}>
          <div className="p-8 md:p-12 bg-white/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#8e3afc]/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <h2 className="text-3xl font-bold font-['Montserrat'] text-gray-900 mb-6">What Cruitor does</h2>
            <p className="text-lg text-gray-600 mb-8 font-['Lato'] max-w-2xl">
              Cruitor helps you go from <strong>“I want to apply” → “Email sent”</strong> in seconds. Just enter a company name, and Cruitor:
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <SolutionStep number="1" text="Finds relevant HR and hiring emails instantly" />
              <SolutionStep number="2" text="Filters out useless contacts and dead ends" />
              <SolutionStep number="3" text="Lets you send outreach directly from your Gmail" />
            </div>
            
            <div className="mt-8 p-4 bg-[#8e3afc]/5 rounded-xl border border-[#8e3afc]/10 text-[#8e3afc] font-bold text-center font-['Lato']">
              No scraping manually. No guessing. No wasting hours.
            </div>
          </div>
        </motion.section>

        {/* --- 3. WHY IT MATTERS & APPROACH --- */}
        <motion.section variants={itemVariants}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-['Montserrat'] text-gray-900 mb-4">Why this matters</h2>
            <p className="text-lg text-gray-600 font-['Lato'] max-w-2xl mx-auto">
              Opportunities don’t come from applying on portals alone. They come from direct outreach, visibility, and taking action faster than others. <strong className="text-[#8e3afc]">Cruitor is built to give you that edge.</strong>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <ApproachCard 
              icon={<Zap size={28} />}
              title="1. Speed"
              desc="What used to take hours of manual searching now takes literally seconds."
              color="#FF9900"
            />
            <ApproachCard 
              icon={<Sparkles size={28} />}
              title="2. Simplicity"
              desc="No complex setup. No learning curve. Just search → send."
              color="#00A4EF"
            />
            <ApproachCard 
              icon={<Shield size={28} />}
              title="3. Control"
              desc="Emails are sent from your Gmail. Nothing sends without your action. No passwords stored."
              color="#00A884"
            />
          </div>
        </motion.section>

        {/* --- 4. WHO IT'S FOR VS WHAT IT'S NOT --- */}
        <motion.section variants={itemVariants} className="grid md:grid-cols-2 gap-8">
          {/* Who it's for */}
          <div className="p-8 bg-green-50/50 backdrop-blur-xl rounded-[2rem] border border-green-100/80 shadow-sm">
            <h3 className="text-2xl font-bold font-['Montserrat'] text-gray-900 mb-6 flex items-center gap-3">
              <CheckCircle2 className="text-green-500" /> Who it’s for
            </h3>
            <ul className="space-y-4 font-['Lato'] text-gray-700 font-medium">
              <ListItem text="Students applying for internships" />
              <ListItem text="Developers looking for opportunities" />
              <ListItem text="Anyone tired of manual job outreach" />
            </ul>
            <p className="mt-6 text-sm text-gray-500 italic">
              "I wish I could just send my resume to the right person quickly" — If you've thought this, this is for you.
            </p>
          </div>

          {/* What we are not */}
          <div className="p-8 bg-red-50/50 backdrop-blur-xl rounded-[2rem] border border-red-100/80 shadow-sm">
            <h3 className="text-2xl font-bold font-['Montserrat'] text-gray-900 mb-6 flex items-center gap-3">
              <XCircle className="text-red-400" /> What we are not
            </h3>
            <ul className="space-y-4 font-['Lato'] text-gray-700 font-medium">
              <NegativeListItem text="A traditional job portal" />
              <NegativeListItem text="A spam tool" />
              <NegativeListItem text="An automated bot sending random emails" />
            </ul>
            <p className="mt-6 text-sm text-gray-500 italic">
              Cruitor is a smart assistant, not a replacement for your personal touch.
            </p>
          </div>
        </motion.section>

        {/* --- 5. CTA / FINAL THOUGHT --- */}
        <motion.section variants={itemVariants} className="text-center pt-8 pb-12">
          <h2 className="text-4xl font-black font-['Merriweather'] text-gray-900 mb-6">
            To remove friction between effort and opportunity.
          </h2>
          <p className="text-xl text-gray-600 font-['Lato'] mb-10 max-w-3xl mx-auto">
            Because getting noticed shouldn’t depend on how much time you can waste searching.<br/><br/>
            <span className="font-bold text-gray-900">You don’t need 100 applications. You need a few right connections.</span> Cruitor helps you make them faster.
          </p>
          
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#8e3afc] text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-1 transition-all duration-300"
          >
            Start Applying Smarter <ArrowRight size={20} />
          </Link>
        </motion.section>

      </motion.div>
    </main>
  );
}

// --- Small Helper Components for the About Page ---

function SolutionStep({ number, text }: { number: string, text: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center font-bold text-[#8e3afc] font-['Montserrat']">
        {number}
      </div>
      <p className="text-gray-700 font-medium font-['Lato'] leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function ApproachCard({ title, desc, icon, color }: { title: string, desc: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="p-8 bg-white/40 backdrop-blur-lg rounded-[2rem] border border-white/60 shadow-sm hover:shadow-md transition-shadow">
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 bg-white shadow-sm"
        style={{ color: color }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 font-['Montserrat']">{title}</h3>
      <p className="text-gray-600 leading-relaxed font-['Lato']">{desc}</p>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}

function NegativeListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-gray-500">
      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-300 flex-shrink-0" />
      <span>{text}</span>
    </li>
  );
}
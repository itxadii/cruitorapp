import { motion } from 'framer-motion';
import { ShieldCheck, Lock, MailCheck } from 'lucide-react';

export default function TrustSection() {
  const trustItems = [
    {
      icon: <Lock size={24} />,
      title: "Google OAuth Secure",
      desc: "Connects securely via official Google APIs. We never see or store your Gmail password.",
      accent: "#8e3afc" // Purple
    },
    {
      icon: <ShieldCheck size={24} />,
      title: "100% Your Control",
      desc: "You review every draft. Absolutely zero automated blasts or unexpected emails sent on your behalf.",
      accent: "#00A884" // Green
    },
    {
      icon: <MailCheck size={24} />,
      title: "Verified & Spam-Free",
      desc: "We rigorously ping and verify every HR email to protect your sender reputation and avoid bounces.",
      accent: "#4285F4" // Blue
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-12 relative z-10">
      <div className="text-center mb-10">
        <h3 className="text-xl font-['Montserrat'] uppercase tracking-[0.2em] text-gray-400">
          Security
        </h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {trustItems.map((item, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.5 }}
            className="flex flex-col items-start text-left p-8 bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
          >
            {/* Spotlight Hover */}
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
              style={{ backgroundColor: item.accent }}
            />

            {/* Icon Dock */}
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
               <div className="absolute inset-0 rounded-xl blur-sm opacity-10 group-hover:opacity-30 transition-opacity" style={{ backgroundColor: item.accent }} />
               <div className="relative z-10" style={{ color: item.accent }}>
                 {item.icon}
               </div>
            </div>
            
            <h4 className="font-['Lato'] text-lg font-bold text-gray-800 mb-2">
              {item.title}
            </h4>
            
            <p className="font-['Lato'] text-sm text-gray-500 leading-relaxed font-medium">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
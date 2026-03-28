import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget; 
    const formData = new FormData(form);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        alert("Message sent! We'll get back to you shortly.");
        form.reset(); 
      } else {
        alert("Something went wrong. Please try again.");
        console.error("Web3Forms Error:", data);
      }
    } catch (error) {
      alert("Network error. Please check your connection and try again.");
      console.error("Submission Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <main className="relative pt-24 pb-24 px-6 max-w-7xl mx-auto z-10 min-h-[calc(100vh-88px)] flex items-center">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-[#8e3afc]/10 blur-[120px] rounded-full pointer-events-none" />
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10"
      >
        
        {/* --- LEFT SIDE: Contact Info --- */}
        <motion.div variants={itemVariants} className="flex flex-col justify-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8e3afc]/10 text-[#8e3afc] font-bold text-sm mb-6 border border-[#8e3afc]/20 w-fit">
            <MessageSquare size={16} />
            <span>Support & Sales</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 font-['Lato'] tracking-tight">
            Get in <span className="text-transparent bg-clip-text bg-linear-to-r from-[#8e3afc] to-[#BDA6CE]">touch.</span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-12 font-['Lato'] leading-relaxed max-w-md">
            Have a question about Cruitor, need custom enterprise pricing, or just want to say hi? Drop us a message and our team will get back to you within 24 hours.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-5 p-6 bg-white/40 backdrop-blur-md rounded-[1.5rem] border border-white/60 shadow-sm hover:bg-white/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-[#8e3afc]">
                <Mail size={24} />
              </div>
              <div className="mt-1">
                <h3 className="text-lg font-bold text-gray-900 font-['Montserrat']">Email Us</h3>
                <p className="text-gray-600 mt-1 font-['Lato']">adityawaghmarex@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-5 p-6 bg-white/40 backdrop-blur-md rounded-[1.5rem] border border-white/60 shadow-sm hover:bg-white/60 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 text-[#00A4EF]">
                <MapPin size={24} />
              </div>
              <div className="mt-1">
                <h3 className="text-lg font-bold text-gray-900 font-['Montserrat']">Headquarters</h3>
                <p className="text-gray-600 mt-1 font-['Lato'] leading-relaxed">Nashik, Maharashtra<br/>India</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: Contact Form --- */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/60 backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5" action="https://api.web3forms.com/submit" method="POST">
  
              {/* Required for Web3Forms */}
              <input type="hidden" name="access_key" value="5d77f57d-686e-4226-ba4e-e7dccd2362c8" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="firstName" className="text-sm font-bold text-gray-700 font-['Lato']">First Name</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    name="first_name" 
                    required
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 focus:border-[#8e3afc] transition-all placeholder:text-gray-400 font-['Lato'] font-medium"
                    placeholder="John"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="lastName" className="text-sm font-bold text-gray-700 font-['Lato']">Last Name</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    name="last_name" 
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 focus:border-[#8e3afc] transition-all placeholder:text-gray-400 font-['Lato'] font-medium"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-bold text-gray-700 font-['Lato']">Work Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 focus:border-[#8e3afc] transition-all placeholder:text-gray-400 font-['Lato'] font-medium"
                    placeholder="john@company.com"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-bold text-gray-700 font-['Lato']">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone" 
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 focus:border-[#8e3afc] transition-all placeholder:text-gray-400 font-['Lato'] font-medium"
                    placeholder="+91 0000000000"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-bold text-gray-700 font-['Lato']">Message</label>
                <textarea 
                  id="message" 
                  name="message" 
                  required
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-2xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8e3afc]/20 focus:border-[#8e3afc] transition-all placeholder:text-gray-400 font-['Lato'] font-medium resize-none leading-relaxed"
                  placeholder="How can we help you?"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="cursor-pointer group w-full mt-4 flex items-center justify-center gap-2 px-8 py-4 bg-[#8e3afc] text-white rounded-2xl font-bold font-['Lato'] text-lg hover:bg-[#7a2edb] hover:-translate-y-0.5 transition-all shadow-xl shadow-[#8e3afc]/25 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending Message...' : 'Send Message'}
                {!isSubmitting && <Send size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />}
              </button>

            </form>
          </div>
        </motion.div>

      </motion.div>
    </main>
  );
}
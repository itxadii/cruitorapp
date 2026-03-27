import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: ReactNode;
  accent: string;
}

export default function FeatureCard({ title, desc, icon, accent }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="relative p-8 bg-white/50 backdrop-blur-2xl rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] transition-all duration-500 group overflow-hidden text-left"
    >
      {/* 1. Dynamic Internal Spotlight */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: accent }}
      />

      {/* 2. Giant Animated Watermark Icon */}
      <div
        className="absolute -bottom-8 -right-8 opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none flex items-center justify-center w-48 h-48 group-hover:scale-110 group-hover:-rotate-12"
        style={{ color: accent }}
      >
        <div className="scale-[5]"> {/* Blows up the standard icon to massive size */}
          {icon}
        </div>
      </div>

      {/* 3. Elevated Icon Dock */}
      <div
        className="relative z-10 mb-8 w-16 h-16 flex items-center justify-center rounded-2xl bg-white shadow-md border border-gray-100 group-hover:-translate-y-2 transition-transform duration-500"
      >
        {/* Subtle under-glow for the icon */}
        <div 
          className="absolute inset-0 rounded-2xl blur-md opacity-20 group-hover:opacity-40 transition-opacity" 
          style={{ backgroundColor: accent }} 
        />
        <div className="relative z-10" style={{ color: accent }}>
          {icon}
        </div>
      </div>

      {/* 4. Left-Aligned Content */}
      <h3 className="font-['Lato'] relative z-10 text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-700 transition-colors duration-300">
        {title}
      </h3>

      <p className="font-['Lato'] relative z-10 text-gray-500 font-medium leading-relaxed">
        {desc}
      </p>
    </motion.div>
  );
}
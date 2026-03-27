import { motion } from 'framer-motion';

export default function ConnectionGraphic() {
  const nodes = [
    { name: 'Google', image: '/google.png', color: '#8f8f8f', top: '15%', left: '20%', delay: 0 },
    { name: 'Amazon', image: '/amazon.png', color: '#8f8f8f', top: '22%', left: '80%', delay: 0.5 },
    { name: 'IBM', image: '/ibm.png', color: '#8f8f8f', top: '65%', left: '88%', delay: 1 },
    { name: 'Samsung', image: '/samsung.png', color: '#8f8f8f', top: '88%', left: '50%', delay: 0.8 },
    { name: 'Intel', image: '/intel.png', color: '#8f8f8f', top: '62%', left: '12%', delay: 1.5 },
  ];

  return (
    // FIX: Removed "hidden sm:block" so it shows on mobile. Adjusted mobile height to 250px.
    <div className="relative w-full max-w-4xl h-62.5 sm:h-100 mx-auto mb-20 z-0">
      
      {/* Background SVG for the connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        {nodes.map((node, i) => (
          <motion.line
            key={`line-${i}`}
            x1="50%"
            y1="50%"
            x2={node.left}
            y2={node.top}
            stroke={node.color}
            strokeWidth="2"
            strokeOpacity="0.3"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, delay: node.delay }}
            strokeDasharray="4 4" 
          />
        ))}
      </svg>

      {/* Center Cruitor Node */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full shadow-2xl border-4 border-[#8f8f8f] flex items-center justify-center relative">
          
          {/* Subtle pulse ring behind center node (Needs to be outside the hidden overflow) */}
          <div className="absolute inset-0 rounded-full border-4 border-[#7d3ff0] animate-ping opacity-20"></div>
          
          {/* NEW: Inner "Cookie Cutter" container to chop off the square corners */}
          <div className="w-full h-full rounded-full overflow-hidden relative z-10">
            <img 
              src="/cruitor.png" 
              alt="Cruitor Logo" 
              // Using object-cover to make sure it fills the whole circle edge-to-edge
              className="w-full h-full object-cover" 
            />
          </div>

        </div>
      </motion.div>

      {/* Orbiting Company Nodes */}
      {nodes.map((node, i) => (
        <motion.div
          key={node.name}
          className="absolute z-10 flex flex-col items-center"
          style={{ top: node.top, left: node.left, x: '-50%', y: '-50%' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: node.delay + 0.5 }}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, delay: i * 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            {/* BIGGER LOGOS ON DESKTOP, SMALLER ON MOBILE: w-14 on mobile, w-28 on desktop */}
            <div 
              className="w-14 h-14 sm:w-28 sm:h-28 bg-white rounded-full shadow-lg border-6 flex items-center justify-center overflow-hidden p-2.5 sm:p-4"
              style={{ borderColor: `${node.color}40` }}
            >
              <img 
                src={node.image} 
                alt={`${node.name} logo`} 
                className="w-full h-full object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
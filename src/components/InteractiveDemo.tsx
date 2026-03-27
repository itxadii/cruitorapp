import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InteractiveDemo() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);
    const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults([]);
    
    // Simulate a network request
    setTimeout(() => {
      setIsSearching(false);
      const domain = query.toLowerCase().replace(/\s+/g, '');
      setResults([
        `careers@${domain}.com`,
        `hr-team@${domain}.com`
      ]);
    }, 1500);
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-16 relative z-20">
      {/* Decorative Browser Window Look */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl rounded-3xl overflow-hidden">
        
        {/* Browser Header */}
        <div className="bg-gray-100/50 border-b border-gray-200/50 px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <div className="w-3 h-3 rounded-full bg-amber-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span className="ml-4 text-xs font-medium text-gray-400 font-mono">Demo</span>
        </div>

        <div className="p-6 md:p-10">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a company (e.g., Netflix)"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all text-gray-700 font-medium"
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching || !query}
              className="cursor-pointer px-8 py-4 bg-[#8e3afc] text-white rounded-2xl font-bold shadow-lg shadow-[#8e3afc]/30 hover:bg-[#7a2edb] transition-all disabled:opacity-70 disabled:hover:bg-[#8e3afc] flex items-center justify-center gap-2 min-w-[140px]"
            >
              {isSearching ? <Loader2 className="font-['Lato'] animate-spin" size={20} /> : 'Find Emails'}
            </button>
          </form>

          {/* Results Area */}
          <div className="mt-6 min-h-[120px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              {results.length > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {results.map((email, idx) => (
                    <motion.div 
                      key={email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="flex items-center justify-between p-4 bg-green-50 border border-green-100 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <Mail className="text-green-600" size={18} />
                        <span className="font-semibold text-gray-700">{email}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-green-600 uppercase tracking-wider bg-green-200/50 px-3 py-1 rounded-full">
                        Verified
                      </span>
                    </motion.div>
                  ))}
                  <div className="pt-2 text-center">
                    <button onClick={() => navigate('/login')} className="mt-4">
                       <span className="text-sm text-gray-500 font-medium flex items-center justify-center gap-1">
                         Ready to email them? <ArrowRight size={14} className="text-[#8e3afc]" />
                       </span>
                    </button>
                  </div>
                </motion.div>
              ) : !isSearching && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-gray-400 flex flex-col items-center gap-2"
                >
                  <Search size={32} className="opacity-20" />
                  <p className="text-sm font-medium">Try searching for a company above to see it in action.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
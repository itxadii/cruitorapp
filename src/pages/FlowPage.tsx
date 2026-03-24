import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthenticator } from '@aws-amplify/ui-react';

export default function FlowPage() {
  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const [company, setCompany] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    // TODO: Call your Amplify Lambda (emailDiscovery) here
    console.log("Searching for:", company);
  };

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-white text-2xl font-bold">Cruitor <span className="text-sky-400">Dashboard</span></h2>
          <button onClick={signOut} className="text-white/60 hover:text-white transition-colors">Logout</button>
        </div>

        {/* The Search Component (Moved from Home) */}
        <motion.section
          className="rounded-3xl bg-white/5 p-10 shadow-2xl border border-white/10 backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Discovery Engine</h1>
            <p className="text-white/60">Find and message HR teams at your target companies.</p>
          </div>

          <form onSubmit={handleSearch} className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name (e.g. Google, Tesla)"
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-6 py-4 text-white outline-none focus:ring-2 focus:ring-sky-500/50 transition-all"
            />
            <button className="rounded-2xl bg-sky-500 px-8 py-4 font-bold text-slate-900 hover:bg-sky-400 transition-colors">
              {isSearching ? 'Searching...' : 'Find Emails'}
            </button>
          </form>
          
          {/* Results Area (Where the Lambda response will go) */}
          <div className="mt-10 min-h-[200px] border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/30">
            Search results will appear here...
          </div>
        </motion.section>
      </div>
    </div>
  );
}
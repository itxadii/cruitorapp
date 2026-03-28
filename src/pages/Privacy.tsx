import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Database, 
  Activity, 
  Mail, 
  Lock, 
  Share2, 
  Sliders, 
  Clock, 
  ExternalLink, 
  UserMinus, 
  RefreshCcw, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';

export function Privacy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <main className="relative pt-24 pb-24 px-6 max-w-4xl mx-auto z-10">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-150 bg-[#8e3afc]/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 space-y-8"
      >
        
        {/* --- Header Section --- */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-gray-200 text-gray-600 font-bold text-xs uppercase tracking-widest mb-6 font-['Lato'] shadow-sm">
            <ShieldCheck size={16} className="text-[#8e3afc]" />
            <span>Legal & Privacy</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 font-['Lato'] tracking-tight">
            Privacy Policy
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-bold text-gray-500 font-['Lato']">
            <span>Effective Date: 28 March 2026</span>
            <span className="hidden sm:block text-gray-300">•</span>
            <span>Last Updated: 28 March 2026</span>
          </div>
          <p className="mt-8 text-lg text-gray-600 font-['Lato'] max-w-2xl mx-auto">
            Welcome to <span className="font-bold text-gray-900">Cruitor.com</span> (“we”, “our”, “us”). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our platform.
          </p>
        </motion.div>

        {/* --- Document Container --- */}
        <motion.div variants={itemVariants} className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 md:p-12 space-y-12">

          {/* 1. Information We Collect */}
          <section>
            <SectionHeader icon={<Database />} title="1. Information We Collect" />
            
            <div className="space-y-8 pl-0 md:pl-11 mt-6">
              <div>
                <h4 className="text-lg font-bold text-gray-900 font-['Lato'] mb-3">a. Account Information</h4>
                <p className="text-gray-600 font-['Lato'] mb-3">When you sign in using AWS Cognito, we may collect:</p>
                <ul className="space-y-2">
                  <ListItem text="Name" />
                  <ListItem text="Email address" />
                  <ListItem text="User ID" />
                </ul>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 font-['Lato'] mb-3">b. Google Account Information (Gmail Integration)</h4>
                <p className="text-gray-600 font-['Lato'] mb-4">If you choose to connect your Gmail account, we request access via Google OAuth.</p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-green-50/50 border border-green-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-green-700 font-bold font-['Lato'] mb-3">
                      <CheckCircle2 size={18} /> We ONLY access:
                    </div>
                    <p className="text-sm text-green-800 font-['Lato']">Permission to send emails on your behalf (<code className="bg-green-100 px-1.5 py-0.5 rounded text-green-900">gmail.send</code> scope)</p>
                  </div>
                  
                  <div className="p-5 bg-red-50/50 border border-red-100 rounded-2xl">
                    <div className="flex items-center gap-2 text-red-600 font-bold font-['Lato'] mb-3">
                      <XCircle size={18} /> We do NOT:
                    </div>
                    <ul className="space-y-2">
                      <NegativeListItem text="Read your inbox" />
                      <NegativeListItem text="Access your contacts" />
                      <NegativeListItem text="Store your Gmail password" />
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-bold text-gray-900 font-['Lato'] mb-3">c. Usage Data</h4>
                <p className="text-gray-600 font-['Lato'] mb-3">We may collect basic usage data such as:</p>
                <ul className="space-y-2 mb-3">
                  <ListItem text="Search queries (company names)" />
                  <ListItem text="Feature usage" />
                  <ListItem text="Timestamps of actions" />
                </ul>
                <p className="text-sm text-gray-500 font-['Lato'] italic">This helps us improve the product.</p>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 2. How We Use Your Information */}
          <section>
            <SectionHeader icon={<Activity />} title="2. How We Use Your Information" />
            <div className="pl-0 md:pl-11 mt-4">
              <p className="text-gray-600 font-['Lato'] mb-4">We use your information to:</p>
              <ul className="space-y-3">
                <ListItem text="Provide core functionality (email discovery and sending)" />
                <ListItem text="Authenticate users securely" />
                <ListItem text="Improve system performance and features" />
                <ListItem text="Prevent abuse and misuse" />
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 3. Email Sending */}
          <section>
            <SectionHeader icon={<Mail />} title="3. Email Sending" />
            <div className="pl-0 md:pl-11 mt-4">
              <p className="text-gray-600 font-['Lato'] mb-4">When you send emails through Cruitor:</p>
              <ul className="space-y-3">
                <ListItem text="Emails are sent directly using your connected Gmail account" />
                <ListItem text="You review and approve every email before sending" />
                <ListItem text="We do not send emails automatically without your action" />
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 4. Data Storage & Security */}
          <section>
            <SectionHeader icon={<Lock />} title="4. Data Storage & Security" />
            <div className="pl-0 md:pl-11 mt-4">
              <p className="text-gray-600 font-['Lato'] mb-4">We take security seriously.</p>
              <ul className="space-y-3">
                <ListItem text="OAuth tokens are stored securely and encrypted" />
                <ListItem text="We never store your Gmail password" />
                <ListItem text="We use industry-standard security practices" />
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 5. Data Sharing */}
          <section>
            <SectionHeader icon={<Share2 />} title="5. Data Sharing" />
            <div className="pl-0 md:pl-11 mt-4">
              <p className="text-gray-900 font-bold font-['Lato'] mb-4">We do not sell or rent your personal data.</p>
              <p className="text-gray-600 font-['Lato'] mb-4">We only use third-party services necessary for operation, such as:</p>
              <ul className="space-y-3 mb-4">
                <ListItem text="Google (Gmail API)" />
                <ListItem text="AWS (Cognito, Lambda, storage)" />
              </ul>
              <p className="text-sm text-gray-500 font-['Lato'] italic">These services process data strictly for functionality.</p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 6. User Control */}
          <section>
            <SectionHeader icon={<Sliders />} title="6. User Control" />
            <div className="pl-0 md:pl-11 mt-4">
              <p className="text-gray-600 font-['Lato'] mb-4">You have full control over your data:</p>
              <ul className="space-y-3">
                <ListItem text="You can disconnect your Gmail account at any time" />
                <ListItem text="You can stop using the service anytime" />
                <ListItem text="You can request deletion of your data" />
              </ul>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Smaller Sections Grid */}
          <div className="grid md:grid-cols-2 gap-8 pt-4">
            <section>
              <SectionHeader icon={<Clock />} title="7. Data Retention" />
              <div className="pl-0 md:pl-11 mt-4">
                <p className="text-gray-600 font-['Lato'] mb-3">We retain data only as long as necessary to:</p>
                <ul className="space-y-2">
                  <ListItem text="Provide services" />
                  <ListItem text="Comply with legal obligations" />
                </ul>
              </div>
            </section>

            <section>
              <SectionHeader icon={<ExternalLink />} title="8. Third-Party Links" />
              <div className="pl-0 md:pl-11 mt-4">
                <p className="text-gray-600 font-['Lato'] leading-relaxed">
                  Our platform may contain links to third-party websites. We are not responsible for their privacy practices.
                </p>
              </div>
            </section>

            <section>
              <SectionHeader icon={<UserMinus />} title="9. Children’s Privacy" />
              <div className="pl-0 md:pl-11 mt-4">
                <p className="text-gray-600 font-['Lato'] leading-relaxed">
                  Cruitor is not intended for users under the age of 13. We do not knowingly collect data from children.
                </p>
              </div>
            </section>

            <section>
              <SectionHeader icon={<RefreshCcw />} title="10. Changes to Policy" />
              <div className="pl-0 md:pl-11 mt-4">
                <p className="text-gray-600 font-['Lato'] leading-relaxed">
                  We may update this Privacy Policy from time to time. Changes will be reflected with an updated date at the top of this page.
                </p>
              </div>
            </section>
          </div>

        </motion.div>

        {/* --- Final Note & Contact CTA --- */}
        <motion.div variants={itemVariants} className="mt-12 bg-[#0a0a0a] rounded-[2.5rem] p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8e3afc]/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl font-black font-['Lato'] text-white mb-4">
              11. Contact Us & Final Note
            </h2>
            <p className="text-gray-400 font-['Lato'] mb-8 max-w-2xl mx-auto leading-relaxed">
              Cruitor is built with a focus on user control, transparency, and security. We only access what is necessary to provide the service — nothing more. If you have any questions about this Privacy Policy, please reach out.
            </p>
            
            <Link 
              to="/contact" 
              className="inline-flex items-center gap-3 px-8 py-4 bg-[#8e3afc] text-white rounded-2xl font-bold font-['Lato'] shadow-lg shadow-[#8e3afc]/25 hover:bg-[#7a2edb] hover:-translate-y-1 transition-all duration-300"
            >
              <MessageSquare size={18} /> Contact Support <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>

      </motion.div>
    </main>
  );
}

// --- Helper Components ---

function SectionHeader({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[#8e3afc] shrink-0 shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-black text-gray-900 font-['Lato']">
        {title}
      </h3>
    </div>
  );
}

function ListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-700 font-['Lato'] font-medium">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#8e3afc] shrink-0" />
      <span>{text}</span>
    </li>
  );
}

function NegativeListItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm text-red-800 font-['Lato'] font-medium">
      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
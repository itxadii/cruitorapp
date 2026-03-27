import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth';
import { Copy, Mail, LoaderCircle, CheckCircle2, Send, FileText, ExternalLink, Search, UploadCloud } from 'lucide-react';
import { searchCompanyEmails } from '../api/searchApi'; 
import type { Schema } from '../../amplify/data/resource'; 

const client = generateClient<Schema>();

const TEMPLATES = [
  {
    id: 'general',
    name: 'Cold Outreach',
    subject: (comp: string) => `Exploring Opportunities at ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,

I came across ${comp} and was genuinely impressed by the work your team is doing. I'm a software engineer with hands-on experience building and shipping production systems, and I'd love to explore if there's a fit.

I've attached my resume for your reference. Even if there's no immediate opening, I'd appreciate being kept in mind for future roles.

Thank you for your time.

Best regards,
${name}`
  },
  {
    id: 'specific_role',
    name: 'Role-Specific',
    subject: (comp: string) => `Application: Software Engineer at ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,

I'm reaching out regarding engineering opportunities at ${comp}. I'm a developer with experience across the full stack — from building REST APIs and cloud infrastructure to shipping user-facing products.

I thrive in fast-moving environments where ownership and impact matter. I'd welcome the chance to learn more about your team's current needs.

My resume is attached. Happy to connect at your convenience.

Best,
${name}`
  },
  {
    id: 'startup',
    name: 'Startup',
    subject: (comp: string) => `Engineer Who Ships — Interested in ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi ${comp} Team,

I build things and ship them. I've taken projects from zero to production — handling architecture decisions, debugging production fires, and iterating fast based on real feedback.

I'm not looking for a job description to fit into. I'm looking for a team where I can contribute meaningfully from day one. ${comp} feels like that place.

Resume attached. Would love a quick chat if you're open to it.

Thanks,
${name}`
  },
  {
    id: 'fresher',
    name: 'Fresher',
    subject: (comp: string) => `Fresher Engineer — Keen to Grow with ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,

I'm a recent Computer Science graduate actively looking for my first professional engineering role. While I'm early in my career, I've spent the past year building real projects — working with cloud infrastructure, APIs, and modern web stacks outside of coursework.

I'm a fast learner who takes ownership seriously, and I'm genuinely excited about the work ${comp} does.

I've attached my resume. I'd be grateful for any opportunity to be considered, even for internship or junior positions.

Thank you,
${name}`
  },
  {
    id: 'follow_up',
    name: 'Follow-Up',
    subject: (comp: string) => `Following Up — Interest in ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,

I wanted to follow up on my earlier message regarding opportunities at ${comp}. I understand you receive a high volume of outreach, so I'll keep this brief.

I remain very interested in joining your team and am confident I can add value quickly. My resume is attached again for easy reference.

If there's a better time or person to reach out to, I'm happy to redirect.

Thanks again for your time.

Best,
${name}`
  }
];

export default function FlowPage() {
  const { } = useAuthenticator((context) => [context.user]);
  
  const [company, setCompany] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const [isGmailConnected, setIsGmailConnected] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const [customSubject, setCustomSubject] = useState('');
  const [customBody, setCustomBody] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<Set<string>>(new Set());
  const [userName, setUserName] = useState('');

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    const name = userName || '[Your Name]';
    setCustomSubject(selectedTemplate.subject(company || '[Company]'));
    setCustomBody(selectedTemplate.body(company || '[Company]').replace(/\[Your Name\]/g, name));
  }, [selectedTemplate, company, userName]);

  useEffect(() => {
    async function checkGmailConnection() {
      try {
        const { data: credentials } = await client.models.UserCredentials.list({ authMode: 'userPool' });
        const connected = credentials.find(cred => cred?.isConnected);
        if (connected) {
          setIsGmailConnected(true);
          const fullName = [connected.firstName, connected.lastName].filter(Boolean).join(' ');
          setUserName(fullName || '');
        }
      } catch (error) { console.error(error); } finally { setIsDbLoading(false); }
    }
    checkGmailConnection();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) return;
    setIsSearching(true);
    setEmails([]);
    try {
      const results = await searchCompanyEmails(company);
      setEmails(results);
    } catch (error) {
      console.error(error);
      alert("Search timed out.");
    } finally { setIsSearching(false); }
  };

  const handleSendEmail = async (targetEmail: string) => {
    if (!isGmailConnected) return alert("Please connect Gmail first!");
    setSendingTo(targetEmail);
    try {
      const user = await getCurrentUser();
      let attachmentData = null;
      if (resume) {
        attachmentData = {
          filename: resume.name,
          base64: await readFileAsBase64(resume),
          contentType: resume.type
        };
      }
      const response = await fetch('https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          emails: [targetEmail],
          subject: customSubject,
          messageBody: customBody,
          attachment: attachmentData
        }),
      });
      if (!response.ok) throw new Error();
      setSentEmails(prev => new Set(prev).add(targetEmail));
    } catch (error) { alert("Failed to send email."); } 
    finally { setSendingTo(null); }
  };

  const handleBulkSend = async () => {
    if (!resume) return alert("Please attach your resume first!");
    if (emails.length === 0) return alert("No emails to send to!");
    setIsBulkSending(true);

    try {
      const user = await getCurrentUser();
      const base64Resume = await readFileAsBase64(resume);

      const response = await fetch('https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          emails: emails,
          subject: customSubject,
          messageBody: customBody,
          attachment: {
            filename: resume.name,
            base64: base64Resume,
            contentType: resume.type
          }
        }),
      });
      if (!response.ok) throw new Error();
      emails.forEach(email => setSentEmails(prev => new Set(prev).add(email)));
    } catch (error) { alert("Error sending campaign."); } 
    finally { setIsBulkSending(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };

  const handleConnectGmail = () => {
    const clientId = '266505653498-lrvoud93881fotn8h50aijglgec85i06.apps.googleusercontent.com'; 
    const redirectUri = `${window.location.origin}/auth/callback`; 
    const scope = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email';
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  };

  const openMailClient = (email: string) => {
    const subject = encodeURIComponent(customSubject);
    const body = encodeURIComponent(customBody);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
    navigator.clipboard.writeText(customBody);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Gmail Connect Banner --- */}
        {!isDbLoading && !isGmailConnected && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mb-8 px-8 py-5 bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.06)] gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#8e3afc]/10 rounded-2xl flex items-center justify-center text-[#8e3afc]">
                <Mail size={24} />
              </div>
              <div>
                <p className="font-bold text-gray-900 font-['Montserrat'] text-lg">Unlock One-Click Apply</p>
                <p className="text-sm text-gray-600 font-['Lato'] mt-0.5">Connect your Gmail to send personalized outreach directly from this dashboard.</p>
              </div>
            </div>
            <button onClick={handleConnectGmail} className="cursor-pointer w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white rounded-2xl font-bold font-['Montserrat'] shadow-lg hover:bg-gray-800 hover:-translate-y-0.5 transition-all">
              Connect Gmail
            </button>
          </motion.div>
        )}

        {/* --- Main Workspace Grid --- */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Scout Engine (Search & Results) */}
          <section className="lg:col-span-5 flex flex-col h-[75vh] min-h-[600px] bg-white/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-black text-gray-900 mb-6 font-['Lato']">Scout Engine</h2>
            
            <form onSubmit={handleSearch} className="flex flex-col gap-3 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  value={company} 
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Target Company (e.g. Netflix)"
                  className="w-full bg-white/80 border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all font-medium text-gray-900 font-['Lato']"
                />
              </div>
              <button disabled={isSearching} className="cursor-pointer border-1 border-black w-full bg-[#8e3afc] text-white px-6 py-4 rounded-2xl font-bold font-['Lato'] shadow-lg shadow-[#8e3afc]/25 hover:bg-[#7a2edb] transition-all disabled:opacity-70 flex items-center justify-center gap-2">
                {isSearching ? <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><LoaderCircle size={18}/></motion.div>Finding Emails Online...</> : 'Find Company Emails'}
              </button>
            </form>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence mode="wait">
                {emails.length > 0 ? (
                  emails.map((email, index) => (
                    <motion.div 
                      key={email} 
                      initial={{ opacity: 0, y: 10 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: index * 0.05 }} 
                      className="bg-white/80 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#8e3afc]/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-gray-900 font-bold font-['Lato'] truncate">{email}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 size={12} className="text-green-500" />
                          <span className="text-green-600 text-[10px] font-bold uppercase tracking-widest">Verified</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => { navigator.clipboard.writeText(email); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2000); }} 
                          className="p-2.5 text-gray-400 hover:text-[#8e3afc] hover:bg-[#8e3afc]/10 rounded-xl transition-colors"
                          title="Copy Email"
                        >
                          {copiedIndex === index ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                        
                        {isGmailConnected ? (
                          <button 
                            onClick={() => handleSendEmail(email)}
                            disabled={sendingTo === email || sentEmails.has(email)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-100 font-['Lato']
                              ${sentEmails.has(email) 
                                ? 'bg-green-50 text-green-600 border border-green-200 cursor-default' 
                                : 'bg-[#8e3afc]/10 text-[#8e3afc] hover:bg-[#8e3afc] hover:text-white'
                              }`}
                          >
                            {sendingTo === email ? 'Sending...' : sentEmails.has(email) ? 'Sent' : 'Send'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => openMailClient(email)} 
                            className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
                            title="Open in Gmail App"
                          >
                            <ExternalLink size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : !isSearching && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center px-4">
                    <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4 text-gray-300">
                      <Search size={32} />
                    </div>
                    <p className="text-gray-500 font-['Lato'] font-medium">Results will appear here...</p>
                    <p className="text-sm text-gray-400 mt-2">Enter a company name to start scouting.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* RIGHT COLUMN: Campaign Builder */}
          <section className="lg:col-span-7 flex flex-col h-[75vh] min-h-[600px]">
            
            {/* Templates Selector */}
            <div className="mb-6">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Select Template</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar hide-scroll-on-mobile">
                {TEMPLATES.map((t) => (
                  <button 
                    key={t.id} 
                    onClick={() => setSelectedTemplate(t)} 
                    className={`cursor-pointer border-black border-1shrink-0 px-5 py-2.5 rounded-full border transition-all text-sm font-bold font-['Lato']
                      ${selectedTemplate.id === t.id 
                        ? 'bg-[#8e3afc] border-[#8e3afc] text-white shadow-md shadow-[#8e3afc]/20' 
                        : 'bg-white/50 border-white/80 text-gray-600 hover:bg-white hover:border-gray-200'
                      }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Box */}
            <div className="flex-1 bg-white/50 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
              <h3 className="text-2xl font-black text-gray-900 mb-6 font-['Lato']">Compose Campaign</h3>
              
              <div className="flex flex-col gap-5 flex-1">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Subject Line</label>
                  <input 
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    className="w-full mt-1.5 bg-white/80 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all text-gray-900 font-medium font-['Lato']"
                  />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Message Body</label>
                  <textarea 
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="w-full mt-1.5 flex-1 bg-white/80 border border-gray-200 rounded-xl px-4 py-4 outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all text-gray-700 font-medium font-['Lato'] resize-none leading-relaxed"
                  />
                </div>

                {/* File Upload Dropzone */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">Attachment (Resume)</label>
                  <label className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all bg-white/40
                    ${resume ? 'border-[#8e3afc] bg-[#8e3afc]/5' : 'border-gray-300 hover:border-[#8e3afc]/50 hover:bg-white/80'}`}>
                    
                    {resume ? (
                      <div className="flex items-center gap-3 text-[#8e3afc]">
                        <FileText size={24} />
                        <span className="font-bold font-['Lato']">{resume.name}</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <UploadCloud size={28} className="text-gray-400" />
                        <span className="font-bold font-['Lato'] text-sm">Click to upload PDF or Word doc</span>
                      </div>
                    )}
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>

                {/* Bulk Send Button */}
                {isGmailConnected && emails.length > 0 && (
                  <button 
                    onClick={handleBulkSend}
                    disabled={isBulkSending}
                    className="w-full py-4 mt-2 bg-gray-900 text-white rounded-2xl font-black font-['Montserrat'] shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:bg-gray-900"
                  >
                    {isBulkSending ? (
                      <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}><LoaderCircle size={20} /></motion.div> Sending Campaign...</>
                    ) : (
                      <><Send size={20} /> Send to All ({emails.length} Contacts)</>
                    )}
                  </button>
                )}
              </div>
            </div>

          </section>
        </div>
      </div>
    </div>
  );
}
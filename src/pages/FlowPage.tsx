import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    body: (comp: string, name: string = '[Your Name]') => `Hi,\n\nI came across ${comp} and was genuinely impressed by the work your team is doing. I'm a software engineer with hands-on experience building and shipping production systems, and I'd love to explore if there's a fit.\n\nI've attached my resume for your reference. Even if there's no immediate opening, I'd appreciate being kept in mind for future roles.\n\nThank you for your time.\n\nBest regards,\n${name}`
  },
  {
    id: 'specific_role',
    name: 'Role-Specific',
    subject: (comp: string) => `Application: Software Engineer at ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,\n\nI'm reaching out regarding engineering opportunities at ${comp}. I'm a developer with experience across the full stack — from building REST APIs and cloud infrastructure to shipping user-facing products.\n\nI thrive in fast-moving environments where ownership and impact matter. I'd welcome the chance to learn more about your team's current needs.\n\nMy resume is attached. Happy to connect at your convenience.\n\nBest,\n${name}`
  },
  {
    id: 'startup',
    name: 'Startup',
    subject: (comp: string) => `Engineer Who Ships — Interested in ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi ${comp} Team,\n\nI build things and ship them. I've taken projects from zero to production — handling architecture decisions, debugging production fires, and iterating fast based on real feedback.\n\nI'm not looking for a job description to fit into. I'm looking for a team where I can contribute meaningfully from day one. ${comp} feels like that place.\n\nResume attached. Would love a quick chat if you're open to it.\n\nThanks,\n${name}`
  },
  {
    id: 'fresher',
    name: 'Fresher',
    subject: (comp: string) => `Fresher Engineer — Keen to Grow with ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,\n\nI'm a recent Computer Science graduate actively looking for my first professional engineering role. While I'm early in my career, I've spent the past year building real projects — working with cloud infrastructure, APIs, and modern web stacks outside of coursework.\n\nI'm a fast learner who takes ownership seriously, and I'm genuinely excited about the work ${comp} does.\n\nI've attached my resume. I'd be grateful for any opportunity to be considered, even for internship or junior positions.\n\nThank you,\n${name}`
  },
  {
    id: 'follow_up',
    name: 'Follow-Up',
    subject: (comp: string) => `Following Up — Interest in ${comp}`,
    body: (comp: string, name: string = '[Your Name]') => `Hi,\n\nI wanted to follow up on my earlier message regarding opportunities at ${comp}. I understand you receive a high volume of outreach, so I'll keep this brief.\n\nI remain very interested in joining your team and am confident I can add value quickly. My resume is attached again for easy reference.\n\nIf there's a better time or person to reach out to, I'm happy to redirect.\n\nThanks again for your time.\n\nBest,\n${name}`
  }
];

export default function FlowPage() {
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

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    const name = userName || '[Your Name]';
    setCustomSubject(selectedTemplate.subject(company || '[Company]'));
    setCustomBody(selectedTemplate.body(company || '[Company]', name));
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
      } catch (error) { console.error(error); }
      finally { setIsDbLoading(false); }
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
        attachmentData = { filename: resume.name, base64: await readFileAsBase64(resume), contentType: resume.type };
      }
      const response = await fetch('https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, emails: [targetEmail], subject: customSubject, messageBody: customBody, attachment: attachmentData }),
      });
      if (!response.ok) throw new Error();
      setSentEmails(prev => new Set(prev).add(targetEmail));
    } catch { alert("Failed to send email."); }
    finally { setSendingTo(null); }
  };

  const handleBulkSend = async () => {
    if (!resume) return alert("Please attach your resume first!");
    if (emails.length === 0) return alert("No emails to send to!");
    setIsBulkSending(true);
    try {
      const user = await getCurrentUser();
      const response = await fetch('https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId, emails,
          subject: customSubject, messageBody: customBody,
          attachment: { filename: resume.name, base64: await readFileAsBase64(resume), contentType: resume.type }
        }),
      });
      if (!response.ok) throw new Error();
      emails.forEach(email => setSentEmails(prev => new Set(prev).add(email)));
    } catch { alert("Error sending campaign."); }
    finally { setIsBulkSending(false); }
  };

  const handleConnectGmail = () => {
    const clientId = '266505653498-lrvoud93881fotn8h50aijglgec85i06.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/callback`;
    const scope = 'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email';
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  };

  const openMailClient = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(customBody)}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-[1400px] mx-auto">

        {/* Gmail Connect Banner */}
        {!isDbLoading && !isGmailConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-6 py-5 bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 shrink-0 bg-[#8e3afc]/10 rounded-xl flex items-center justify-center text-[#8e3afc]">
                <Mail size={22} />
              </div>
              <div>
                <p className="font-black text-gray-900 font-['Lato'] text-base">Unlock One-Click Apply</p>
                <p className="text-sm text-gray-500 mt-0.5 font-['Lato']">Connect Gmail to send outreach directly from this dashboard.</p>
              </div>
            </div>
            <button
              onClick={handleConnectGmail}
              className="cursor-pointer w-full sm:w-auto shrink-0 px-7 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold font-['Lato'] hover:bg-gray-800 transition-all"
            >
              Connect Gmail
            </button>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">

          {/* ── Scout Engine ── */}
          <section className="lg:col-span-5 flex flex-col bg-white/50 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-sm">
            
            <h2 className="text-2xl font-black text-gray-900 font-['Lato'] mb-6">Scout Engine</h2>

            <form onSubmit={handleSearch} className="flex flex-col gap-3 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Target Company (e.g. Netflix)"
                  className="w-full bg-white/80 border border-gray-200 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all font-medium text-gray-900 font-['Lato'] text-base"
                />
              </div>
              <button
                disabled={isSearching}
                className="cursor-pointer w-full bg-[#8e3afc] text-white px-6 py-4 rounded-xl font-bold font-['Lato'] text-base shadow-lg shadow-[#8e3afc]/25 hover:bg-[#7a2edb] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSearching ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><LoaderCircle size={18} /></motion.div>Finding Emails...</>
                ) : 'Find Company Emails'}
              </button>
            </form>

            {/* Results */}
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {emails.length > 0 ? (
                  emails.map((email, index) => (
                    <motion.div
                      key={email}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="bg-white/90 p-4 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 hover:border-[#8e3afc]/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-gray-900 font-bold font-['Lato'] text-sm break-all">{email}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                          <span className="text-green-600 text-[10px] font-bold uppercase tracking-wider">Verified</span>
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { navigator.clipboard.writeText(email); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2000); }}
                          className="cursor-pointer p-2.5 text-gray-400 hover:text-[#8e3afc] hover:bg-[#8e3afc]/10 rounded-lg transition-colors"
                          title="Copy"
                        >
                          {copiedIndex === index ? <CheckCircle2 size={17} className="text-green-500" /> : <Copy size={17} />}
                        </button>

                        {isGmailConnected ? (
                          <button
                            onClick={() => handleSendEmail(email)}
                            disabled={sendingTo === email || sentEmails.has(email)}
                            className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold font-['Lato'] transition-all
                              ${sentEmails.has(email)
                                ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
                                : 'bg-[#8e3afc]/10 text-[#8e3afc] hover:bg-[#8e3afc] hover:text-white'
                              }`}
                          >
                            {sendingTo === email
                              ? <><LoaderCircle size={14} className="animate-spin" /> Sending</>
                              : sentEmails.has(email)
                                ? <><CheckCircle2 size={14} /> Sent</>
                                : <><Send size={14} /> Send</>
                            }
                          </button>
                        ) : (
                          <button
                            onClick={() => openMailClient(email)}
                            className="cursor-pointer p-2.5 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                            title="Open in Gmail"
                          >
                            <ExternalLink size={17} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : !isSearching && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-16 flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center mb-4 text-gray-300">
                      <Search size={32} />
                    </div>
                    <p className="text-gray-500 font-['Lato'] font-bold text-base">Ready to scout</p>
                    <p className="text-sm text-gray-400 mt-1 font-['Lato']">Enter a company name above to find HR emails.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* ── Campaign Builder ── */}
          <section className="lg:col-span-7 flex flex-col gap-5">

            {/* Template Pills */}
            <div className="bg-white/50 backdrop-blur-2xl p-5 sm:p-6 rounded-3xl border border-white/80 shadow-sm">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 font-['Lato']">Select Template</h3>
              <div className="flex gap-2 flex-wrap">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`cursor-pointer shrink-0 px-5 py-2.5 rounded-full border text-sm font-bold font-['Lato'] transition-all
                      ${selectedTemplate.id === t.id
                        ? 'bg-[#8e3afc] border-[#8e3afc] text-white shadow-md shadow-[#8e3afc]/20'
                        : 'bg-white/60 border-gray-200 text-gray-600 hover:bg-white hover:border-[#8e3afc]/40 hover:text-[#8e3afc]'
                      }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white/50 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/80 shadow-sm flex flex-col gap-6">
              <h3 className="text-2xl font-black text-gray-900 font-['Lato']">Compose Campaign</h3>

              {/* Subject */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-['Lato']">Subject Line</label>
                <input
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full mt-2 bg-white/80 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all text-gray-900 font-medium font-['Lato'] text-base"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 font-['Lato']">Message Body</label>
                <textarea
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={14}
                  className="w-full mt-2 bg-white/80 border border-gray-200 rounded-xl px-5 py-4 outline-none focus:border-[#8e3afc] focus:ring-2 focus:ring-[#8e3afc]/20 transition-all text-gray-700 font-medium font-['Lato'] text-base resize-none leading-relaxed"
                />
              </div>

              {/* Resume Upload */}
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 mb-2 block font-['Lato']">Attachment (Resume)</label>
                <label className={`cursor-pointer flex items-center justify-center gap-3 w-full p-5 border-2 border-dashed rounded-2xl transition-all
                  ${resume ? 'border-[#8e3afc] bg-[#8e3afc]/5' : 'border-gray-300 hover:border-[#8e3afc]/50 hover:bg-white/80'}`}>
                  {resume ? (
                    <>
                      <FileText size={22} className="text-[#8e3afc] shrink-0" />
                      <span className="font-bold text-[#8e3afc] font-['Lato'] text-base truncate max-w-[240px]">{resume.name}</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={22} className="text-gray-400 shrink-0" />
                      <span className="font-bold text-gray-500 font-['Lato'] text-base">Click to upload PDF or Word doc</span>
                    </>
                  )}
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => e.target.files?.[0] && setResume(e.target.files[0])} />
                </label>
              </div>

              {/* Bulk Send */}
              {isGmailConnected && emails.length > 0 && (
                <button
                  onClick={handleBulkSend}
                  disabled={isBulkSending}
                  className="cursor-pointer w-full py-5 bg-gray-900 text-white rounded-2xl font-black font-['Lato'] text-base shadow-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isBulkSending ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><LoaderCircle size={20} /></motion.div>Sending Campaign...</>
                  ) : (
                    <><Send size={20} />Send to All ({emails.length} Contacts)</>
                  )}
                </button>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from 'aws-amplify/auth'; // FIXED: Added missing import
import { Copy, Mail, Zap, CheckCircle2, Send, FileText, ExternalLink, Paperclip } from 'lucide-react';
import { searchCompanyEmails } from '../api/searchApi'; 
import type { Schema } from '../../amplify/data/resource'; 

const client = generateClient<Schema>();

const TEMPLATES = [
  {
    id: 'general',
    name: 'Standard Outreach',
    subject: (comp: string) => `Inquiry: Potential Openings at ${comp}`,
    body: (comp: string) => `Hi HR Team at ${comp},\n\nI’ve been following your recent growth and would love to discuss how my background in software development could contribute to your mission. I've attached my resume for your review.\n\nBest regards,\n[My Name]`
  },
  {
    id: 'referral',
    name: 'Referral Request',
    subject: (comp: string) => `Connect: Software Engineering at ${comp}`,
    body: (comp: string) => `Hello,\n\nI am reaching out to express my strong interest in ${comp}. I’ve spent the last few months building Cruitor.com and I'm eager to bring that same technical passion to your team...`
  }
];

export default function FlowPage() {
  const { signOut } = useAuthenticator((context) => [context.user]);
  
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

  // Helper: Convert File to Base64
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
    setCustomSubject(selectedTemplate.subject(company || '[Company]'));
    setCustomBody(selectedTemplate.body(company || '[Company]'));
  }, [selectedTemplate, company]);

  useEffect(() => {
    async function checkGmailConnection() {
      try {
        const { data: credentials } = await client.models.UserCredentials.list({ authMode: 'userPool' });
        const hasConnectedAccount = credentials.some(cred => cred?.isConnected);
        if (hasConnectedAccount) setIsGmailConnected(true);
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
      alert(`Sent to ${targetEmail}!`);
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
      alert(`Campaign started! Sent to ${emails.length} contacts.`);
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
    
    // ADDED: &prompt=consent forces Google to give us a refresh_token every time
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  };

  const openMailClient = (email: string) => {
    const subject = encodeURIComponent(customSubject);
    const body = encodeURIComponent(customBody);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
    navigator.clipboard.writeText(customBody);
  };

  return (
    <div className="min-h-screen bg-[#F2EAE0] pt-32 pb-16 px-4 font-roboto">
      <div className="max-w-6xl mx-auto">
        
        {!isDbLoading && !isGmailConnected && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 px-6 py-4 bg-white/40 backdrop-blur-md border border-[#B4D3D9] rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <Mail className="text-[#9B8EC7]" size={20} />
              <div>
                <p className="font-bold text-[#4A4458] text-sm">Unlock One-Click Apply</p>
                <p className="text-xs text-[#4A4458]/70">Connect Gmail to send directly from this dashboard.</p>
              </div>
            </div>
            <button onClick={handleConnectGmail} className="px-6 py-2 bg-[#9B8EC7] text-white rounded-xl font-bold text-sm shadow-md hover:bg-[#BDA6CE] transition-all">
              Connect Gmail
            </button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1fr_360px] gap-6">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-[#9B8EC7]/5 border border-white/50 flex flex-col h-[70vh]">
            <form onSubmit={handleSearch} className="flex gap-3 mb-8">
              <input 
                value={company} 
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Target Company Name (e.g. JP Morgan)"
                className="flex-1 bg-[#F2EAE0]/40 border-2 border-transparent rounded-2xl px-6 py-4 outline-none focus:border-[#9B8EC7] transition-all font-medium text-[#4A4458]"
              />
              <button disabled={isSearching} className="bg-[#9B8EC7] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#8e3afc] transition-all disabled:opacity-50">
                {isSearching ? 'Scouting...' : 'Find HR'}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              <AnimatePresence>
                {emails.length > 0 ? (
                  emails.map((email, index) => (
                    <motion.div key={email} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-[#F2EAE0]/20 p-4 rounded-2xl border border-[#BDA6CE]/20 flex items-center justify-between group hover:border-[#9B8EC7]/50 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[#4A4458] font-bold">{email}</span>
                        <span className="text-[#4A4458]/50 text-[10px] font-bold uppercase tracking-widest mt-1">Verified Contact</span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(email); setCopiedIndex(index); setTimeout(() => setCopiedIndex(null), 2000); }} className="p-2.5 text-[#9B8EC7] hover:bg-white rounded-xl transition-all shadow-sm">
                          {copiedIndex === index ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                        </button>
                        
                        {isGmailConnected ? (
                          <button 
                            onClick={() => handleSendEmail(email)}
                            disabled={sendingTo === email}
                            className="flex items-center gap-2 bg-[#9B8EC7] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-[#8A7DB6] transition-all disabled:opacity-70"
                          >
                            {sendingTo === email ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                                <Zap size={16} />
                              </motion.div>
                            ) : (
                              <Send size={16} /> 
                            )}
                            {sendingTo === email ? 'Sending...' : 'Send Now'}
                          </button>
                        ) : (
                          <button onClick={() => openMailClient(email)} className="bg-[#B4D3D9]/40 text-[#4A4458] p-2.5 rounded-xl hover:bg-[#B4D3D9] transition-all shadow-sm flex items-center gap-2">
                            <ExternalLink size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : !isSearching && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="bg-[#F2EAE0] w-16 h-16 rounded-full flex items-center justify-center mb-4 text-[#BDA6CE]"><FileText size={28} /></div>
                    <p className="text-[#4A4458]/50 font-noto italic">Results will appear here...</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </section>

          <aside className="space-y-6 overflow-y-auto pb-6 custom-scrollbar h-[70vh] pr-2">
            <div>
              <h3 className="text-[#4A4458] font-black uppercase text-xs tracking-widest px-2 mb-3">Base Template</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setSelectedTemplate(t)} className={`flex-shrink-0 px-4 py-2 rounded-xl border-2 transition-all text-sm font-bold ${selectedTemplate.id === t.id ? 'bg-white border-[#9B8EC7] text-[#9B8EC7]' : 'bg-white/40 border-transparent text-[#4A4458]/60 hover:bg-white/60'}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-[#BDA6CE]/30 shadow-xl shadow-[#9B8EC7]/5 space-y-4">
              <h3 className="text-[#4A4458] font-black uppercase text-xs tracking-widest mb-1">Compose Campaign</h3>
              <div>
                <label className="text-xs font-bold text-[#4A4458]/70 ml-1">Subject</label>
                <input 
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full mt-1 bg-[#F2EAE0]/30 border-2 border-transparent rounded-xl px-4 py-2 outline-none focus:border-[#9B8EC7] transition-all text-sm font-medium text-[#4A4458]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A4458]/70 ml-1">Message Body</label>
                <textarea 
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  rows={6}
                  className="w-full mt-1 bg-[#F2EAE0]/30 border-2 border-transparent rounded-xl px-4 py-2 outline-none focus:border-[#9B8EC7] transition-all text-sm font-medium text-[#4A4458] resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#4A4458]/70 ml-1 mb-1 block">Attachment (Resume)</label>
                <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-[#BDA6CE] rounded-xl cursor-pointer hover:bg-[#F2EAE0]/30 transition-all">
                  <Paperclip size={18} className="text-[#9B8EC7]" />
                  <span className="text-sm font-bold text-[#4A4458]/70">
                    {resume ? resume.name : 'Click to attach PDF'}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              {isGmailConnected && emails.length > 0 && (
                <button 
                  onClick={handleBulkSend}
                  disabled={isBulkSending}
                  className="w-full py-4 mt-2 bg-gradient-to-r from-[#9B8EC7] to-[#8A7DB6] text-white rounded-xl font-black shadow-lg shadow-[#9B8EC7]/20 hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isBulkSending ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Zap size={20} />
                    </motion.div>
                  ) : (
                    <Send size={20} />
                  )}
                  {isBulkSending ? 'Sending Campaign...' : `Send to All (${emails.length})`}
                </button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from 'aws-amplify/auth'; // Import Amplify auth

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your Gmail connection...');
  
  // Use a ref to prevent the effect from running twice in React Strict Mode
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('You declined the connection. Redirecting back...');
      setTimeout(() => navigate('/app'), 3000); // Redirects to the dashboard
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code found. Redirecting...');
      setTimeout(() => navigate('/app'), 3000);
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        setMessage('Securing your connection in the database...');
        
        // 1. Get the current logged-in user's ID
        const user = await getCurrentUser();
        const userId = user.userId;

        // 2. Send the code and userId to your new Lambda endpoint
        const response = await fetch('https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/auth-gmail', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            code: code,
            userId: userId 
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect');
        }

        setStatus('success');
        setMessage(`Success! Connected as ${data.email}. Redirecting...`);
        
        // Bounce them back to the dashboard after success
        setTimeout(() => navigate('/app'), 2500); 

      } catch (err: any) {
        console.error("Auth Exchange Error:", err);
        setStatus('error');
        setMessage(err.message || 'Failed to securely connect Gmail. Please try again.');
        setTimeout(() => navigate('/app'), 3500);
      }
    };

    exchangeCodeForToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#F2EAE0] flex flex-col items-center justify-center p-4 font-roboto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-10 rounded-[3rem] shadow-xl shadow-[#9B8EC7]/10 border border-white max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="bg-[#B4D3D9] p-4 rounded-full text-[#4A4458]">
              <Zap size={32} />
            </motion.div>
          )}
          {status === 'success' && (
            <div className="bg-[#9B8EC7]/20 p-4 rounded-full text-[#9B8EC7]">
              <CheckCircle2 size={32} />
            </div>
          )}
          {status === 'error' && (
            <div className="bg-red-100 p-4 rounded-full text-red-500">
              <AlertCircle size={32} />
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-black text-[#4A4458] mb-2 tracking-tight">
          {status === 'loading' ? 'Connecting...' : status === 'success' ? 'Connected!' : 'Oops!'}
        </h2>
        <p className="text-[#4A4458]/70 font-noto leading-relaxed">{message}</p>
      </motion.div>
    </div>
  );
}
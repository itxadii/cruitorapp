import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCurrentUser } from 'aws-amplify/auth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your Gmail connection...');
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      setStatus('error');
      setMessage('You declined the connection.');

      if (window.opener) {
        window.opener.postMessage(
          { type: "GMAIL_ERROR", error: "User denied access" },
          window.location.origin
        );
        window.close();
      } else {
        setTimeout(() => navigate('/app'), 2000);
      }
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code found.');

      if (window.opener) {
        window.opener.postMessage(
          { type: "GMAIL_ERROR", error: "No code" },
          window.location.origin
        );
        window.close();
      } else {
        setTimeout(() => navigate('/app'), 2000);
      }
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        setMessage('Securing your connection...');

        const user = await getCurrentUser();
        const userId = user.userId;

        const response = await fetch(
          'https://y3u1vnxxki.execute-api.ap-south-1.amazonaws.com/prod/auth-gmail',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, userId }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect');
        }

        setStatus('success');
        setMessage(`Connected as ${data.email}`);

        if (window.opener) {
          window.opener.postMessage(
            { type: "GMAIL_CONNECTED", email: data.email },
            window.location.origin
          );
          setTimeout(() => window.close(), 1000);
        } else {
          setTimeout(() => navigate('/app'), 1500);
        }

      } catch (err: any) {
        console.error(err);
        setStatus('error');
        setMessage(err.message || 'Connection failed');

        if (window.opener) {
          window.opener.postMessage(
            { type: "GMAIL_ERROR", error: err.message },
            window.location.origin
          );
          window.close();
        } else {
          setTimeout(() => navigate('/app'), 2000);
        }
      }
    };

    exchangeCodeForToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#edffd6] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-10 rounded-3xl shadow-lg text-center"
      >
        <div className="mb-4 flex justify-center">
          {status === 'loading' && <LoaderCircle className="animate-spin" />}
          {status === 'success' && <CheckCircle2 className="text-green-500" />}
          {status === 'error' && <AlertCircle className="text-red-500" />}
        </div>

        <h2 className="text-xl font-bold">
          {status === 'loading' ? 'Connecting...' :
           status === 'success' ? 'Connected!' : 'Error'}
        </h2>

        <p className="text-gray-500 mt-2">{message}</p>
      </motion.div>
    </div>
  );
}
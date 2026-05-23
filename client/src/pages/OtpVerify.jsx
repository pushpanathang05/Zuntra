import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const OtpVerify = () => {
  const { verifyOtp, loading: authLoading, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const email = searchParams.get('email') || '';
  const devOtp = searchParams.get('devOtp') || '';

  // Redirect if user is already logged in and verified
  useEffect(() => {
    if (user && user.isVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit numeric code.');
      return;
    }

    try {
      await verifyOtp(email, otp);
      setSuccess('Account verified successfully! Redirecting...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err || 'Verification failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-[#0f0f11]">
      {/* Background visual glowing gradients */}
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/10 mb-3.5">
            <Compass className="w-5.5 h-5.5 text-white" />
          </div>
          <h2 className="text-xl font-bold font-display text-white tracking-tight">Verify Your Account</h2>
          <p className="text-zinc-400 text-xs mt-1 text-center font-sans max-w-[280px] leading-relaxed">
            We have sent a 6-digit code to <span className="text-zinc-200 font-semibold">{email}</span>.
          </p>
        </div>

        {/* Status Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl p-3 flex items-start gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl p-3 flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dev Bypass Notification */}
        {devOtp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-2xl p-4 text-xs flex flex-col gap-2 relative overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
              <strong className="font-semibold">Development OTP Code</strong>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              SMTP failed/not configured. Use this code to verify:
            </p>
            <div className="flex items-center justify-between bg-black/40 px-3 py-2 rounded-xl border border-white/5 font-mono text-sm tracking-widest text-zinc-150">
              <span className="font-bold select-all">{devOtp}</span>
              <button
                type="button"
                onClick={() => {
                  setOtp(devOtp);
                  setError('');
                }}
                className="text-[10px] text-violet-400 hover:text-violet-300 font-sans tracking-normal font-bold cursor-pointer underline hover:no-underline"
              >
                Auto-fill
              </button>
            </div>
          </motion.div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-2 uppercase tracking-wider text-center">
              Enter Verification Code
            </label>
            <div className="relative max-w-[260px] mx-auto">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                pattern="\d{6}"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#18181b] border border-[#27272a] text-white text-center text-lg font-bold tracking-[8px] placeholder-zinc-700 focus:border-violet-600 focus:outline-none transition-all"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Restrict to numbers only
                required
                disabled={authLoading}
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={authLoading || otp.length !== 6}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-750 hover:to-fuchsia-600 text-white text-xs font-bold shadow-lg shadow-violet-600/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {authLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        {/* Footer switch back */}
        <div className="mt-8 text-center text-xs text-zinc-500 font-sans space-y-3">
          <div>
            Did not get a code?{' '}
            <button
              onClick={() => {
                navigate('/auth');
              }}
              className="text-violet-500 font-bold hover:underline cursor-pointer"
            >
              Back to login
            </button>
          </div>
          <div className="text-[10px] text-zinc-500 pt-2 border-t border-white/5">
            Testing locally? You can also bypass with code <span className="font-mono font-semibold text-zinc-300 bg-white/5 px-1 py-0.5 rounded select-all">123456</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OtpVerify;

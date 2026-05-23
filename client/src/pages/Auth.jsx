import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Mail, Lock, User, AlertCircle, Eye, EyeOff, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleIcon = () => (
  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.822-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.706 0 3.24.68 4.373 1.8l3.123-3.123C18.665 2.14 15.655 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c5.795 0 10.655-4.18 11.24-9.84H12.24z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.83-.98 2.94 1.07.08 2.15-.52 2.81-1.33z"/>
  </svg>
);

const COLLAGE_IMAGES_LEFT = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005198143-e5283b519a7f?w=400&auto=format&fit=crop&q=80',
];

const COLLAGE_IMAGES_CENTER = [
  'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop&q=80',
];

const COLLAGE_IMAGES_RIGHT = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80',
];

const Auth = () => {
  const { user, login, register, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { username, email, password } = formData;

    if (isLogin) {
      if (!email || !password) {
        setError('Please fill in email and password fields.');
        return;
      }
      try {
        await login(email, password);
        navigate('/');
      } catch (err) {
        setError(err.message || 'Login failed');
      }
    } else {
      if (!username || !email || !password) {
        setError('Please fill in all registration fields.');
        return;
      }
      if (username.length < 3) {
        setError('Username must be at least 3 characters.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      try {
        await register(username, email, password);
        navigate('/');
      } catch (err) {
        setError(err);
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex flex-col md:flex-row relative bg-[#0f0f11] overflow-hidden">
      
      <div className="absolute top-1/3 right-1/4 w-80 h-80 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-fuchsia-600/5 blur-[120px] pointer-events-none z-0"></div>

      <div className="hidden lg:flex w-1/2 h-[calc(100vh-70px)] relative overflow-hidden border-r border-white/5 bg-[#0b0b0d]">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[#0f0f11] z-10 pointer-events-none"></div>

        <div className="grid grid-cols-3 gap-4 p-4 w-full h-full relative z-0">
          
          <div className="flex flex-col gap-4 overflow-hidden relative h-full">
            <div className="flex flex-col gap-4 animate-scroll-up">
              {[...COLLAGE_IMAGES_LEFT, ...COLLAGE_IMAGES_LEFT].map((img, i) => (
                <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl shrink-0">
                  <img src={img} alt="Art piece" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-hidden relative h-full">
            <div className="flex flex-col gap-4 animate-scroll-down">
              {[...COLLAGE_IMAGES_CENTER, ...COLLAGE_IMAGES_CENTER].map((img, i) => (
                <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl shrink-0">
                  <img src={img} alt="Art piece" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 overflow-hidden relative h-full">
            <div className="flex flex-col gap-4 animate-scroll-up">
              {[...COLLAGE_IMAGES_RIGHT, ...COLLAGE_IMAGES_RIGHT].map((img, i) => (
                <div key={i} className="w-full aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl shrink-0">
                  <img src={img} alt="Art piece" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-violet-500/5 transition-all duration-300"
        >
          <div className="flex flex-col items-center mb-6">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/10 mb-3.5">
              <Compass className="w-5.5 h-5.5 text-white" />
            </div>
            <h2 className="text-xl font-bold font-display text-white tracking-tight">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-zinc-400 text-xs mt-1 text-center font-sans">
              {isLogin ? 'Log in to continue your journey' : 'Join us and start exploring'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-4 overflow-hidden"
              >
                <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl p-3 flex items-start gap-2.5 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    name="username"
                    placeholder="@username"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-650 text-xs focus:border-violet-600 focus:outline-none transition-all"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="hello@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-650 text-xs focus:border-violet-600 focus:outline-none transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] text-zinc-500 hover:text-zinc-300 font-sans">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-white placeholder-zinc-650 text-xs focus:border-violet-600 focus:outline-none transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 hover:from-violet-700 hover:to-fuchsia-600 text-white text-xs font-bold shadow-lg shadow-violet-600/10 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {authLoading ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              ) : isLogin ? (
                'Log in'
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex justify-center items-center gap-3">
              <button className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center hover:bg-[#27272a] transition-all hover:scale-105 cursor-pointer">
                <GoogleIcon />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center hover:bg-[#27272a] transition-all hover:scale-105 cursor-pointer">
                <Github className="w-4 h-4 text-white" />
              </button>
              <button className="w-8 h-8 rounded-full bg-[#18181b] border border-[#27272a] flex items-center justify-center hover:bg-[#27272a] transition-all hover:scale-105 cursor-pointer">
                <AppleIcon />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-500 font-sans">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-violet-500 font-bold ml-1 hover:underline cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default Auth;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle, Moon, Sun } from 'lucide-react';
import { ClipLoader } from 'react-spinners';
import { motion, AnimatePresence } from 'framer-motion';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, text: "", color: "bg-slate-700/50", width: "0%", desc: "No data" };
  let score = 0;
  if (pass.length > 7) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score < 2) return { score, text: "Critically Weak", color: "bg-rose-500", width: "25%", desc: "Safety Risk" };
  if (score < 4) return { score, text: "Compromised", color: "bg-amber-500", width: "50%", desc: "Vulnerable" };
  if (score === 4) return { score, text: "Authorized", color: "bg-cyan-400", width: "75%", desc: "Compliant" };
  return { score, text: "Ultra-Secure", color: "bg-emerald-500", width: "100%", desc: "Optimal" };
};

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Security Key Mismatch", { position: 'bottom-center' });
      return;
    }
    
    const strength = getPasswordStrength(password);
    if (strength.score < 4) {
      toast.error("Security Protocol Violation: Strength Tier 'Authorized' Required.", {
        icon: '⚠️',
        style: { borderRadius: '12px', background: '#450a0a', color: '#fecaca' }
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.put(`${SERVER_URL}/api/auth/reset-password/${token}`, {
        password
      });
      toast.success(res.data.message || "Credential Overridden Successfully!");
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification Token Expired/Invalid", {
        icon: '❌',
        style: { background: '#1e293b' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0f1c] font-sans cyber-grid selection:bg-amber-500/30 selection:text-amber-900 dark:selection:text-white transition-colors duration-500">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-lg text-slate-800 dark:text-white hover:scale-110 active:scale-95 transition-all z-[100] flex items-center justify-center group"
      >
        {theme === 'dark' ? <Sun size={20} className="text-amber-400 group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />}
      </button>
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-amber-500/20 rounded-full blur-[140px] mix-blend-screen"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.15, 0.1],
          x: [0, -40, 0],
          y: [0, 60, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] right-[15%] w-[500px] h-[500px] bg-yellow-600/20 rounded-full blur-[140px] mix-blend-screen"
      />

      <div className="relative z-10 w-full max-w-[420px] p-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "circOut" }}
          className="glass-panel dark:glass-panel-dark rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/60 dark:border-white/5 relative"
        >
          <div className="absolute inset-0 bg-white/20 dark:bg-[#0a0f1c]/95 backdrop-blur-[80px]"></div>
          
          {/* Content Container */}
          <div className="relative p-8 sm:p-10">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mb-8 relative"
            >
              <div className="relative z-10 p-5 bg-gradient-to-tr from-amber-500/10 to-yellow-500/10 rounded-[2rem] border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.15)] group flex items-center justify-center">
                <Lock className="h-10 w-10 text-amber-400 group-hover:rotate-12 transition-transform duration-500" />
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      key="loader"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <ClipLoader size={20} color="#fbbf24" cssOverride={{ display: 'block' }} speedMultiplier={0.6} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl sm:text-3xl font-black text-center text-slate-900 dark:text-white tracking-tight mb-3 transition-colors duration-500"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Reset Security Access
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full"
            >
              <Sparkles size={12} className="text-amber-400" />
              <p className="text-[10px] text-amber-400/70 font-extrabold uppercase tracking-[0.2em] pt-0.5">
                Authorized Override Mode
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Row 1 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="space-y-3"
            >
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Global Secret Key</label>
                {password && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1">
                    {strength.text === "Ultra-Secure" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    Tier: {strength.text}
                  </span>
                )}
              </div>
              <div className="relative group/input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/5 text-slate-900 dark:text-white pl-6 pr-14 py-4 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono text-sm shadow-inner placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="high-entropy password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Security Diagnostics (Strength Bar) */}
              <AnimatePresence>
                {password && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">Complexity Index</span>
                        <span className={strength.color.replace('bg-', 'text-')}>{strength.desc}</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: strength.width }}
                          className={`h-full ${strength.color} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Input Row 2 */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Security Confirmation</label>
              <div className="group/input relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/5 text-slate-900 dark:text-white px-6 py-4 rounded-xl outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono text-sm shadow-inner placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="Repeat for validation"
                />
                {confirmPassword && confirmPassword === password && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2 size={20} className="text-amber-500" />
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Final Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-4"
            >
              <button
                type="submit"
                disabled={isLoading || !password || password !== confirmPassword}
                className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] transition-all relative overflow-hidden group shadow-lg ${
                  isLoading || password !== confirmPassword 
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-transparent" 
                    : "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] border border-transparent hover:border-amber-400/50 active:scale-95"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                  {!isLoading && <ShieldCheck size={16} />}
                </span>
                
                {/* Hover Reveal Effect */}
                {!isLoading && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                  />
                )}
              </button>
            </motion.div>
          </form>

          {/* Security Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 pt-6 border-t border-white/30 dark:border-white/5 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-opacity duration-500 hover:opacity-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/20 px-3 py-1 rounded bg-white/5">AES-256</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/20 px-3 py-1 rounded bg-white/5">SHA-512</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/20 px-3 py-1 rounded bg-white/5">TLS 1.3</div>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock size={10} /> Secure Encrypted Connection
            </p>
          </motion.div>
        </div>
        </motion.div>
      </div>

      {/* Decorative Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-10 text-white font-black text-8xl tracking-tight pointer-events-none select-none"
      >
        V.T
      </motion.div>
    </div>
  );
};

export default ResetPassword;

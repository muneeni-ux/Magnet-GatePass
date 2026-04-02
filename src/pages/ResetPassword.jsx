import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen flex justify-center items-center bg-[#070b14] overflow-hidden relative selection:bg-cyan-500/30 selection:text-white">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_var(--tw-gradient-stops))] from-slate-900 via-[#070b14] to-black"></div>
      
      {/* Animated Light Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
          y: [0, -30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[10%] w-[600px] h-[600px] bg-cyan-600/20 rounded-full blur-[140px] mix-blend-screen"
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.15, 0.1],
          x: [0, -40, 0],
          y: [0, 60, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[5%] right-[15%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[140px] mix-blend-screen"
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-[90%] max-w-xl z-20 relative p-[1px] rounded-[2.5rem] bg-gradient-to-br from-white/10 via-transparent to-white/5 border border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#0a0f1c]/95 backdrop-blur-[80px] rounded-[2.5rem]"></div>
        
        {/* Content Container */}
        <div className="relative p-10 sm:p-16">
          {/* Header Section */}
          <div className="flex flex-col items-center mb-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="mb-8 relative"
            >
              <div className="relative z-10 p-5 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 rounded-[2rem] border border-white/10 shadow-2xl group flex items-center justify-center">
                <Lock className="h-10 w-10 text-cyan-400 group-hover:rotate-12 transition-transform duration-500" />
                <AnimatePresence>
                  {isLoading && (
                    <motion.div 
                      key="loader"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      className="absolute -top-1 -right-1"
                    >
                      <ClipLoader size={20} color="#22d3ee" speedMultiplier={0.6} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full -z-10 animate-pulse"></div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-4xl font-black text-center text-white tracking-[-0.03em] mb-3"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Reset Security Access
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full"
            >
              <Sparkles size={12} className="text-cyan-400" />
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-[0.2em] pt-0.5">
                Authorized Override Mode
              </p>
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
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
                  className="w-full pl-6 pr-14 py-5 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all text-lg font-medium text-white shadow-inner place-content-center placeholder:text-slate-700"
                  placeholder="Create high-entropy password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-cyan-400 transition-colors"
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
                  className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all text-lg font-medium text-white shadow-inner placeholder:text-slate-700"
                  placeholder="Repeat for validation"
                />
                {confirmPassword && confirmPassword === password && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                  >
                    <CheckCircle2 size={20} className="text-emerald-500" />
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
                className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
                  isLoading || password !== confirmPassword 
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50" 
                    : "bg-white text-black hover:scale-[1.02] active:scale-[0.98] hover:shadow-cyan-500/20"
                }`}
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? "Rewriting Protocol..." : "Secure Account Link"}
                  {!isLoading && <ShieldCheck size={16} />}
                </span>
                
                {/* Hover Reveal Effect */}
                {!isLoading && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none"
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
            className="mt-14 pt-10 border-t border-white/5 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-opacity duration-500 hover:opacity-100">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/20 px-3 py-1 rounded bg-white/5">AES-256</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/20 px-3 py-1 rounded bg-white/5">SHA-512</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-white/20 px-3 py-1 rounded bg-white/5">TLS 1.3</div>
            </div>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <Lock size={10} /> Visitrack Terminal Encryption Active
            </p>
          </motion.div>
        </div>
      </motion.div>

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

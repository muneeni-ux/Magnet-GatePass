import React, { useState, useEffect } from "react";
import { LockKeyhole, Eye, EyeOff, ShieldCheck, Cpu, AlertCircle, Sun, Moon  } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [recoveryAttempts, setRecoveryAttempts] = useState(0);
  const [recoveryError, setRecoveryError] = useState("");
  const navigate = useNavigate();
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

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotUsername || recoveryAttempts >= 3) return;
    setForgotLoading(true);
    setRecoveryError("");
    try {
      const res = await fetch(`${SERVER_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, username: forgotUsername }),
      });
      const data = await res.json();
      
      if (res.status === 403 || data.isLocked) {
        setRecoveryAttempts(3);
        setRecoveryError(data.message || "Account locked. Contact Admin.");
      } else if (res.status === 404) {
        setRecoveryError(data.message || "Invalid credentials.");
        if (data.attemptsRemaining !== undefined) {
          setRecoveryAttempts(3 - data.attemptsRemaining);
        }
      } else if (res.ok) {
        toast.success(data.message || "Reset link dispatched.", { duration: 4000 });
        setShowForgotModal(false);
        setForgotEmail("");
        setForgotUsername("");
        setRecoveryAttempts(0);
      } else {
        setRecoveryError("Server error. Try again.");
      }
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setRecoveryError("Network Error: Verification system unreachable.");
      } else {
        setRecoveryError("Connection failed.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Access Denied // Authorization Failed",
        );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(data.message || "Login successful!");

      onLogin();
      navigate(
        data.user?.isAdmin ? "/visitrack/admin/dashboard/users" : "/home",
      );
    } catch (error) {
      if (error.message === "Failed to fetch") {
        setErrorMsg("Network Error: Terminal uplink to central server failed.");
      } else {
        setErrorMsg(error.message || "Invalid Security Credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30 transition-colors duration-500">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-lg text-slate-800 dark:text-white hover:scale-110 active:scale-95 transition-all z-[100] flex items-center justify-center group"
      >
        {theme === 'dark' ? <Sun size={20} className="text-emerald-400 group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />}
      </button>
      {/* Decorative Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-1000 pointer-events-none"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-[420px] p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="glass-panel dark:glass-panel-dark rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] border border-white/60 dark:border-slate-700/50">
          {/* Header Section */}
          <div className="bg-white/40 dark:bg-slate-900/40 border-b border-white/30 dark:border-slate-700/30 p-8 text-center backdrop-blur-md relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-emerald-500/5 dark:to-transparent pointer-events-none"></div>

            <div className="flex justify-center mb-5 relative">
              <div className="p-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20 shadow-inner group">
                <img src="./VisiTrack-L51.png" className="h-10 w-10 object-contain group-hover:scale-110 transition-transform rounded-lg" alt="VisiTrack Logo" />
              </div>
            </div>
            <h1
              className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              VISITRACK
              <span className="text-blue-600 dark:text-emerald-400">.OS</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest font-mono">
                Authorization Required
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></div>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-white/20 dark:bg-[#0a0f1c]/40 backdrop-blur-sm">
            {errorMsg && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="p-1 bg-red-500/20 rounded-full shrink-0">
                  <span className="block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                </div>
                <span className="uppercase tracking-wide leading-relaxed">
                  {errorMsg}
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Operator Name
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                    placeholder="Enter Operator Name..."
                    spellCheck="false"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                  Security Key
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white px-5 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600 pr-12"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 mt-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg flex justify-center items-center gap-2 ${
                  loading
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-600 dark:to-cyan-600 dark:hover:from-emerald-500 dark:hover:to-cyan-600 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-transparent hover:border-white/20"
                }`}
              >
                {loading ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Initialize Session"
                )}
              </button>
            </form>

                 <div className="mt-8 text-center flex flex-col items-center gap-2 border-t border-white/30 dark:border-slate-800 pt-6">
                     <ShieldCheck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                     <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">
                         Restricted Access Terminal <br/> Authorized Personnel Only
                     </p>
                     
                     <div className="mt-4 pt-4 border-t border-white/20 dark:border-slate-800/50 w-full flex justify-center">
                       <button 
                         type="button"
                         onClick={() => setShowForgotModal(true)}
                         className="text-[10px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-widest font-bold"
                       >
                         Security Key Lost? <strong className="text-blue-600 dark:text-emerald-400 underline decoration-blue-500/30 underline-offset-4 pl-1">Initiate Recovery</strong>
                       </button>
                     </div>
                 </div>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <p className="mt-8 text-xs text-center text-slate-500 font-bold uppercase tracking-widest bg-white/40 dark:bg-slate-900/40 p-2 rounded-xl backdrop-blur-md shadow-sm border border-white/40 dark:border-slate-800/60 inline-flex items-center gap-2">
        &copy; {new Date().getFullYear()} VisiTrack // Security Protocol
      </p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-[#070b14]/80 backdrop-blur-xl" onClick={() => setShowForgotModal(false)}></div>
          <div className="bg-white/40 dark:bg-[#0a0f1c]/70 backdrop-blur-3xl border border-white/60 dark:border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.4)] rounded-[2.5rem] p-8 sm:p-10 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
            {/* Ambient Modal Blobs */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 dark:bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-indigo-500/20 dark:bg-cyan-500/20 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex justify-center mb-6 relative">
              <div className="p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-[1.5rem] border border-blue-500/20 dark:border-emerald-500/20 shadow-inner group">
                <LockKeyhole className="h-8 w-8 text-blue-600 dark:text-emerald-400 group-hover:rotate-12 transition-transform duration-500" />
              </div>
            </div>
            
            <h3 className="text-3xl font-black text-slate-900 dark:text-white text-center mb-2 tracking-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              Security Override
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-[10px] text-center mb-8 font-extrabold uppercase tracking-[0.2em]">
              {recoveryAttempts >= 3 
                ? "Terminal Access Terminated" 
                : "Verify Identity to Recover Access Key"}
            </p>

            {recoveryAttempts >= 3 ? (
              <div className="bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] text-center space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none"></div>
                <div className="flex justify-center relative z-10">
                  <div className="p-4 bg-red-500/10 dark:bg-red-500/20 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                    <ShieldCheck className="h-10 w-10 text-red-600 dark:text-red-500 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2 relative z-10">
                  <h4 className="text-red-600 dark:text-red-500 font-black text-lg uppercase tracking-widest">Identity Restricted</h4>
                  <p className="text-red-600/70 dark:text-red-400/80 text-[11px] leading-relaxed font-bold uppercase tracking-wider">
                    Multiple mismatch detected. Terminal profile has been <span className="text-red-600 dark:text-red-500 font-black underline decoration-red-500/50 underline-offset-4">suspended</span>.
                  </p>
                </div>
                
                <div className="bg-black/5 dark:bg-black/40 p-4 rounded-2xl border border-red-500/10 dark:border-white/5 relative z-10">
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest leading-loose">
                    Required Action: <br />
                    <span className="text-slate-900 dark:text-white font-extrabold text-[12px]">Report to Chief Security Box</span><br />
                    or Visiting Duty Administrator
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setRecoveryError("");
                  }}
                  className="w-full py-4 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all border border-slate-700/50 shadow-lg active:scale-95 relative z-10"
                >
                  Exit Terminal
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-6 relative z-10">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Terminal Username</label>
                    <input
                      type="text"
                      required
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      className="w-full px-5 py-4 mt-2 bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500/50 dark:focus:border-cyan-500/50 focus:ring-1 focus:ring-blue-500/30 dark:focus:ring-cyan-500/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-sm shadow-inner"
                      placeholder="e.g. guard_alpha"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 ml-1">Secure Registered Email</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-5 py-4 mt-2 bg-white/50 dark:bg-black/40 border border-white/60 dark:border-white/10 rounded-2xl outline-none focus:border-blue-500/50 dark:focus:border-cyan-500/50 focus:ring-1 focus:ring-blue-500/30 dark:focus:ring-cyan-500/30 transition-all text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-sm shadow-inner"
                      placeholder="official@visitrack.com"
                    />
                  </div>
                </div>

                {recoveryError && (
                  <div className="bg-red-500/10 border border-red-500/20 py-3 px-5 rounded-2xl text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-[0.1em] leading-relaxed flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="shrink-0 h-4 w-4" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setRecoveryError("");
                    }}
                    className="flex-[1] py-4 text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all border border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-[2] py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-600 dark:to-cyan-600 hover:from-blue-500 hover:to-indigo-500 dark:hover:from-emerald-500 dark:hover:to-cyan-600 text-white font-black rounded-2xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)] dark:shadow-[0_10px_30px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center uppercase tracking-[0.2em] text-[10px] active:scale-95 border border-transparent"
                  >
                    {forgotLoading ? <Cpu className="h-4 w-4 animate-spin" /> : "Verify & Dispatch"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

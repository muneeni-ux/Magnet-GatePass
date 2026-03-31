import React, { useState } from "react";
import { LockKeyhole, Eye, EyeOff, ShieldCheck, Cpu } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

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
      if (!res.ok) throw new Error(data.message || "Access Denied // Authorization Failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin();
      navigate(data.user?.isAdmin ? "/magnet/admin/dashboard/users" : "/home");
    } catch (error) {
      setErrorMsg(error.message || "Invalid Security Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30">
      
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
                     <div className="p-3.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20 shadow-inner group">
                        <LockKeyhole className="h-8 w-8 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                     </div>
                 </div>
                 <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1.5 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                     VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span>
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
                        <span className="uppercase tracking-wide leading-relaxed">{errorMsg}</span>
                    </div>
                  )}

                 <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-2">
                         <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Operator Name</label>
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
                         <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Security Key</label>
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
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                        ) : "Initialize Session"}
                     </button>
                 </form>

                 <div className="mt-8 text-center flex flex-col items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                     <p className="text-[10px] text-slate-500 dark:text-slate-500 uppercase tracking-widest font-extrabold font-mono">
                         Restricted Access Terminal <br/> Authorized Personnel Only
                     </p>
                 </div>
             </div>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 text-[10px] text-slate-500 dark:text-slate-600 font-extrabold uppercase tracking-widest font-mono">
          &copy; {new Date().getFullYear()} Magnet Nambale // Security Protocol
      </div>
    </div>
  );
};

export default Login;

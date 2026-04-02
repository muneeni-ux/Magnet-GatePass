import React, { useState } from "react";
import { UserPlus, Shield, Terminal, ShieldCheck, Database } from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccessMsg("System access credential generated successfully.");
      setFormData({ username: "", email: "", password: "", role: "user" });
    } catch (err) {
      setErrorMsg(err.message || "Credential generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, ...props }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white px-5 py-3.5 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                spellCheck="false"
            />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30 py-16 px-4">
      
      {/* Decorative Ambient Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] animate-pulse delay-700 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-[900px] glass-panel dark:glass-panel-dark rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-white/60 dark:border-slate-700/50 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left - Description */}
        <div className="hidden md:flex flex-col justify-between bg-white/40 dark:bg-[#0a0f1c]/80 px-12 py-12 w-[45%] border-r border-white/40 dark:border-slate-700/50 backdrop-blur-md relative overflow-hidden">
             
             <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent dark:from-emerald-500/5 dark:to-transparent pointer-events-none"></div>

             <div>
               <div className="inline-flex items-center justify-center p-3 mb-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 border border-blue-500/20 dark:border-emerald-500/20 shadow-inner group">
                  <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
               </div>

               <h2 className="text-3xl font-extrabold mb-4 text-slate-900 dark:text-white tracking-tight leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                 System<br/>Provisioning
               </h2>
               <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-[250px]">
                 Generate secure access credentials and dictate role-based system permissions.
               </p>
             </div>
          
             <div className="mt-12 p-5 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-white/60 dark:border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-blue-100/50 dark:bg-emerald-500/10 rounded-xl">
                      <Database className="h-5 w-5 text-blue-600 dark:text-emerald-400" />
                   </div>
                   <div>
                       <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Active Database</p>
                       <p className="text-[10px] text-slate-500 dark:text-slate-500 font-mono mt-0.5">Secure Registration</p>
                   </div>
                </div>
             </div>
        </div>

        {/* Right - Form */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-14 bg-white/20 dark:bg-[#0a0f1c]/40 backdrop-blur-sm">

          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
               Create Account Profile
            </h3>
            <div className="px-3 py-1 rounded-md bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-slate-700/50 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-mono">
               ROOT // INIT
            </div>
          </div>

          {errorMsg && (
            <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-wide flex items-start gap-3 w-full animate-in slide-in-from-top-2">
              <div className="p-1 bg-red-500/20 rounded-full shrink-0">
                  <span className="block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
              </div>
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
             <div className="mb-8 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-5 py-4 rounded-xl text-xs font-bold uppercase tracking-wide flex items-start gap-3 w-full animate-in slide-in-from-top-2">
               <div className="p-1 bg-emerald-500/20 rounded-full shrink-0">
                  <span className="block w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
               </div>
               <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
                label="Operator Identity"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Ex. jsmith"
            />

            <InputField
                label="Comm Channel (Email)"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@domain.com"
            />

            <InputField
                label="Security Key (Password)"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••••••"
            />

            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Clearance Level</label>
              <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-white/50 dark:bg-[#0a0f1c]/60 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white px-5 py-3.5 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                  >
                    <option className="dark:bg-slate-900" value="user">Standard Agent</option>
                    <option className="dark:bg-slate-900" value="admin">Root Administrator</option>
                  </select>
                   <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 mt-8 shadow-lg ${
                loading
                  ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-600 dark:to-cyan-600 dark:hover:from-emerald-500 dark:hover:to-cyan-500 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-0.5 border border-transparent hover:border-white/20"
              }`}
            >
               {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              {loading ? "Generating Credentials..." : "Commit Registration"}
            </button>
          </form>
        </div>
      </div>
      
      {/* Footer Text */}
        <p className="mt-8 text-xs text-center text-slate-500 font-bold uppercase tracking-widest bg-white/40 dark:bg-slate-900/40 p-2 rounded-xl backdrop-blur-md shadow-sm border border-white/40 dark:border-slate-800/60 inline-flex items-center gap-2">
          &copy; {new Date().getFullYear()} VisiTrack // Security Protocol
        </p>
    </div>
  );
};

export default Signup;

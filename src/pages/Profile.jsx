import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Save, Key, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, text: "", color: "bg-slate-100 dark:bg-slate-700", width: "0%" };
  let score = 0;
  if (pass.length > 7) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score < 2) return { score, text: "Weak", color: "bg-red-500", width: "25%" };
  if (score < 4) return { score, text: "Fair", color: "bg-orange-500", width: "50%" };
  if (score === 4) return { score, text: "Good", color: "bg-emerald-400", width: "75%" };
  return { score, text: "Strong", color: "bg-emerald-600", width: "100%" };
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setFormData((prev) => ({ ...prev, email: storedUser.email }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Password mismatch");
    }
    
    if (formData.password && getPasswordStrength(formData.password).score < 4) {
      return toast.error("Please provide a stronger password (must be Good or Strong)");
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const userId = user.id || user._id; 

      const res = await fetch(`${SERVER_URL}/api/auth/users/${userId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser)); 
      
      setUser(updatedUser);
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] flex items-center justify-center text-slate-500 dark:text-slate-400 font-sans text-[11px] font-extrabold uppercase tracking-widest cyber-grid">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-emerald-500 dark:border-t-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-spin"></div>
          INITIALIZING PROFILE DATA...
        </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 md:p-8 pt-24 md:pt-[100px] font-sans relative overflow-hidden cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-[2rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Left Panel - Profile Card */}
        <div className="w-full md:w-1/3 bg-white/40 dark:bg-slate-900/60 border-b md:border-b-0 md:border-r border-white/60 dark:border-slate-700/50 p-10 flex flex-col items-center text-center backdrop-blur-md relative overflow-hidden">
             
             {/* Admin Glow Indicator */}
             {user.isAdmin && <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-emerald-500 dark:to-cyan-500"></div>}

             <div className={`w-28 h-28 rounded-full bg-white/50 dark:bg-slate-800/80 border-[3px] p-1.5 mb-6 relative shadow-inner ${user.isAdmin ? "border-blue-500/50 dark:border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "border-slate-300 dark:border-slate-600"}`}>
                 <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden border border-white/60 dark:border-slate-600/50">
                    <User size={48} className="text-slate-500 dark:text-slate-400" />
                 </div>
                 <div className={`absolute bottom-0 right-0 border-2 border-white dark:border-slate-800 p-2 rounded-full shadow-lg ${user.isAdmin ? "bg-blue-600 dark:bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"}`}>
                    {user.isAdmin ? <Shield size={14} /> : <User size={14} />}
                 </div>
             </div>

             <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 font-mono tracking-tight">{user.username}</h2>
             <span className={`inline-block px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest font-mono mb-8 border shadow-inner ${user.isAdmin ? "bg-blue-600/10 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400 border-blue-500/30 dark:border-emerald-500/30" : "bg-slate-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700"}`}>
                 {user.isAdmin ? "Administrator" : "Staff Member"}
             </span>

             <div className="w-full space-y-5 mt-auto border-t border-white/60 dark:border-slate-700/50 pt-8">
                 <div className="flex justify-between items-center text-[11px] font-mono tracking-widest font-bold">
                     <span className="text-slate-500 dark:text-slate-400 uppercase">Sys ID</span>
                     <span className="text-slate-900 dark:text-white bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-md border border-white/60 dark:border-slate-700">#{user.id?.slice(-6).toUpperCase() || "UNKX0"}</span>
                 </div>
                 <div className="flex justify-between items-center text-[11px] font-mono tracking-widest font-bold">
                     <span className="text-slate-500 dark:text-slate-400 uppercase">Clearance</span>
                     <span className="text-emerald-500 dark:text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span> Authorized
                     </span>
                 </div>
             </div>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="w-full md:w-2/3 p-8 md:p-12 bg-white/30 dark:bg-[#0a0f1c]/40 backdrop-blur-md">

            <div className="mb-8 border-b border-white/60 dark:border-slate-700/50 pb-6 flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-xl border border-blue-500/20 dark:border-emerald-500/20 shadow-inner">
                    <Key className="text-blue-600 dark:text-emerald-400 h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        ACCOUNT <span className="text-blue-600 dark:text-emerald-400">SECURITY</span>
                    </h3>
                    <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono mt-1">Manage Credentials & Contact Logs</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Email Field */}
                <div className="space-y-2">
                    <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Email Address Contact</label>
                    <div className="relative group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                        />
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Set New Password</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Empty defaults to old"
                                className="w-full bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 dark:hover:text-emerald-500 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="mt-3 text-[10px] font-extrabold uppercase tracking-widest font-mono">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="text-slate-500 dark:text-slate-400">Cipher Rating:</span>
                                <span className={`${getPasswordStrength(formData.password).text === "Weak" ? "text-red-500" : getPasswordStrength(formData.password).text === "Fair" ? "text-orange-500" : "text-emerald-500"}`}>
                                  {getPasswordStrength(formData.password).text}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden shadow-inner">
                                <div 
                                  className={`h-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                                  style={{ width: getPasswordStrength(formData.password).width }}
                                ></div>
                              </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                         <label className="block text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">Verify Password</label>
                         <div className="relative group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={!formData.password}
                                placeholder="Match new password"
                                className={`w-full bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-700/60 text-slate-900 dark:text-white pl-12 pr-12 py-3.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 focus:ring-1 focus:ring-blue-500 dark:focus:ring-emerald-500 transition-all font-mono text-sm shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] placeholder-slate-400 dark:placeholder-slate-600 ${!formData.password ? "opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800/80" : ""}`}
                            />
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={!formData.password}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 dark:hover:text-emerald-500 transition-colors disabled:opacity-40"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex justify-end border-t border-white/60 dark:border-slate-700/50 mt-10">
                     <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all focus:outline-none shadow-lg border border-transparent flex items-center gap-2 ${
                            loading ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-600 dark:to-cyan-600 dark:hover:from-emerald-500 dark:hover:to-cyan-500 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-blue-500/40 dark:hover:shadow-emerald-500/40 hover:-translate-y-0.5 hover:border-white/20"
                        }`}
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? "Committing..." : "Finalize Changes"}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
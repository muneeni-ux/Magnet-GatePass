import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Save, Key, Cpu, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

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
      return toast.error("ACCESS DENIED: Password Mismatch");
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      // Use 'id' from stored user (Login endpoint returns user.id)
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

      // Update local storage
      const updatedUser = { ...user, ...data.user };
      // Ensure we keep the token if it's stored separately, but here we just update the user object
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Update user in local storage
      
      setUser(updatedUser);
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      toast.success("PROFILE DATA UPDATED");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "SYSTEM ERROR");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-blue-500 font-mono text-xs animate-pulse">
        Initializing Secure Profile Uplink...
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 font-mono relative overflow-hidden">
        {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-sm overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.2)] bg-slate-900/80 backdrop-blur-xl border border-blue-900/50 relative z-10 md:mt-24">
        
        {/* Left Panel - Identity Card */}
        <div className="w-full md:w-1/3 bg-slate-950/80 border-r border-blue-900/50 p-8 flex flex-col items-center text-center relative">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
             
             <div className="w-24 h-24 rounded-full border-2 border-blue-500/50 p-1 mb-6 relative group">
                <div className="w-full h-full rounded-full bg-blue-900/20 flex items-center justify-center overflow-hidden relative">
                    <User size={40} className="text-blue-400" />
                    <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                </div>
                 <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-blue-500 p-1 rounded-full">
                    {user.isAdmin ? <Shield size={12} className="text-blue-400" /> : <User size={12} className="text-slate-400" />}
                 </div>
             </div>

             <h2 className="text-xl font-bold text-white tracking-wider mb-1 uppercase">{user.username}</h2>
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-500/30 rounded-full mb-8">
                 <div className={`w-2 h-2 rounded-full ${user.isAdmin ? "bg-amber-500" : "bg-blue-500"} animate-pulse`}></div>
                 <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">{user.isAdmin ? "ADMINISTRATOR" : "OPERATIVE"}</span>
             </div>

             <div className="w-full space-y-4 mt-auto">
                 <div className="flex justify-between text-xs border-b border-blue-900/30 pb-2">
                     <span className="text-slate-500">ID REF:</span>
                     <span className="text-blue-200 font-mono">#{user.id?.slice(-6).toUpperCase() || "UNK"}</span>
                 </div>
                 <div className="flex justify-between text-xs border-b border-blue-900/30 pb-2">
                     <span className="text-slate-500">ACCESS:</span>
                     <span className="text-blue-200 font-mono">LEVEL {user.isAdmin ? "1 (FULL)" : "4 (RESTRICTED)"}</span>
                 </div>
             </div>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="w-full md:w-2/3 p-8 md:p-12 relative">
             <div className="absolute top-4 right-4">
                 <Cpu className="text-slate-800 h-24 w-24 opacity-20" />
             </div>

            <div className="mb-8 border-b border-blue-900/30 pb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-2">
                    <Key className="text-blue-500 h-4 w-4" /> Credentials Update
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                
                {/* Email Field */}
                <div className="group">
                    <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Secure Comm Link (Email)</label>
                    <div className="relative">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-sm"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors h-4 w-4" />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">New Access Key</label>
                        <div className="relative">
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="UNCHANGED"
                                className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-sm placeholder-slate-700"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors h-4 w-4" />
                        </div>
                    </div>

                    <div className="group">
                         <label className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Verify Key</label>
                         <div className="relative">
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={!formData.password}
                                placeholder="CONFIRM"
                                className={`w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-sm placeholder-slate-700 ${!formData.password ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                            <AlertTriangle className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${!formData.password ? "text-slate-700" : "text-slate-500 group-focus-within:text-blue-500"}`} />
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end border-t border-blue-900/30 mt-8">
                     <button
                        type="submit"
                        disabled={loading}
                        className={`group relative overflow-hidden px-8 py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] ${
                            loading ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {loading ? (
                                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {loading ? "ENCRYPTING DATA..." : "UPDATE CREDENTIALS"}
                        </span>
                    </button>
                </div>
            </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
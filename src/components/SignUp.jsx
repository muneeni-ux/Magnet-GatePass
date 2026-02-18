import React, { useState } from "react";
import { UserPlus, Shield, Terminal } from "lucide-react";

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

      setSuccessMsg("USER REGISTERED TO DATABASE");
      setFormData({ username: "", email: "", password: "", role: "user" });
    } catch (err) {
      setErrorMsg(err.message || "REGISTRATION FAILED");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, ...props }) => (
    <div>
        <label className="block mb-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 px-4 py-2 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-sm placeholder-slate-600"
            />
             <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <div className="w-1 h-1 bg-blue-500 rounded-full opacity-50 group-focus-within:opacity-100 group-focus-within:animate-pulse"></div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10 font-mono relative overflow-hidden">
        {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      <div className="flex flex-col md:flex-row w-full max-w-5xl rounded-sm overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.2)] bg-slate-900/80 backdrop-blur-xl border border-blue-900/50 relative z-10">
        
        {/* Left - Description */}
        <div className="hidden md:flex flex-col justify-center bg-slate-950/50 px-10 py-10 w-1/2 border-r border-blue-900/50 relative">
             <div className="absolute top-6 left-6 flex items-center gap-2">
                <Shield className="text-blue-500 h-5 w-5" />
                <span className="text-xs font-bold text-blue-300 tracking-widest uppercase">Admin Terminal</span>
             </div>

          <h2 className="text-3xl font-bold mb-6 text-white uppercase tracking-wider">
            User Provisions
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            <span className="text-blue-500 font-bold">WARNING:</span> Restricted Area. You are accessing the user database write protocol. Ensure all new user entries are authorized and assigned correct clearance levels (User/Admin).
          </p>
          
          <div className="mt-auto flex items-center gap-4 border-t border-blue-900/30 pt-6">
               <div className="p-3 bg-blue-900/20 rounded-sm border border-blue-500/30">
                  <UserPlus className="h-8 w-8 text-blue-400" />
               </div>
               <div>
                   <p className="text-xs font-bold text-white uppercase">Profile Generator</p>
                   <p className="text-[10px] text-blue-500 uppercase tracking-widest">Active Status</p>
               </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-10 relative">
             <div className="absolute top-0 right-0 p-2">
                 <Terminal size={16} className="text-slate-700" />
             </div>

          <h3 className="text-xl font-bold mb-6 text-white uppercase tracking-wider flex items-center gap-2">
             <span className="w-2 h-6 bg-blue-600"></span> Create New User
          </h3>

          {errorMsg && (
            <div className="mb-6 bg-red-900/20 border-l-2 border-red-500 text-red-200 px-4 py-3 rounded-r-sm text-xs font-bold uppercase tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
             <div className="mb-6 bg-green-900/20 border-l-2 border-green-500 text-green-200 px-4 py-3 rounded-r-sm text-xs font-bold uppercase tracking-wide flex items-center gap-2">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
                label="Username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="E.G. OFFICER_JOHN"
            />

            <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="E.G. JOHN@ACCESS.SECURE"
            />

            <InputField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="MINIMUM 6 CHARACTERS"
            />

            <div>
              <label className="block mb-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">Clearance Level</label>
              <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-950/50 border border-blue-900/30 text-blue-100 px-4 py-2 rounded-sm focus:outline-none focus:border-blue-500 focus:bg-slate-900/80 transition-all font-mono text-sm appearance-none cursor-pointer"
                  >
                    <option value="user">USER (STANDARD)</option>
                    <option value="admin">ADMIN (ELEVATED)</option>
                  </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-blue-500 border-r-[4px] border-r-transparent"></div>
                    </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-sm font-bold text-xs tracking-widest uppercase transition-all shadow-xl flex items-center justify-center gap-2 mt-8 ${
                loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] border border-blue-500"
              }`}
            >
               {loading && (
                    <div className="w-3 h-3 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" />
                )}
              {loading ? "PROCESSING..." : "REGISTER USER"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

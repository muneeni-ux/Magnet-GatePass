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

      setSuccessMsg("User successfully registered.");
      setFormData({ username: "", email: "", password: "", role: "user" });
    } catch (err) {
      setErrorMsg(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, ...props }) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</label>
        <div className="relative group">
            <input
                {...props}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm placeholder-slate-600"
            />
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-10 font-sans relative overflow-hidden">
        {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" 
            style={{
                backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                backgroundSize: "60px 60px"
            }}>
        </div>

      <div className="flex flex-col md:flex-row w-full max-w-4xl rounded-xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700 relative z-10">
        
        {/* Left - Description */}
        <div className="hidden md:flex flex-col justify-center bg-slate-900/50 px-10 py-10 w-2/5 border-r border-slate-700">
             <div className="flex items-center gap-2 mb-8">
                <Shield className="text-blue-500 h-6 w-6" />
                <span className="text-sm font-bold text-white uppercase tracking-wider">Admin Console</span>
             </div>

          <h2 className="text-2xl font-bold mb-4 text-white">
            User Management
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Create and manage system access credentials. Ensure appropriate role assignment for security compliance.
          </p>
          
          <div className="mt-auto flex items-center gap-4 border-t border-slate-700 pt-6">
               <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                  <UserPlus className="h-6 w-6 text-emerald-500" />
               </div>
               <div>
                   <p className="text-sm font-semibold text-white">New User Entry</p>
                   <p className="text-xs text-slate-500">System Database</p>
               </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="w-full md:w-3/5 p-8 sm:p-12 bg-slate-800">

          <h3 className="text-xl font-bold mb-8 text-white flex items-center gap-3">
             Create Account
          </h3>

          {errorMsg && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
             <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
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
                placeholder="e.g. jsmith"
            />

            <InputField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@institution.com"
            />

            <InputField
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Min. 6 characters"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide">Role Assignment</label>
              <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium text-sm appearance-none cursor-pointer"
                  >
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                  </select>
                   <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[6px] border-t-slate-500 border-r-[4px] border-r-transparent"></div>
                    </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-lg ${
                loading
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
              }`}
            >
               {loading && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
              {loading ? "Registering..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;

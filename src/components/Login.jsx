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
      if (!res.ok) throw new Error(data.message || "Access Denied");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin();
      navigate(data.user?.isAdmin ? "/magnet/admin/dashboard/users" : "/home");
    } catch (error) {
      setErrorMsg(error.message || "Invalid Credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 text-gray-100 font-sans">
      {/* Subtle Background */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        ></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-6">
        
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
             
             {/* Header Section */}
             <div className="bg-slate-800/50 border-b border-slate-700 p-6 text-center">
                 <div className="flex justify-center mb-4">
                     <div className="p-3 bg-blue-600/10 rounded-full border border-blue-500/20">
                        <ShieldCheck className="h-8 w-8 text-blue-500" />
                     </div>
                 </div>
                 <h1 className="text-2xl font-bold text-white mb-1">
                     MagTrack
                 </h1>
                 <p className="text-sm text-slate-400 font-medium">
                     Visitor Management System
                 </p>
             </div>

             <div className="p-8">
                 {errorMsg && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-red-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {errorMsg}
                    </div>
                  )}

                 <form onSubmit={handleSubmit} className="space-y-5">
                     <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Username</label>
                         <div className="relative group">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 text-sm"
                                placeholder="Enter your username"
                            />
                         </div>
                     </div>

                     <div className="space-y-1.5">
                         <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Password</label>
                         <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-600 text-sm pr-10"
                                placeholder="Enter your password"
                            />
                             <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                         </div>
                     </div>

                     <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3.5 mt-2 rounded-lg font-semibold text-sm transition-all duration-200 shadow-lg ${
                            loading 
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 hover:shadow-blue-900/40 hover:-translate-y-0.5"
                        }`}
                     >
                        {loading ? "Authenticating..." : "Sign In"}
                     </button>
                 </form>

                 <div className="mt-8 text-center">
                     <p className="text-xs text-slate-500">
                         Restricted Access. Authorized Personnel Only.
                     </p>
                 </div>
             </div>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 text-xs text-slate-600 font-medium">
          &copy; {new Date().getFullYear()} Nambale Magnet School
      </div>
    </div>
  );
};

export default Login;

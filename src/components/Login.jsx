// src/components/Login.jsx
import React, { useState } from "react";
import { Eye, EyeOff, ShieldAlert, User, Lock, ShieldCheck, Fingerprint } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // Strict local validations
  const validateForm = () => {
    if (username.trim().length < 3) {
      setErrorMsg("Username must be at least 3 characters.");
      return false;
    }
    if (password.length < 5) {
      setErrorMsg("Password must be at least 5 characters.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Invalid credentials provided.");
      }

      toast.success(`Welcome back, ${data.user.username}!`);
      
      // Save details to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user?.isAdmin) {
        localStorage.setItem("adminToken", data.token);
        if (onLogin) onLogin();
        navigate("/magnet/admin/dashboard/users");
      } else {
        if (onLogin) onLogin();
        navigate("/home");
      }
    } catch (error) {
      setErrorMsg(error.message || "Failed to establish database connection.");
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center px-4 transition-all duration-500 bg-slate-950 text-slate-100 relative overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(8, 12, 24, 0.93), rgba(3, 7, 18, 0.97)), url('https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/08/The-Nambale-Magnet-School-Students-tuition-fees.jpg')",
      }}
    >
      {/* Abstract Glowing Cyber-grid Lines */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(18,24,38,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,38,0.5)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Cyberpunk Radial Lighting Elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      <main className="w-full max-w-md animate-fade-in py-10 z-10 relative">
        <div className="bg-slate-900/85 border border-slate-800/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          
          {/* Internal Glow Accents */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-500/10 rounded-full filter blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-2xl pointer-events-none" />

          {/* Logo / Security Portal Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-3">
              <img
                src="https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png"
                alt="Logo"
                className="h-20 w-auto bg-slate-950/80 p-2 rounded-full border border-slate-700/50 backdrop-blur shadow-inner relative z-10"
              />
              {/* Outer pulsing ring around logo to signify live security terminal */}
              <span className="absolute -inset-1 rounded-full border border-blue-500/30 animate-pulse pointer-events-none"></span>
            </div>

            <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-1.5 font-sans">
              <Fingerprint className="text-blue-500 w-7 h-7" />
              MagTrack
            </h2>

            {/* Pulsing Active Status Indicator */}
            <div className="flex items-center gap-2 mt-2 bg-slate-950/60 border border-slate-800 rounded-full px-3 py-1 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-widest">
                Access System Secure
              </span>
            </div>
          </div>

          {/* Warning / Errors */}
          {errorMsg && (
            <div className="mb-6 flex items-start gap-2.5 text-xs text-red-200 bg-red-950/40 border border-red-500/30 p-4 rounded-xl shadow-sm">
              <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
              <span className="font-semibold leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg("");
                  }}
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950/50 border border-slate-750/70 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold transition-all duration-200"
                  placeholder="Enter username"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  required
                  className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-950/50 border border-slate-750/70 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold transition-all duration-200 pr-10"
                  placeholder="Enter system password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] mt-3 ${
                loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-blue-500/20 border border-blue-500/20"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-blue-200" />
              )}
              {loading ? "Verifying Credentials..." : "Authorize User"}
            </button>

          </form>

        </div>
      </main>
    </div>
  );
};

export default Login;

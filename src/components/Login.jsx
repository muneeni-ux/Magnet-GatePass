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
        toast.success(data.message || "Password reset link sent to your email.", { duration: 4000 });
        setShowForgotModal(false);
        setForgotEmail("");
        setForgotUsername("");
        setRecoveryAttempts(0);
      } else {
        setRecoveryError("Server error. Please try again.");
      }
    } catch (err) {
      if (err.message === "Failed to fetch") {
        setRecoveryError("Network Error: System unreachable.");
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
          data.message || "Invalid username or password",
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
        setErrorMsg("Network Error: Please check your internet connection.");
      } else {
        setErrorMsg(error.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen h-[100dvh] w-screen overflow-hidden flex flex-col items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-gray-100 font-sans cyber-grid select-none relative">
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2.5 rounded-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md shadow-md text-slate-800 dark:text-white hover:scale-105 active:scale-95 transition-all z-30 flex items-center justify-center group"
      >
        {theme === 'dark' ? <Sun size={18} className="text-emerald-400 group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={18} className="text-blue-600 group-hover:-rotate-12 transition-transform duration-500" />}
      </button>

      {/* Decorative Ambient Orbs */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 dark:bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse delay-700"></div>

      {/* Top Spacer for Vertical Center */}
      <div className="flex-1 min-h-[8px]"></div>

      {/* Non-Scrollable Login Card */}
      <div className="w-full max-w-[380px] sm:max-w-[400px] relative z-10 my-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="glass-panel dark:glass-panel-dark bg-white/80 dark:bg-slate-900/80 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-white/80 dark:border-slate-800 backdrop-blur-md">
          
          {/* Header Section */}
          <div className="bg-white/40 dark:bg-slate-900/50 border-b border-slate-200/60 dark:border-slate-800 p-4 sm:p-5 text-center backdrop-blur-md relative overflow-hidden">
            <div className="flex justify-center mb-2">
              <div className="p-1.5 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-xl border border-blue-500/20 dark:border-emerald-500/20 shadow-inner">
                <img src="./VisiTrack-L51.png" className="h-8 w-8 object-contain rounded-md" alt="VisiTrack Logo" />
              </div>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              VISITRACK
              <span className="text-blue-600 dark:text-emerald-400">.OS</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
              Visitor Management Portal
            </p>
          </div>

          {/* Form Body */}
          <div className="p-5 sm:p-6 bg-white/30 dark:bg-[#0a0f1c]/50 backdrop-blur-sm">
            {errorMsg && (
              <div className="mb-3.5 bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-2 animate-in slide-in-from-top-2">
                <AlertCircle className="shrink-0 h-4 w-4" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono shadow-inner transition-all placeholder-slate-400 dark:placeholder-slate-600"
                  placeholder="Enter Username"
                  spellCheck="false"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-wider font-mono">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white pl-3.5 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-emerald-500 text-sm font-mono shadow-inner transition-all placeholder-slate-400 dark:placeholder-slate-600"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 transition-colors"
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
                className={`w-full py-3 mt-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex justify-center items-center gap-2 ${
                  loading
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 dark:from-emerald-500 dark:to-teal-600 dark:hover:from-emerald-400 dark:hover:to-teal-500 text-white shadow-blue-500/20 dark:shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5"
                }`}
              >
                {loading ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-center">
              <button 
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-emerald-400 font-bold transition-colors"
              >
                Forgot Password? <span className="text-blue-600 dark:text-emerald-400 underline underline-offset-2">Reset Password</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Spacer for Vertical Center */}
      <div className="flex-1 min-h-[8px]"></div>

      {/* Footer Text (Fits on single screen) */}
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider bg-white/60 dark:bg-slate-900/60 px-3 py-1 rounded-lg backdrop-blur-md shadow-sm border border-slate-200/80 dark:border-slate-800 shrink-0 z-10 mb-1">
        &copy; {new Date().getFullYear()} VisiTrack System
      </p>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 dark:bg-[#070b14]/80 backdrop-blur-md" onClick={() => setShowForgotModal(false)}></div>
          <div className="bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-sm relative z-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/10 dark:bg-emerald-500/10 rounded-2xl border border-blue-500/20 dark:border-emerald-500/20">
                <LockKeyhole className="h-6 w-6 text-blue-600 dark:text-emerald-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
              Password Reset
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs text-center mb-5 font-medium">
              Enter your username and email to receive a password reset link.
            </p>

            {recoveryAttempts >= 3 ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center space-y-4">
                <ShieldCheck className="h-8 w-8 text-red-500 mx-auto animate-pulse" />
                <div>
                  <h4 className="text-red-600 dark:text-red-400 font-bold text-sm">Account Locked</h4>
                  <p className="text-slate-600 dark:text-slate-300 text-xs mt-1">
                    Too many failed attempts. Please contact your system administrator to reactivate your account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setRecoveryError("");
                  }}
                  className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase">Username</label>
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => setForgotUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 font-mono uppercase">Registered Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-sm font-mono focus:outline-none focus:border-blue-500"
                    placeholder="name@email.com"
                  />
                </div>

                {recoveryError && (
                  <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                    <AlertCircle className="shrink-0 h-4 w-4" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setRecoveryError("");
                    }}
                    className="flex-1 py-2.5 text-slate-500 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 bg-blue-600 dark:bg-emerald-500 hover:bg-blue-500 dark:hover:bg-emerald-400 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    {forgotLoading ? "Sending..." : "Reset Password"}
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

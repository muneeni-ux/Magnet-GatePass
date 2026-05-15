import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useEffect } from 'react';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

export default function HostAck() {
  const { token } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [visitor, setVisitor] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  useEffect(() => {
    const fetchVisitor = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/visitors/acknowledge/${token}`);
        setVisitor(res.data);
        if (res.data.isAcknowledged) {
          setSuccess(true);
        }
      } catch (err) {
        toast.error("Invalid token or visitor not found.");
      } finally {
        setFetching(false);
      }
    };
    fetchVisitor();
  }, [token]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleAcknowledge = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${SERVER_URL}/api/visitors/acknowledge/${token}`);
      if (res.data.success) {
        setSuccess(true);
        toast.success("Arrival Acknowledged. Thank you for securing the premises.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to acknowledge visitor. Token might be invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 cyber-grid transition-colors duration-500 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 backdrop-blur-md shadow-lg text-slate-800 dark:text-white hover:scale-110 active:scale-95 transition-all z-[100] flex items-center justify-center group"
      >
        {theme === 'dark' ? <Sun size={20} className="text-amber-400 group-hover:rotate-90 transition-transform duration-500" /> : <Moon size={20} className="text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />}
      </button>
      {/* Decorative Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 p-8 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] text-center relative overflow-hidden backdrop-blur-xl transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
          
          <div className="mx-auto w-16 h-16 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-colors duration-500">
            <ShieldCheck className="w-8 h-8 text-blue-500 dark:text-blue-400" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2 transition-colors duration-500" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Visitor Acknowledgment
          </h1>
          {fetching ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-mono flex justify-center items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading visitor details...
            </p>
          ) : visitor ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-mono transition-colors duration-500">
              Please confirm that you have received visitor <strong className="text-blue-600 dark:text-blue-400 text-base">{visitor.name}</strong>. This action updates the security log at the gate.
            </p>
          ) : (
             <p className="text-red-500 text-sm mb-8 font-mono">
               Visitor not found or invalid token.
             </p>
          )}

          {success ? (
            <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/30 rounded-2xl animate-in zoom-in duration-300 transition-colors duration-500">
              <CheckCircle className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                {visitor?.isAcknowledged ? "Already Acknowledged" : "Successfully Acknowledged"}
              </p>
              <p className="text-emerald-600/70 dark:text-emerald-500/70 text-xs mt-1">
                {visitor?.isAcknowledged ? `You have already confirmed arrival for ${visitor.name}.` : "The security team has been notified."}
              </p>
            </div>
          ) : !fetching && visitor ? (
            <button
              onClick={handleAcknowledge}
              disabled={loading}
              className="w-full relative group overflow-hidden rounded-xl p-[1px]"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300"></span>
              <div className="relative bg-white dark:bg-slate-900 px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-slate-800 dark:text-white font-bold tracking-wide">Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-slate-800 dark:text-white font-bold tracking-widest uppercase text-sm transition-colors duration-300">Confirm Visitor Arrival</span>
                  </>
                )}
              </div>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

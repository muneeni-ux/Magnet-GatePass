import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { HelpCircle, LifeBuoy, PhoneCall, ShieldCheck, Activity, AlertTriangle, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function Footer() {
  const { settings } = useSettings();
  const [showSosModal, setShowSosModal] = useState(false);
  const [dispatchingSos, setDispatchingSos] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleTriggerSosPanic = async () => {
    setDispatchingSos(true);
    try {
      const sosNum = settings?.sosPhone || "0700000000";
      const userName = currentUser?.name || "Security Personnel";
      
      // 1. Post emergency occurrence
      await axios.post(`${SERVER_URL}/api/occurrences`, {
        gate: "Main Gate",
        endTime: new Date().toISOString(),
        unusualOccurrence: "Yes",
        unusualDescription: `🚨 INSTANT SOS PANIC ALERT triggered via Footer by ${userName}`,
        sendEmergencySms: true,
        isEmergency: true,
        submittedBy: currentUser?.id || null,
      }).catch(() => {});

      toast.success("🚨 Emergency SOS Panic Alert dispatched!");
      setShowSosModal(false);

      // 2. Initiate Call
      window.location.href = `tel:${sosNum}`;
    } catch (err) {
      console.error(err);
      toast.error("Failed to dispatch SOS alert");
    } finally {
      setDispatchingSos(false);
    }
  };

  return (
    <footer className="relative mt-auto font-sans z-10">
      {/* Subtle top border glow */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/40 dark:via-emerald-500/40 to-transparent"></div>
      
      <div className="glass-panel border-x-0 border-b-0 border-t border-white/60 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/80 py-6 px-4 md:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand & Status */}
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-emerald-500/10 border border-blue-500/20 dark:border-emerald-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                VISITRACK<span className="text-blue-600 dark:text-emerald-400">.OS</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Visitor Management System
              </p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
            <Link to="/home" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
              Dashboard
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/form" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
              Check-In
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/history" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors">
              History
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/occurrence" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" /> Report Incident
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <Link to="/helpdesk" className="hover:text-blue-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <LifeBuoy className="w-3 h-3 text-blue-500" /> Support
            </Link>
          </div>

          {/* Emergency Call & Copyright */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowSosModal(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-red-500/30 cursor-pointer"
              title={`Call Emergency Hotline (${settings?.sosPhone || "SOS"})`}
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              <span>Emergency Call</span>
            </button>

            <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-4">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Sub-bar */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
          &copy; {new Date().getFullYear()} VisiTrack System — All Rights Reserved.
        </div>
      </div>

      {/* INSTANT SOS PANIC ALERT MODAL */}
      {showSosModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-150">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-md"
            onClick={() => setShowSosModal(false)}
          ></div>
          <div className="bg-white dark:bg-slate-900 border border-red-500/40 shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10 animate-in zoom-in-95 duration-150 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-300 dark:border-red-500/40 shadow-lg animate-pulse">
              <PhoneCall size={32} />
            </div>

            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              🚨 Emergency SOS Panic Alert
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-xs font-medium mb-6 leading-relaxed">
              Are you sure you want to dispatch an instant security panic alert? This will immediately send an Emergency Broadcast SMS to <span className="font-mono font-bold text-red-600">{settings?.sosPhone || "0700000000"}</span> and initiate a call.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTriggerSosPanic}
                disabled={dispatchingSos}
                className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall size={16} /> {dispatchingSos ? "Dispatching SOS..." : "🚨 DISPATCH EMERGENCY SMS & CALL NOW"}
              </button>

              <button
                onClick={() => setShowSosModal(false)}
                className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}

export default Footer;

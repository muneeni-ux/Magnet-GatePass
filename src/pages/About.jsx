import React, { useEffect, useState } from "react";
import { Handshake, Clock, Database, Phone, Shield } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const About = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/inquiry-staff`);
        const data = await response.json();
        setProfiles(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-100 font-sans relative overflow-x-hidden pt-24 md:pt-[100px] cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30">
      
       {/* Decorative Orbs */}
       <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
       <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

       {/* Hero Section */}
       <div className="relative w-full py-20 border-b border-white/60 dark:border-slate-800/80 z-10 animate-in fade-in zoom-in-95 duration-500">
         <div className="text-center max-w-4xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 mb-8 shadow-inner">
                <span className="w-2 h-2 bg-blue-500 dark:bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] dark:shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-600 dark:text-slate-400 font-mono">System Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                ABOUT <span className="text-blue-600 dark:text-emerald-400">VISITRACK</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
                A high-security, dynamic monitoring solution engineered to maintain absolute access control and operational integrity across all facility perimeters.
            </p>
         </div>
      </div>

      {/* Core Features */}
      <section className="py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Core System Capabilities</h2>
                <p className="text-[12px] uppercase font-bold tracking-widest text-slate-500 font-mono">Engineered for absolute accountability</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-emerald-500/50 transition-all group shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Handshake size={100} />
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-inner border border-blue-500/20 dark:border-emerald-500/20">
                   <Handshake size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight font-mono">Controlled Access</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Rigorous entry protocols ensuring precise verification before any entity is cleared for internal routing.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-emerald-500/50 transition-all group shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative overflow-hidden backdrop-blur-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock size={100} />
              </div>
               <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-inner border border-blue-500/20 dark:border-emerald-500/20">
                   <Clock size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight font-mono">Sequential Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Cryptographically secure timelines monitoring entity duration within authorized zones.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 hover:border-blue-400/50 dark:hover:border-emerald-500/50 transition-all group shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative overflow-hidden backdrop-blur-md">
               <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Database size={100} />
              </div>
               <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-emerald-400 group-hover:scale-110 transition-transform shadow-inner border border-blue-500/20 dark:border-emerald-500/20">
                   <Database size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight font-mono">Immutable Records</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Centralized threat-resistant database retaining historical telemetry and structural audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 px-6 border-y border-white/60 dark:border-slate-800/80 bg-white/20 dark:bg-[#0a0f1c]/40 backdrop-blur-md relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Operational Sequence</h2>
                <p className="text-[12px] uppercase font-bold tracking-widest text-slate-500 font-mono">Standard 4-Phase Resolution</p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Acquisition", desc: "Entity parameters are parsed at the primary checkpoint." },
              { step: "02", title: "Verification", desc: "Credentials checked against active clearance databases." },
              { step: "03", title: "Monitoring", desc: "Entity is granted node access under continuous trace." },
              { step: "04", title: "Termination", desc: "Access revoked & timeline finalized upon exit." },
            ].map((item, index) => (
              <div key={index} className="relative p-8 pt-12 bg-white/40 dark:bg-slate-900/60 border border-white/60 dark:border-slate-700/50 rounded-2xl shadow-inner hover:bg-white/60 dark:hover:bg-slate-800/80 transition-all group overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500/10 to-transparent dark:from-emerald-500/10 rounded-bl-3xl"></div>
                <div className="absolute top-4 right-5 text-slate-300 dark:text-slate-700 font-extrabold text-5xl select-none font-mono group-hover:scale-110 transition-transform">
                    {item.step}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3 text-lg relative z-10 font-mono tracking-tight">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm relative z-10 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Support Team</h2>
                <p className="text-[12px] uppercase font-bold tracking-widest text-slate-500 font-mono">Authorized technical and security agents</p>
            </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center gap-4 text-slate-500 py-12">
                <div className="w-8 h-8 rounded-full border-[3px] border-slate-300 dark:border-slate-700 border-t-blue-500 dark:border-t-emerald-500 animate-spin"></div>
                <span className="font-extrabold text-[11px] uppercase tracking-widest font-mono">Fetching Roster Data...</span>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {profiles.map((profile, index) => (
                <div key={index} className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.3)] overflow-hidden hover:border-blue-400/50 dark:hover:border-emerald-500/50 transition-all group backdrop-blur-md">
                  <div className="relative h-72 w-full bg-slate-100 dark:bg-[#0a0f1c] overflow-hidden border-b border-white/60 dark:border-slate-700/50">
                     <div className="absolute inset-0 bg-blue-500/5 dark:bg-emerald-500/5 z-0"></div>
                     <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100 relative z-10 grayscale-[20%] group-hover:grayscale-0"
                    />
                  </div>
                  
                  <div className="p-8 relative">
                      <div className="absolute top-0 right-8 -translate-y-1/2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 text-blue-500 dark:text-emerald-400">
                          <Shield size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1.5 font-mono tracking-tight">{profile.name}</h3>
                      <p className="text-[11px] text-blue-600 dark:text-emerald-400 font-extrabold uppercase tracking-widest mb-6 font-mono">{profile.role}</p>
                      
                    <a href={`tel:${profile.phone}`} className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-700/60 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 dark:hover:from-emerald-600 dark:hover:to-cyan-600 hover:text-white hover:border-transparent transition-all shadow-sm text-xs font-bold font-mono tracking-widest uppercase group/call">
                        <Phone size={14} className="group-hover/call:animate-pulse" /> Comm Link
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WhatsApp Button */}
      <a
        href="https://wa.me/254738380692?text=Hello%20VisiTrack%20System%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:shadow-[0_10px_40px_rgba(16,185,129,0.6)] hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center group border border-emerald-400/30"
        title="Establish Secure COMMS"
      >
        <FaWhatsapp size={28} className="group-hover:scale-110 transition-transform" />
        <span className="absolute right-full mr-4 bg-slate-900/90 text-white text-[10px] font-extrabold uppercase tracking-widest font-mono py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg backdrop-blur-sm border border-slate-800">
            Secure COMMS
        </span>
      </a>
    </div>
  );
};

export default About;

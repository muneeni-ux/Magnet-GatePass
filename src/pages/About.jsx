import React, { useEffect, useState } from "react";
import { Handshake, Clock, ClipboardList, Phone, Shield, Cpu, Database, Users } from "lucide-react";
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
    <div className="min-h-screen bg-slate-950 text-blue-100 font-mono relative overflow-x-hidden pt-16 md:pt-24">
      
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      {/* Hero Section */}
      <div className="relative w-full h-[50vh] flex items-center justify-center border-b border-blue-900/50">
         <div className="absolute inset-0 bg-blue-900/10 z-0"></div>
         <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 grayscale mix-blend-luminosity"
            style={{
                backgroundImage: "url('https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/08/The-Nambale-Magnet-School-Students-tuition-fees.jpg')",
            }}
         ></div>
         <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/50 to-slate-950 z-10"></div>

         <div className="relative z-20 text-center max-w-4xl px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500/30 rounded-full bg-blue-900/20 mb-6 backdrop-blur-sm">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">System Documentation v2.4</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight uppercase module-header">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">MagTrack</span>
            </h1>
            <p className="text-blue-200/70 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans">
                A digitally integrated visitor access control verification system. Designed to enhance institutional security protocols through real-time monitoring, encrypted data logging, and automated identity verification.
            </p>
         </div>
      </div>

      {/* Core Modules (Why MagTrack) */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center gap-4 mb-12 border-b border-blue-900/30 pb-4">
                <Cpu className="text-blue-500" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">System Core Modules</h2>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 border border-blue-900/30 p-8 rounded-sm hover:bg-slate-800/50 transition-all group">
              <div className="w-12 h-12 bg-blue-900/20 rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                   <Handshake className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">Protocol: Reception</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standardized entry procedures ensuring all personnel are vetted before access authorization.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-blue-900/30 p-8 rounded-sm hover:bg-slate-800/50 transition-all group">
               <div className="w-12 h-12 bg-blue-900/20 rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                   <Clock className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">Temporal Log</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Precision timestamping for entry and exit events to maintain accurate duration records.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-blue-900/30 p-8 rounded-sm hover:bg-slate-800/50 transition-all group">
               <div className="w-12 h-12 bg-blue-900/20 rounded-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform border border-blue-500/20">
                   <Database className="text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wide">Data Archival</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure centralized database for retrieval of historical access logs and audit trails.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Workflow (How It Works) */}
      <section className="py-20 px-6 bg-slate-900/30 border-y border-blue-900/30 relative z-10">
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center gap-4 mb-16 justify-center">
                <ClipboardList className="text-blue-500" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Operational Workflow</h2>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Identity Scan", desc: "Visitor data capture & intent verification." },
              { step: "02", title: "Auth Check", desc: "Security clearance & destination confirm." },
              { step: "03", title: "Active Monitor", desc: "Real-time presence tracking on dashboard." },
              { step: "04", title: "Exit Protocol", desc: "Checkout log & session termination." },
            ].map((item, index) => (
              <div key={index} className="relative p-6 pt-12 bg-slate-950 border border-blue-900/30 rounded-sm">
                <div className="absolute top-0 right-0 bg-blue-900/20 text-blue-400 font-bold px-3 py-1 text-xs border-b border-l border-blue-900/50">
                    PHASE {item.step}
                </div>
                <h3 className="font-bold text-white mb-2 uppercase tracking-wide text-sm">{item.title}</h3>
                <p className="text-[10px] text-slate-400 font-sans">{item.desc}</p>
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personnel Grid */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
             <div className="flex items-center gap-4 mb-12 border-b border-blue-900/30 pb-4">
                <Users className="text-blue-500" />
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Authorized Personnel</h2>
            </div>

          {loading ? (
             <div className="flex items-center justify-center gap-4 text-blue-300">
                <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-mono text-xs tracking-widest">RETRIEVING PERSONNEL DATA...</span>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {profiles.map((profile, index) => (
                <div key={index} className="bg-slate-900/80 border border-blue-900/30 p-1 rounded-sm backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
                  <div className="relative h-48 w-full bg-slate-950 mb-4 overflow-hidden group-hover:opacity-90 transition-opacity">
                     <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    <div className="absolute bottom-2 left-3">
                        <p className="text-xs font-bold text-white uppercase tracking-wider">{profile.name}</p>
                        <p className="text-[10px] text-blue-400 uppercase tracking-widest">{profile.role}</p>
                    </div>
                  </div>
                  
                  <div className="px-3 pb-3">
                    <a href={`tel:${profile.phone}`} className="flex items-center justify-between text-xs text-slate-400 hover:text-blue-400 transition-colors p-2 border border-blue-900/30 rounded-sm bg-slate-950/50">
                        <span className="tracking-widest flex items-center gap-2"><Phone size={12}/> COMM LINK</span>
                        <span className="font-mono">{profile.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Secure Comms Button */}
      <a
        href="https://wa.me/254743072126?text=Hello%20Nambale%20Magnet%20School%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600/90 text-white p-4 rounded-sm border border-green-400/50 shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] flex items-center justify-center transition-all duration-300 z-50 group"
        title="Encrypted Chat Protocol"
      >
        <FaWhatsapp size={24} className="group-hover:scale-110 transition-transform"/>
        <span className="absolute right-full mr-3 bg-slate-900 text-green-400 text-[10px] font-bold px-2 py-1 rounded-sm border border-green-900/50 opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity pointer-events-none uppercase tracking-widest">
            Secure Chat
        </span>
      </a>
    </div>
  );
};

export default About;

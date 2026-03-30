import React, { useEffect, useState } from "react";
import { Handshake, Clock, Database, Phone, Info } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-sans relative overflow-x-hidden pt-16 md:pt-24">
      
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" 
            style={{
                backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                backgroundSize: "60px 60px"
            }}>
        </div>

       {/* Hero Section */}
       <div className="relative w-full py-20 border-b border-slate-200 dark:border-slate-800 z-10">
         <div className="text-center max-w-4xl mx-auto px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 mb-6">
                <Info className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">System Overview</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
                About Visitrack
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
                A comprehensive visitor management solution designed to enhance security, streamline access control, and provide real-time insights for the institution.
            </p>
         </div>
      </div>

      {/* Core Features */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Core System Capabilities</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Designed for efficiency, security, and accountability.</p>
            </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group shadow-lg">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform border border-blue-500/10">
                   <Handshake />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Controlled Access</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Standardized entry protocols ensuring every visitor is verified and authorized before granting access to the premises.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group shadow-lg">
               <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform border border-blue-500/10">
                   <Clock />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Time Tracking</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Precise digital logging of entry and exit times to monitor visitor duration and ensure campus safety.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all group shadow-lg">
               <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform border border-blue-500/10">
                   <Database />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Secure Records</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                Centralized, encrypted database for historical logs, audit trails, and reporting on visitor traffic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 px-6 border-y border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 relative z-10">
        <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">How It Works</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">A seamless 4-step process for managing visitor flow.</p>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Registration", desc: "Visitor details are captured at the gate." },
              { step: "02", title: "Verification", desc: "Identity and purpose of visit are confirmed." },
              { step: "03", title: "Entry Log", desc: "Visitor is checked in and monitored." },
              { step: "04", title: "Checkout", desc: "Exit is recorded upon departure." },
            ].map((item, index) => (
              <div key={index} className="relative p-6 pt-12 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-4 right-4 text-slate-700 font-bold text-4xl select-none">
                    {item.step}
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 text-lg relative z-10">{item.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Security Support Team</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">Dedicated personnel ensuring campus safety and system operation.</p>
            </div>

          {loading ? (
             <div className="flex items-center justify-center gap-4 text-slate-500 py-12">
                <div className="w-4 h-4 bg-slate-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-sm">Loading personnel data...</span>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {profiles.map((profile, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden hover:border-slate-400 dark:hover:border-slate-600 transition-all group">
                  <div className="relative h-64 w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
                     <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                    />
                  </div>
                  
                  <div className="p-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{profile.name}</h3>
                      <p className="text-sm text-blue-400 font-medium mb-4">{profile.role}</p>
                      
                    <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-sm font-medium">
                        <Phone size={14}/> {profile.phone}
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
        href="https://wa.me/254743072126?text=Hello%20Nambale%20Magnet%20School%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 text-slate-900 dark:text-white p-4 rounded-full shadow-lg hover:bg-green-500 hover:shadow-green-900/20 hover:-translate-y-1 transition-all duration-300 z-50 flex items-center justify-center"
        title="Contact Support"
      >
        <FaWhatsapp size={24} />
      </a>
    </div>
  );
};

export default About;

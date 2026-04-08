import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LifeBuoy,
  BookOpen,
  AlertTriangle,
  Lock,
  Phone,
  Mail,
  ShieldAlert,
  HelpCircle,
  Cpu,
  ChevronRight,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AccordionItem = ({ title, icon: Icon, children, isOpen, onClick }) => {
  return (
    <div className={`glass-panel border ${isOpen ? 'border-blue-500/50 dark:border-cyan-500/50 scale-[1.01] shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]' : 'border-white/60 dark:border-slate-700/50'} rounded-2xl overflow-hidden transition-all duration-300 dark:glass-panel-dark backdrop-blur-md`}>
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl shadow-inner border transition-colors ${isOpen ? 'bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border-blue-500/20 dark:border-cyan-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            <Icon size={22} />
          </div>
          <h3 className={`text-lg font-bold tracking-tight font-mono ${isOpen ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
            {title}
          </h3>
        </div>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500 dark:text-cyan-400' : ''}`} />
      </button>
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden bg-white/20 dark:bg-[#0a0f1c]/40 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-6 border-t border-white/40 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

const HelpDesk = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState("auth");
  const [sendingSupport, setSendingSupport] = useState(false);
  const [supportSent, setSupportSent] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));

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

  const handleSupportEmail = async () => {
    setSendingSupport(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/email/send-mail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser?.username || "Terminal Operator",
          email: currentUser?.email || "operator@visitrack.local",
          subject: "VisiTrack CRITICAL Tech Support Request",
          message: "An operator has requested immediate technical integration support from the Help Desk terminal."
        }),
      });
      
      if (response.ok) {
        setSupportSent(true);
        setTimeout(() => setSupportSent(false), 5000);
      }
    } catch (error) {
      console.error("Support ping failed:", error);
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-100 font-sans relative overflow-x-hidden pt-24 md:pt-[100px] pb-24 cyber-grid selection:bg-blue-500/30 dark:selection:bg-cyan-500/30">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse delay-700"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/60 dark:border-slate-800 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/50 dark:bg-slate-900/50 border border-white/60 dark:border-slate-800 mb-6 shadow-inner">
                <LifeBuoy size={14} className="text-blue-600 dark:text-cyan-400 animate-spin-slow" />
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-600 dark:text-slate-400 font-mono">Operator Support Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              TERMINAL <span className="text-blue-600 dark:text-cyan-400">HELP DESK</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-3 max-w-2xl">
              Central repository for operational guidelines, emergency protocols, and direct communication channels to the technical team.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/faq')}
            className="group flex justify-between items-center gap-4 bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/60 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all shadow-sm w-full md:w-auto"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 rounded-xl">
                 <HelpCircle size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white font-mono">View System FAQs</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest">Common Solutions</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-all" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Manual & Accordion Area */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight font-mono border-l-4 border-blue-500 dark:border-cyan-500 pl-4">
              Operational Manual
            </h2>

            <AccordionItem 
              title="Access & Credential Recovery" 
              icon={Lock} 
              isOpen={openAccordion === 'auth'} 
              onClick={() => setOpenAccordion(openAccordion === 'auth' ? '' : 'auth')}
            >
              <div className="space-y-4">
                <p>If an operator fails to verify their credentials <strong className="text-red-500">3 consecutive times</strong>, the terminal will automatically engage a security lockdown, disabling the account entirely.</p>
                
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-4 mt-6">
                   <ShieldAlert className="text-red-600 dark:text-red-400 shrink-0 mt-1" size={24} />
                   <div>
                     <h4 className="font-black text-red-600 dark:text-red-400 text-sm uppercase tracking-wider mb-1">During Lockdown Protocol</h4>
                     <p className="text-sm font-medium text-red-900/80 dark:text-red-200/60">
                        Do not attempt to reconnect. Physical verification is mandated. The operator must report to the Chief Security Box or the Duty Administrator to verify their identity and reactivate the clearance profile.
                     </p>
                   </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Standard Password Recovery:</h4>
                  <ul className="list-disc pl-5 space-y-2 text-sm marker:text-blue-500 dark:marker:text-cyan-500">
                    <li>Click on <strong>"Initiate Recovery"</strong> on the Login Module.</li>
                    <li>Enter your exact assigned Terminal Username and Registered Email.</li>
                    <li>If matched, a secure temporary access token will be dispatched to the email.</li>
                  </ul>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem 
              title="Incident & Emergency Procedures" 
              icon={AlertTriangle} 
              isOpen={openAccordion === 'emergency'} 
              onClick={() => setOpenAccordion(openAccordion === 'emergency' ? '' : 'emergency')}
            >
               <div className="space-y-4">
                <p>In the event of a physical perimeter breach, altercation, or unapproved package discovery, the operator must immediately lock the terminal down and execute the SOS protocol.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl relative overflow-hidden group">
                     <div className="absolute -right-4 -top-4 opacity-10">
                        <Phone size={80} />
                     </div>
                     <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-2 text-sm uppercase tracking-widest font-mono">1. Alarm Activation</h4>
                     <p className="text-xs">Trigger the physical panic button. Use the <strong>SOS red button</strong> located on the Navbar to instantly establish an emergency communication link with regional authorities.</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 dark:bg-cyan-500/10 dark:border-cyan-500/20 rounded-xl relative overflow-hidden group">
                     <div className="absolute -right-4 -top-4 opacity-10">
                        <BookOpen size={80} />
                     </div>
                     <h4 className="font-bold text-blue-700 dark:text-cyan-400 mb-2 text-sm uppercase tracking-widest font-mono">2. Logging</h4>
                     <p className="text-xs">Once the situation is stabilized, navigate to the <strong className="cursor-pointer underline">Incident Report</strong> section via your profile dropdown and submit a detailed unalterable database entry.</p>
                  </div>
                </div>
              </div>
            </AccordionItem>

             <AccordionItem 
              title="Visitor Management Subroutines" 
              icon={ShieldCheck} 
              isOpen={openAccordion === 'visitor'} 
              onClick={() => setOpenAccordion(openAccordion === 'visitor' ? '' : 'visitor')}
            >
               <div className="space-y-4 text-sm">
                <p><strong>Checking In:</strong> Ensure all fields, particularly the ID Number and Vehicle Registration (if applicable), accurately match the presented physical documents. The system hashes ID fields automatically upon export for PDPA compliance.</p>
                <p><strong>Overstays:</strong> Visitors remaining beyond business hours will automatically be flagged. Check the <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-xs">Archives</span> section periodically using the "Overstayed" filter to clear out forgotten checkouts.</p>
              </div>
            </AccordionItem>
          </div>

          {/* Sidebar / Tech Support Area */}
          <div className="lg:col-span-4 space-y-6">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight font-mono border-l-4 border-blue-500 dark:border-cyan-500 pl-4">
              COMMS LINK
            </h2>

            {/* Developer Contact Card */}
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-[2rem] border border-indigo-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px]"></div>
                <div className="absolute -bottom-6 -right-6 opacity-20 group-hover:scale-110 transition-transform duration-700">
                   <Cpu size={120} />
                </div>
                
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-4">
                     <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                     <h3 className="text-sm font-extrabold uppercase tracking-widest font-mono text-cyan-400">Software Integration</h3>
                   </div>
                   <h4 className="text-2xl font-bold mb-2 tracking-tight">Level 4 Technician</h4>
                   <p className="text-xs text-indigo-200 mb-6 font-medium leading-relaxed">
                     For critical system failures, database faults, or suspected cyber-intrusions, establish an encrypted mail link directly to the root developer.
                   </p>
                   
                   <button 
                     onClick={handleSupportEmail}
                     disabled={sendingSupport || supportSent}
                     className={`inline-flex items-center justify-center gap-2 w-full py-3.5 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-colors font-mono relative overflow-hidden group/btn border custom-shadow ${
                       supportSent 
                        ? "bg-green-600 border-green-400/50" 
                        : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/50 hover:border-white/50"
                     }`}
                   >
                     <span className="relative z-10 flex items-center gap-2">
                       {sendingSupport ? (
                         <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                       ) : supportSent ? (
                         <>
                           <ShieldCheck size={16} /> Link Established Await Feedback
                         </>
                       ) : (
                         <>
                           <Mail size={16} /> Establish Mail Link
                         </>
                       )}
                     </span>
                   </button>
                </div>
            </div>

            {/* Support Staff List */}
            <div className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-[2rem] p-6 backdrop-blur-md">
              <h3 className="text-sm font-extrabold uppercase tracking-widest mb-4 font-mono text-slate-800 dark:text-slate-200">On-Site Command Staff</h3>
              
              {loading ? (
                 <div className="flex flex-col items-center justify-center gap-3 text-slate-500 py-8">
                    <div className="w-6 h-6 rounded-full border-[2px] border-slate-300 dark:border-slate-700 border-t-blue-500 dark:border-t-cyan-500 animate-spin"></div>
                    <span className="font-extrabold text-[10px] uppercase tracking-widest font-mono">Syncing Roster...</span>
                 </div>
              ) : (
                <div className="space-y-3">
                  {profiles.slice(0, 3).map((profile, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/50 rounded-xl hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
                       <div className="flex items-center gap-3">
                         <img src={profile.image} alt={profile.name} className="w-10 h-10 rounded-lg object-cover grayscale-[30%]" />
                         <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white font-mono tracking-tight">{profile.name}</h4>
                            <p className="text-[10px] font-extrabold text-blue-600 dark:text-cyan-400 uppercase tracking-widest">{profile.role}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <a href={`tel:${profile.phone}`} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-cyan-500/20 dark:hover:text-cyan-400 transition-colors">
                            <Phone size={14} />
                         </a>
                         {profile.email && (
                            <a href={`mailto:${profile.email}`} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-cyan-500/20 dark:hover:text-cyan-400 transition-colors">
                              <Mail size={14} />
                            </a>
                         )}
                       </div>
                    </div>
                  ))}
                  
                  {profiles.length > 3 && (
                    <div className="text-center pt-2">
                      <Link to="/about" className="text-xs font-bold font-mono text-blue-600 dark:text-cyan-400 hover:underline uppercase tracking-wide">
                        View Complete Directory →
                      </Link>
                    </div>
                  )}
                  {profiles.length === 0 && (
                     <div className="text-xs text-slate-500 text-center py-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium">No active command staff located.</div>
                  )}
                </div>
              )}
            </div>

            {/* Quick WhatsApp SOS */}
             <div className="glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-[2rem] p-6 backdrop-blur-md flex items-center justify-between group overflow-hidden relative">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="relative z-10">
                   <h3 className="text-sm font-extrabold uppercase tracking-widest mb-1 font-mono text-emerald-600 dark:text-emerald-400">Regional HQ</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Secured encrypted line via WhatsApp</p>
                </div>
                <a 
                  href="https://wa.me/254738380692?text=Emergency%20or%20Incident%20Report%20via%20VisiTrack%20System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 w-12 h-12 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] group-hover:scale-105 group-hover:-rotate-3 transition-transform"
                >
                  <FaWhatsapp size={24} />
                </a>
             </div>
             
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDesk;
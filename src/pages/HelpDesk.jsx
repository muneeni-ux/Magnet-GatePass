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
        className="w-full flex items-center justify-between p-5 md:p-6 text-left bg-white/40 dark:bg-slate-800/40 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className={`p-2.5 rounded-xl shadow-inner border transition-colors ${isOpen ? 'bg-blue-500/10 dark:bg-cyan-500/10 text-blue-600 dark:text-cyan-400 border-blue-500/20 dark:border-cyan-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
            <Icon size={20} />
          </div>
          <h3 className={`text-base md:text-lg font-bold tracking-tight ${isOpen ? 'text-blue-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>
            {title}
          </h3>
        </div>
        <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500 dark:text-cyan-400' : ''}`} />
      </button>
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden bg-white/20 dark:bg-[#0a0f1c]/40 ${isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="p-5 md:p-6 border-t border-white/40 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-sm">
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
          name: currentUser?.username || "User",
          email: currentUser?.email || "user@visitrack.local",
          subject: "VisiTrack Technical Support Request",
          message: "A user has requested technical support from the Help Desk."
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-100 font-sans relative overflow-x-hidden pt-20 md:pt-24 pb-28 md:pb-12 cyber-grid">
      
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse delay-700"></div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 mb-4 shadow-sm">
                <LifeBuoy size={14} className="text-blue-600 dark:text-cyan-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Support Center</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              HELP DESK & <span className="text-blue-600 dark:text-cyan-400">SUPPORT</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 max-w-xl">
              User guidelines, emergency contacts, and technical assistance.
            </p>
          </div>
          
          <button
            onClick={() => navigate('/faq')}
            className="group flex items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm w-full md:w-auto"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-cyan-500/20 text-blue-600 dark:text-cyan-400 rounded-xl">
                 <HelpCircle size={20} />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">System FAQs</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Common Questions & Solutions</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 dark:group-hover:text-cyan-400 transition-all" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Help Accordion */}
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 border-l-4 border-blue-500 dark:border-cyan-500 pl-3">
              Help Guides
            </h2>

            <AccordionItem 
              title="Account Access & Password Help" 
              icon={Lock} 
              isOpen={openAccordion === 'auth'} 
              onClick={() => setOpenAccordion(openAccordion === 'auth' ? '' : 'auth')}
            >
              <div className="space-y-3">
                <p>If a user enters an incorrect password <strong className="text-red-500">3 consecutive times</strong>, the account will be temporarily locked for security.</p>
                
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-3 mt-4">
                   <ShieldAlert className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" size={22} />
                   <div>
                     <h4 className="font-bold text-red-600 dark:text-red-400 text-sm uppercase tracking-wider mb-1">Account Lockout Procedure</h4>
                     <p className="text-xs font-medium text-red-900/80 dark:text-red-200/70">
                        Do not attempt multiple failed logins. Contact your administrator to verify your identity and unlock your account.
                     </p>
                   </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Standard Password Recovery:</h4>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li>Click on <strong>"Reset Password"</strong> on the Login page.</li>
                    <li>Enter your assigned Username and Registered Email.</li>
                    <li>A temporary reset link will be sent to your email.</li>
                  </ul>
                </div>
              </div>
            </AccordionItem>

            <AccordionItem 
              title="Emergency Procedures" 
              icon={AlertTriangle} 
              isOpen={openAccordion === 'emergency'} 
              onClick={() => setOpenAccordion(openAccordion === 'emergency' ? '' : 'emergency')}
            >
               <div className="space-y-3">
                <p>In the event of an emergency or security incident, take immediate action using the guidelines below:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl relative overflow-hidden">
                     <h4 className="font-bold text-orange-700 dark:text-orange-400 mb-1 text-sm">1. Emergency Call</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-300">Tap the red <strong>Emergency Call button</strong> in the header or footer to contact emergency help immediately.</p>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 dark:bg-cyan-500/10 dark:border-cyan-500/20 rounded-2xl relative overflow-hidden">
                     <h4 className="font-bold text-blue-700 dark:text-cyan-400 mb-1 text-sm">2. Submit Incident Report</h4>
                     <p className="text-xs text-slate-600 dark:text-slate-300">Go to <strong>Report Incident</strong> from the navigation menu and submit details of the occurrence.</p>
                  </div>
                </div>
              </div>
            </AccordionItem>

             <AccordionItem 
              title="Visitor Check-In Guidelines" 
              icon={ShieldCheck} 
              isOpen={openAccordion === 'visitor'} 
              onClick={() => setOpenAccordion(openAccordion === 'visitor' ? '' : 'visitor')}
            >
               <div className="space-y-3 text-sm">
                <p><strong>Checking In Visitors:</strong> Fill in the visitor's Full Name, ID/Passport Number, and Mobile Number on the Check-In form. Select the destination department to notify staff automatically.</p>
                <p><strong>Checking Out:</strong> Go to the <strong>Visitor History</strong> page and click <strong>Check Out</strong> next to the visitor's record when they depart.</p>
              </div>
            </AccordionItem>
          </div>

          {/* Sidebar / Support Contact */}
          <div className="lg:col-span-4 space-y-6">
             <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 border-l-4 border-blue-500 dark:border-cyan-500 pl-3">
              Support Contacts
            </h2>

            {/* Direct Support Card */}
            <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-3">
                     <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                     <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">Technical Support</h3>
                   </div>
                   <h4 className="text-xl font-bold mb-2">Need Direct Help?</h4>
                   <p className="text-xs text-indigo-200 mb-5 leading-relaxed">
                     Have technical issues or system questions? Send an instant message directly to our IT support team.
                   </p>
                   
                   <button 
                     onClick={handleSupportEmail}
                     disabled={sendingSupport || supportSent}
                     className={`inline-flex items-center justify-center gap-2 w-full py-3 px-4 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border ${
                       supportSent 
                        ? "bg-emerald-600 border-emerald-400" 
                        : "bg-indigo-600 hover:bg-indigo-500 border-indigo-400/50"
                     }`}
                   >
                     {sendingSupport ? (
                       <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                     ) : supportSent ? (
                       <>
                         <ShieldCheck size={16} /> Support Message Sent!
                       </>
                     ) : (
                       <>
                         <Mail size={16} /> Send Support Message
                       </>
                     )}
                   </button>
                </div>
            </div>

            {/* Support Staff Directory */}
            <div className="glass-panel dark:glass-panel-dark border border-white/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
              <h3 className="text-xs font-extrabold uppercase tracking-wider mb-4 text-slate-700 dark:text-slate-300">Duty Support Staff</h3>
              
              {loading ? (
                 <div className="flex flex-col items-center justify-center gap-2 text-slate-500 py-6">
                    <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-blue-500 animate-spin"></div>
                    <span className="text-xs font-bold">Loading staff directory...</span>
                 </div>
              ) : (
                <div className="space-y-3">
                  {profiles.slice(0, 3).map((profile, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl">
                       <div className="flex items-center gap-3">
                         <img src={profile.image} alt={profile.name} className="w-9 h-9 rounded-lg object-cover" />
                         <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">{profile.name}</h4>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 uppercase">{profile.role}</p>
                         </div>
                       </div>
                       <div className="flex gap-1.5">
                         <a href={`tel:${profile.phone}`} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:text-blue-600 transition-colors">
                            <Phone size={14} />
                         </a>
                         {profile.email && (
                            <a href={`mailto:${profile.email}`} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:text-blue-600 transition-colors">
                              <Mail size={14} />
                            </a>
                         )}
                       </div>
                    </div>
                  ))}
                  
                  {profiles.length === 0 && (
                     <div className="text-xs text-slate-500 text-center py-3 bg-slate-100 dark:bg-slate-800/50 rounded-xl font-medium">No support staff listed.</div>
                  )}
                </div>
              )}
            </div>

            {/* Quick WhatsApp Support */}
             <div className="glass-panel dark:glass-panel-dark border border-white/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div>
                   <h3 className="text-xs font-bold uppercase tracking-wider mb-0.5 text-emerald-600 dark:text-emerald-400">WhatsApp Support</h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chat directly on WhatsApp</p>
                </div>
                <a 
                  href="https://wa.me/254738380692?text=Support%20Request%20via%20VisiTrack%20System"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center bg-emerald-500 text-white rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                  <FaWhatsapp size={20} />
                </a>
             </div>
             
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpDesk;
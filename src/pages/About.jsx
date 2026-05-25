// src/pages/About.jsx
import React, { useEffect, useState } from "react";
import { Handshake, Clock, ClipboardList, Phone, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const FAQ_HELP_ITEMS = [
  {
    q: "How do I register a new visitor?",
    a: "Navigate to the 'Form' tab in the navigation bar. Complete Step 1 (Personal details like Name and ID), Step 2 (Phone, Vehicle, Group checkbox if applicable), and Step 3 (Gate and Destination Department). Review your details on Step 4 and click 'Approve & Submit' to finalize. The visitor will be successfully logged in the system."
  },
  {
    q: "What if the internet or Wi-Fi goes offline?",
    a: "MagTrack features advanced PWA Offline support! If the network fails, go ahead and submit the registration form normally. The system will save the visitor pass securely on your device's offline IndexedDB cache and show an amber status. When connectivity returns, the Navbar's sync engine will automatically upload all queued entries in the background without losing any records!"
  },
  {
    q: "How do I check out (Time Out) a visitor?",
    a: "Navigate to the 'History' tab. Locate the visitor's record (you can search by Name, ID, or filter by 'Active' to see currently checked-in people). Click the red 'Time Out' button next to their name. The system will calculate their duration of visit and log the checkout. If offline, the timeout will be queued and synced automatically on connectivity restoration."
  },
  {
    q: "How do I log an incident in the Occurrence Book?",
    a: "Click your User Icon in the top-right corner of the Navbar and select 'Occurrence Book'. This directs you to the log sheet where you can report school-gate incidents, security reports, or handovers. Just fill out the description and submit."
  },
  {
    q: "Who should I contact for administrative issues?",
    a: "For credential modifications, system malfunctions, or account resets, please consult the Inquiry & Support Staff listed below on this page. You can click their numbers to initiate direct phone calls, or click the floating WhatsApp button to chat directly with System Support."
  }
];

const About = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState(null);

  const toggleAccordion = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/inquiry-staff`);
        const data = await response.json();
        setProfiles(data);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden font-sans transition-colors duration-300 bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* Hero Section */}
      <div
        className="w-full min-h-[45vh] bg-cover bg-center flex items-center justify-center text-center px-4 relative pt-16"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(3, 7, 18, 0.95)), url('https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/08/The-Nambale-Magnet-School-Students-tuition-fees.jpg')",
        }}
      >
        <div className="max-w-3xl px-6">
          <h1 className="text-4xl sm:text-5xl text-white font-extrabold tracking-tight mb-4">
            About MagTrack
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A state-of-the-art digital gatekeeper management system designed for 
            <strong> Nambale Magnet School</strong>. Facilitates secure logging, time metrics, 
            PWA offline operations, and premium executive reporting.
          </p>
        </div>
      </div>

      {/* Why MagTrack Section */}
      <section className="w-full py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-10 tracking-tight">
          Smarter Gate Security
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass bg-white dark:bg-slate-900 p-6 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm text-center hover:scale-[1.02] transition duration-300">
            <Handshake size={36} className="text-blue-500 mb-3 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Welcoming & Secure
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Ensures every visitor is registered professionally while enforcing school safety procedures.
            </p>
          </div>

          <div className="glass bg-white dark:bg-slate-900 p-6 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm text-center hover:scale-[1.02] transition duration-300">
            <Clock size={36} className="text-indigo-500 mb-3 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Time Audit Logs
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Tracks durations and timestamps automatically for transparent trace-auditing.
            </p>
          </div>

          <div className="glass bg-white dark:bg-slate-900 p-6 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-sm text-center hover:scale-[1.02] transition duration-300">
            <ClipboardList size={36} className="text-amber-500 mb-3 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              PWA Offline Sync
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Form records save locally during network outages and automatically sync on restoration.
            </p>
          </div>

        </div>
      </section>

      {/* Interactive Help Desk Accordion Section */}
      <section className="w-full py-12 px-6 max-w-4xl mx-auto">
        <div className="glass bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 p-8 rounded-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="text-blue-500 w-7 h-7" />
            <h2 className="text-2xl font-extrabold tracking-tight">Help Desk Info Center</h2>
          </div>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-semibold leading-relaxed">
            Stuck or dealing with an issue? Click any guide below to find step-by-step instructions.
          </p>

          <div className="space-y-3">
            {FAQ_HELP_ITEMS.map((item, index) => {
              const isOpen = openAccordion === index;
              return (
                <div 
                  key={index}
                  className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/20"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base hover:bg-slate-100/50 dark:hover:bg-slate-950/40 transition"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 animate-fade-in">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Inquiry Support Staff Section */}
      <section className="w-full py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 dark:text-white mb-10 tracking-tight">
          Inquiry & Support Staff
        </h2>

        {loading ? (
          <p className="text-center text-slate-400 font-bold animate-pulse">
            Loading support profiles...
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {profiles.map((profile, index) => (
              <div
                key={index}
                className="glass bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-6 text-center hover:scale-[1.01] hover:shadow-md transition duration-300"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 shadow-md">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {profile.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide mt-1">
                  {profile.role}
                </p>

                <div className="mt-4">
                  <a
                    href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-500 dark:text-blue-400 hover:underline"
                  >
                    <Phone size={14} />
                    <span>{profile.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254738380692?text=Hello%20Nambale%20Magnet%20School%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4.5 rounded-full shadow-lg flex items-center justify-center animate-bounce transition duration-300 z-30"
        title="Chat with Support on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
};

export default About;

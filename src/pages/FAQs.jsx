import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/api/faq`);
        setFaqs(res.data.filter((t) => t.isVerified));
      } catch (err) {
        console.error("Failed to fetch FAQs:", err);
      }
    };
    fetchFAQs();
  }, []);

  const toggle = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] text-slate-800 dark:text-slate-100 font-sans p-4 md:p-6 pt-24 md:pt-[100px] relative cyber-grid selection:bg-blue-500/30 dark:selection:bg-emerald-500/30 overflow-hidden flex justify-center items-start">
       {/* Decorative Orbs */}
       <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
       <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700"></div>

      <div className="w-full max-w-4xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-emerald-500/10 dark:to-cyan-500/10 border border-blue-500/20 dark:border-emerald-500/20 text-blue-600 dark:text-emerald-400 rounded-full mb-6 shadow-inner">
                <HelpCircle className="w-5 h-5" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest font-mono">Support Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                FREQUENTLY ASKED <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-emerald-400 dark:to-cyan-400">QUESTIONS</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                Comprehensive knowledge base and operational guidelines for the Visitrack OS Terminal.
            </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
            {faqs.length === 0 && (
                <div className="p-12 text-center glass-panel dark:glass-panel-dark border border-white/60 dark:border-slate-700/50 rounded-3xl">
                    <p className="text-slate-500 dark:text-slate-400 font-mono text-sm tracking-widest uppercase">
                        Loading knowledge base...
                    </p>
                </div>
            )}

            {faqs.map((faq, index) => (
            <div
                key={faq.id || index}
                className={`glass-panel dark:glass-panel-dark border transition-all duration-300 overflow-hidden rounded-[1.5rem] ${activeIndex === index ? 'border-blue-500/50 dark:border-emerald-500/50 shadow-[0_10px_30px_rgba(59,130,246,0.1)] dark:shadow-[0_10px_30px_rgba(16,185,129,0.1)]' : 'border-white/60 dark:border-slate-700/50 hover:border-blue-500/30 dark:hover:border-emerald-500/30'}`}
            >
                {/* Question */}
                <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left p-6 md:p-8 focus:outline-none"
                >
                <div className="flex items-center gap-4">
                    <span className={`text-base md:text-lg font-bold transition-colors ${activeIndex === index ? 'text-blue-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                        {faq.question}
                    </span>
                </div>
                <div className={`p-2 rounded-xl transition-colors ${activeIndex === index ? 'bg-blue-500/10 dark:bg-emerald-500/10 text-blue-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400'}`}>
                    {activeIndex === index ? (
                        <ChevronUp size={20} />
                    ) : (
                        <ChevronDown size={20} />
                    )}
                </div>
                </button>

                {/* Answer */}
                <div
                className={`transition-all duration-500 ease-in-out ${
                    activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
                >
                <div className="px-6 md:px-8 pb-8 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base border-t border-white/30 dark:border-slate-700/30 pt-6 mt-2 mx-2">
                    {faq.answer}
                </div>
                </div>
            </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default FAQs;

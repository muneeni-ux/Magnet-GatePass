import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp, HelpCircle, Terminal } from "lucide-react";

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
    <div className="min-h-screen bg-slate-950 text-blue-100 font-mono px-6 py-24 relative overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
            style={{
                backgroundImage: "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
                backgroundSize: "40px 40px"
            }}>
        </div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Heading */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500/30 rounded-full bg-blue-900/20 mb-6 backdrop-blur-sm">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-bold tracking-widest uppercase text-blue-300">System Assistance</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 uppercase tracking-wider">
                Authorized Query Log
            </h1>
            <p className="text-blue-200/60 text-sm font-sans max-w-2xl mx-auto">
                Common operational protocols and system navigation directives.
            </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
            {faqs.length === 0 && (
                <div className="p-8 border border-blue-900/30 rounded-sm bg-slate-900/50 text-center">
                    <p className="text-blue-400/50 uppercase tracking-widest text-sm animate-pulse">
                        Searching Knowledge Base... No Entries Found.
                    </p>
                </div>
            )}

            {faqs.map((faq, index) => (
            <div
                key={faq.id}
                className="group border border-blue-900/30 rounded-sm bg-slate-900/40 hover:bg-slate-900/80 hover:border-blue-500/30 transition-all overflow-hidden backdrop-blur-sm"
            >
                {/* Question */}
                <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left p-6 focus:outline-none"
                >
                <div className="flex items-center gap-4">
                    <Terminal size={18} className={`text-blue-500 transition-opacity ${activeIndex === index ? 'opacity-100' : 'opacity-50'}`} />
                    <span className={`text-sm md:text-base font-bold uppercase tracking-wide transition-colors ${activeIndex === index ? 'text-white' : 'text-blue-200 group-hover:text-white'}`}>
                        {faq.question}
                    </span>
                </div>
                {activeIndex === index ? (
                    <ChevronUp className="text-blue-400" />
                ) : (
                    <ChevronDown className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                )}
                </button>

                {/* Answer */}
                <div
                className={`transition-all duration-300 ease-in-out ${
                    activeIndex === index ? "max-h-96 opacity-100 border-t border-blue-900/30" : "max-h-0 opacity-0"
                } overflow-hidden`}
                >
                <div className="p-6 bg-slate-950/30 text-slate-300 text-sm leading-relaxed font-sans border-l-2 border-blue-500 ml-6 my-2">
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

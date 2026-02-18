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
    <div className="min-h-screen bg-slate-900 text-slate-300 font-sans px-6 py-24 relative overflow-hidden">
       
       {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" 
            style={{
                backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                backgroundSize: "60px 60px"
            }}>
        </div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* Heading */}
        <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full mb-6">
                <HelpCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wide">Support Center</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
            </h1>
            <p className="text-slate-400 text-lg">
                Common questions about the MagTrack Visitor Management System.
            </p>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
            {faqs.length === 0 && (
                <div className="p-12 text-center border border-slate-800 rounded-xl bg-slate-800/50">
                    <p className="text-slate-500">
                        Loading knowledge base...
                    </p>
                </div>
            )}

            {faqs.map((faq, index) => (
            <div
                key={faq.id}
                className={`border rounded-xl bg-slate-800 transition-all overflow-hidden ${activeIndex === index ? 'border-blue-500 shadow-lg shadow-blue-900/20' : 'border-slate-700 hover:border-slate-600'}`}
            >
                {/* Question */}
                <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left p-6 focus:outline-none"
                >
                <div className="flex items-center gap-4">
                    <span className={`text-base font-semibold transition-colors ${activeIndex === index ? 'text-blue-400' : 'text-slate-200'}`}>
                        {faq.question}
                    </span>
                </div>
                {activeIndex === index ? (
                    <ChevronUp className="text-blue-500" />
                ) : (
                    <ChevronDown className="text-slate-500" />
                )}
                </button>

                {/* Answer */}
                <div
                className={`transition-all duration-300 ease-in-out ${
                    activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                } overflow-hidden`}
                >
                <div className="px-6 pb-6 text-slate-400 leading-relaxed text-sm">
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

import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 px-6 py-20 sm:px-12 lg:px-24 font-sans text-slate-800 dark:text-slate-200 mt-0 md:mt-4 transition-colors duration-300">

      {/* Heading */}
      <div className="max-w-4xl mx-auto text-center mb-14">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 mb-4">
          🏫 Frequently Asked Questions
        </h1>
        <p className="text-blue-700 dark:text-blue-300 text-lg">
          Clear answers about our system use and how to manuver.
        </p>
        <div className="w-24 h-1 bg-blue-600 mx-auto mt-4 rounded-full" />
      </div>

      {/* FAQs */}
      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.length === 0 && (
          <p className="text-center text-blue-600 dark:text-blue-400 italic">
            No FAQs available at the moment 
          </p>
        )}

        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="border border-blue-200 dark:border-slate-700 rounded-2xl shadow-md hover:shadow-lg transition-all bg-white dark:bg-slate-800 overflow-hidden"
          >
            {/* Question */}
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center text-left p-6 bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-slate-700 transition-colors focus:outline-none"
            >
              <span className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {faq.question}
              </span>
              {activeIndex === index ? (
                <ChevronUp className="text-blue-700 dark:text-blue-400" />
              ) : (
                <ChevronDown className="text-blue-700 dark:text-blue-400" />
              )}
            </button>

            {/* Answer */}
            <div
              className={`transition-all duration-300 ease-in-out ${
                activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              <div className="p-6 border-t border-blue-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FAQs;

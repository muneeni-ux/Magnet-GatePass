// src/pages/Home.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  LayoutDashboard,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => navigate("/form"), 700);
  };

  const steps = [
    {
      title: "Secure Login",
      desc: "Access the system with encrypted verification and secure logs.",
      icon: ShieldCheck,
      lightBg: "bg-amber-50 text-amber-900 border-amber-100",
      darkBg: "dark:from-amber-600/10 dark:to-orange-600/10 dark:border-amber-900/40",
      iconColor: "text-amber-500",
    },
    {
      title: "Record Visitors",
      desc: "Capture single or group visitors quickly, complete with frequent visitor autofills.",
      icon: Users,
      lightBg: "bg-blue-50 text-blue-900 border-blue-100",
      darkBg: "dark:from-blue-600/10 dark:to-blue-900/10 dark:border-blue-900/40",
      iconColor: "text-blue-500",
    },
    {
      title: "Track Exits",
      desc: "Log check-outs effortlessly, trace duration times, and log offline checkout queues.",
      icon: Clock,
      lightBg: "bg-indigo-50 text-indigo-900 border-indigo-100",
      darkBg: "dark:from-indigo-600/10 dark:to-indigo-900/10 dark:border-indigo-900/40",
      iconColor: "text-indigo-500",
    },
    {
      title: "Admin Dashboard",
      desc: "Review occurrences, trace distinct guard audit trails, and check SVG chart metrics.",
      icon: LayoutDashboard,
      lightBg: "bg-emerald-50 text-emerald-900 border-emerald-100",
      darkBg: "dark:from-emerald-600/10 dark:to-emerald-900/10 dark:border-emerald-900/40",
      iconColor: "text-emerald-500",
    },
  ];

  return (
    <div className="relative min-h-screen px-6 py-28 flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-hidden">
      
      {/* Blurred background ambient circles (glowing and theme-aware) */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 dark:bg-blue-500/5 rounded-full filter blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full filter blur-3xl animate-float" />
      </div>

      <div className="max-w-5xl text-center">
        
        {/* TITLE */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
          Welcome to
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-blue-600 mt-2">
            MagTrack Gatepass
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
          A secure, PWA offline-first, and highly professional visitor logs control system built for 
          <strong> The Nambale Magnet School</strong>.
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 px-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`relative p-6 rounded-2xl border bg-white ${step.lightBg} ${step.darkBg} dark:bg-slate-900/40 shadow-sm hover:scale-[1.01] hover:shadow-md transition-all duration-300`}
              >
                {/* ICON */}
                <div
                  className="w-12 h-12 flex items-center justify-center
                  rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-4"
                >
                  <Icon className={`w-6 h-6 ${step.iconColor} drop-shadow animate-pulse`} />
                </div>

                {/* TITLE */}
                <h3 className="text-xl font-bold tracking-wide text-slate-800 dark:text-slate-100 text-left">
                  {step.title}
                </h3>

                {/* DESC */}
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold mt-2 text-left leading-relaxed">
                  {step.desc}
                </p>

                {/* STEP NUMBER */}
                <span className="absolute top-4 right-5 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                  Step {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA BUTTON */}
        <button
          onClick={handleGetStarted}
          disabled={loading}
          className={`
            mt-12 px-12 py-3.5 text-lg font-extrabold rounded-xl
            shadow-lg flex items-center gap-2 mx-auto transition-all duration-300
            ${
              loading
                ? "bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-blue-500/10"
            }
          `}
        >
          {loading && (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}

          <span>{loading ? "Loading Dashboard..." : "Get Started"}</span>

          {!loading && (
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          )}
        </button>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-500 font-bold uppercase tracking-wider">
          Secure. Professional. Offline-Aware.
        </p>
      </div>
    </div>
  );
};

export default Home;

// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { BadgeCheck } from "lucide-react";

// const Home = () => {
//   const navigate = useNavigate();

//   const handleGetStarted = () => {
//     navigate("/form");
//   };

//   const steps = [
//     {
//       title: "Secure Login",
//       desc: "Login securely using your gatekeeper credentials.",
//       color: "from-blue-500 to-indigo-500",
//     },
//     {
//       title: "Record Visitors",
//       desc: "Record visitor information instantly upon entry.",
//       color: "from-green-500 to-emerald-500",
//     },
//     {
//       title: "Track Exits",
//       desc: "Use the Time Out button when visitors leave.",
//       color: "from-yellow-400 to-orange-500",
//     },
//     {
//       title: "Admin Dashboard",
//       desc: "Admins can view, manage, and print visit logs easily.",
//       color: "from-pink-500 to-purple-600",
//     },
//   ];

//   return (
//     <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center text-gray-800 px-6 py-10">
//       {/* Animated Background */}
//       <div className="absolute inset-0 -z-10">
//         <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full filter blur-3xl opacity-30 animate-float-slow"></div>
//         <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full filter blur-3xl opacity-30 animate-float"></div>
//         <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full filter blur-3xl opacity-20 animate-float-delayed"></div>
//       </div>

//       {/* Hero Section */}
//       <div className="max-w-5xl w-full text-center mt-16 animate-fade-in">
//         <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-900 drop-shadow-xl leading-tight">
//           Welcome to{" "}
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
//             Nambale Magnet School
//           </span>{" "}
//           Visitors Pass System
//         </h1>
//         <p className="text-lg md:text-xl mb-10 text-blue-800 font-medium max-w-2xl mx-auto">
//           A fast, secure, and user-friendly system to manage visitor movement
//           with ease and professionalism.
//         </p>

//         {/* Steps as Colorful Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
//           {steps.map((step, i) => (
//             <div
//               key={i}
//               className={`relative p-6 rounded-2xl shadow-lg bg-gradient-to-r ${step.color} text-white transform transition duration-300 hover:scale-105 hover:shadow-2xl`}
//             >
//               <div className="flex items-center gap-3 mb-3">
//                 <BadgeCheck className="w-7 h-7 text-white" />
//                 <h3 className="text-xl font-bold">{step.title}</h3>
//               </div>
//               <p className="text-md font-medium">{step.desc}</p>
//               <span className="absolute top-4 right-4 text-sm font-semibold opacity-60">
//                 Step {i + 1}
//               </span>
//             </div>
//           ))}
//         </div>

//         {/* CTA Button */}
//         <button
//           onClick={handleGetStarted}
//           className="mt-12 px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition duration-300 rounded-full text-lg md:text-xl font-bold text-white shadow-lg hover:shadow-2xl transform hover:scale-105"
//         >
//           🚀 Get Started
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Home;

// /neww
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Users,
  Clock,
  LayoutDashboard,
} from "lucide-react";
// framer-motion removed temporarily to avoid runtime hook issues

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // loader state

  const handleGetStarted = () => {
    setLoading(true);
    setTimeout(() => navigate("/form"), 800);
  };

  const steps = [
    {
      title: "Secure Login",
      desc: "Access the system with top-tier security and encrypted authentication.",
      icon: ShieldCheck,
      colors: "from-yellow-500 to-yellow-700",
    },
    {
      title: "Record Visitors",
      desc: "Capture accurate visitor details quickly and professionally.",
      icon: Users,
      colors: "from-indigo-600 to-indigo-900",
    },
    {
      title: "Track Exits",
      desc: "Log time-out entries effortlessly and maintain clean records.",
      icon: Clock,
      colors: "from-blue-500 to-blue-800",
    },
    {
      title: "Admin Dashboard",
      desc: "Monitor activity, print logs, and manage records with ease.",
      icon: LayoutDashboard,
      colors: "from-amber-500 to-orange-600",
    },
  ];

  return (
    <div className="relative min-h-screen px-6 py-16 flex items-center justify-center text-white bg-gradient-to-br from-indigo-900 via-indigo-800 to-black overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute w-2 h-2 bg-white rounded-full top-16 left-24" />
        <div className="absolute w-2 h-2 bg-white rounded-full bottom-20 right-32" />
      </div>

      <div className="max-w-5xl text-center">
        {/* TITLE */}
        <h1 className="text-6xl font-extrabold drop-shadow-2xl">
          MagTrack
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
            Smart, Secure & Modern
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="mt-4 text-lg opacity-90">
          Designed to enhance professionalism, safety, and seamless digital
          record-keeping at every step.
        </p>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-14 px-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`relative p-8 rounded-3xl bg-gradient-to-br ${step.colors}
                shadow-2xl backdrop-blur-xl border border-white/10 cursor-pointer`}
              >
                {/* ICON */}
                <div
                  className="w-16 h-16 mx-auto flex items-center justify-center
                  rounded-2xl bg-black/20 shadow-inner mb-4"
                >
                  <Icon className="w-9 h-9 text-white drop-shadow animate-pulse" />
                </div>

                {/* TITLE */}
                <h3 className="text-2xl font-bold tracking-wide drop-shadow-md text-white">
                  {step.title}
                </h3>

                {/* DESC */}
                <p className="opacity-95 mt-2 font-medium">{step.desc}</p>

                {/* STEP NUMBER */}
                <span className="absolute top-4 right-6 text-sm opacity-70 font-bold">
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
            mt-16 px-16 py-4 text-xl font-extrabold rounded-full
            shadow-2xl flex items-center gap-3 mx-auto transition-all duration-300
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:scale-110"
            }
          `}
        >
          {/* loader spinner */}
          {loading && (
            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
          )}

          {loading ? "Loading..." : "Get Started"}

          {!loading && (
            <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
          )}
        </button>

        <p className="mt-4 text-sm opacity-90 font-medium drop-shadow">
          Faster. Smarter. Safer digital visitor management.
        </p>
      </div>
    </div>
  );
};

export default Home;

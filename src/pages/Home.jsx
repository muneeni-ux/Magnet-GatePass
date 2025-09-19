import React from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/form");
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center text-gray-800 px-6 py-10">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full filter blur-3xl opacity-30 animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full filter blur-3xl opacity-30 animate-float"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-yellow-300 to-orange-400 rounded-full filter blur-3xl opacity-20 animate-float-delayed"></div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center mt-16 animate-fade-in">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-900 drop-shadow-xl leading-tight">
          Welcome to{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Nambale Magnet School
          </span>{" "}
          Visitors Pass System
        </h1>
        <p className="text-lg md:text-xl mb-10 text-blue-800 font-medium max-w-2xl mx-auto">
          A fast, secure, and user-friendly system to manage visitor movement
          with ease and professionalism.
        </p>

        {/* Steps Card */}
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-left space-y-6 shadow-2xl border border-blue-200 hover:shadow-3xl transition duration-500">
          {[
            "Login securely using your gatekeeper credentials.",
            "Record visitor information upon entry.",
            "Use the Time Out button when they exit.",
            "Admin can view, manage, and print visit logs.",
          ].map((step, i) => (
            <div
              key={i}
              className="flex items-start gap-3 transform transition duration-300 hover:translate-x-2"
            >
              <BadgeCheck className="w-6 h-6 text-green-600 mt-1" />
              <p className="text-md md:text-lg">
                <strong className="text-blue-700">Step {i + 1}:</strong> {step}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={handleGetStarted}
          className="mt-10 px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition duration-300 rounded-full text-lg md:text-xl font-bold text-white shadow-lg hover:shadow-2xl transform hover:scale-105"
        >
          🚀 Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;

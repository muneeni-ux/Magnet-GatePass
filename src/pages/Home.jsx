import React from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/form");
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-violet-100 via-pink-200 to-yellow-100 flex flex-col items-center justify-center text-gray-800 px-6 py-10 md:mt-16">
      <div className="max-w-3xl w-full text-center mt-16 animate-fade-in">
        <h1 className="text-5xl font-extrabold mb-6 text-blue-800 drop-shadow-lg">
          Welcome to Nambale Magnet School Visitors Pass System
        </h1>
        <p className="text-lg mb-10 text-blue-700 font-medium">
          Fast, secure, and easy-to-use system to manage visitor movement efficiently.
        </p>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 text-left space-y-6 shadow-2xl border border-blue-200">
          {[
            "Login securely using your gatekeeper credentials.",
            "Record visitor information upon entry.",
            "Use the Time Out button when they exit.",
            "Admin can view, manage, and print visit logs."
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <BadgeCheck className="w-5 h-5 text-green-600 mt-1" />
              <p className="text-md"><strong>Step {i + 1}:</strong> {step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleGetStarted}
          className="mt-10 px-10 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition duration-300 rounded-full text-lg font-bold text-white shadow-md hover:shadow-xl hover:scale-105"
        >
          🚀 Get Started
        </button>
      </div>
    </div>
  );
};

export default Home;

import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-100 dark:bg-slate-950 text-center mt-[-3rem] transition-colors duration-300">
      <h1 className="text-9xl font-extrabold text-blue-600 dark:text-blue-500 mb-6">404</h1>
      <p className="text-2xl text-slate-700 dark:text-slate-300 mb-10">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link to="/">
        <button className="px-8 py-3 bg-blue-500 dark:bg-blue-600 text-white text-lg rounded hover:bg-blue-600 dark:hover:bg-blue-700 shadow-lg transition duration-200">
          Go Back Home
        </button>
      </Link>
    </div>
  );
}

export default NotFound;

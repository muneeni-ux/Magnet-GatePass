import React, { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ Store token & user data in localStorage
      localStorage.setItem("token", data.token); // JWT for future requests
      localStorage.setItem("user", JSON.stringify(data.user)); // User info
      // console.log("Logged in user:", data.user);
      // ✅ Optional: You can decode token here if needed (e.g. with jwt-decode)

      // ✅ Redirect based on role
      if (data.user?.isAdmin) {
        onLogin();
        navigate("/magnet/admin/dashboard/users");
      } else {
        onLogin();
        navigate("/home");
      }
    } catch (error) {
      setErrorMsg(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
      <main className="flex-grow flex items-center justify-center px-4 py-10 animate-fade-in">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-white bg-opacity-10 backdrop-blur-md rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6">
            <LockKeyhole className="h-12 w-12 text-white mb-2" />
            <h2 className="text-3xl font-bold text-white">Gate Pass Login</h2>
            <p className="text-sm text-blue-200">Authorized personnel only</p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-sm text-red-300 bg-red-800 bg-opacity-20 px-4 py-2 rounded-md">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white bg-opacity-20 border border-white text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full transition duration-300 font-semibold py-2 rounded-lg ${
                loading
                  ? "bg-blue-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;

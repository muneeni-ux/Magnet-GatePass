import React, { useState } from "react";
import { LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

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
    <div
      className="min-h-screen flex flex-col bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to bottom right, rgba(0,0,0,0.7), rgba(0,0,50,0.7)), url('https://scontent.fnbo8-1.fna.fbcdn.net/v/t39.30808-6/481762043_10162240028196885_4978525648961950555_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4-tO02Ofj04Q7kNvwGWdHSN&_nc_oc=AdlfKzeS2TPjq9TVouTKx0kVjgZGz5K_q4ikjXdD4DMyWTAzCxaq2W4-2TME2S8oH3s&_nc_zt=23&_nc_ht=scontent.fnbo8-1.fna&_nc_gid=-vENll-7IAl4b5Ejj6yr6A&oh=00_Afaq62IARHThjPn1hTF1fi0QzKbDLdZgYoZZshzpVG0M4A&oe=68D6E365')",
      }}
    >
      <main className="flex-grow flex items-center justify-center px-4 py-10 animate-fade-in">
        <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Logo / Title */}
          <div className="flex flex-col items-center mb-8">
            <img
              src="https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png"
              alt="Nambale Magnet School Logo"
              className="h-20 w-auto mb-4 drop-shadow-lg"
            />
            <LockKeyhole className="h-14 w-14 text-blue-300 mb-3" />
            <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
              MagTrack Login
            </h2>
            <p className="text-sm text-blue-200 mt-1">
              Authorized Personnel Only
            </p>
          </div>

          {/* Error */}
          {errorMsg && (
            <div className="mb-4 text-sm text-red-200 bg-red-800/30 px-4 py-2 rounded-md border border-red-400/30">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-white">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Enter username"
              />
            </div>

            {/* Password with eye toggle */}
            <div>
              <label className="block text-lg font-semibold mb-2 text-white">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full transition duration-300 font-semibold py-2 rounded-lg shadow-md ${
                loading
                  ? "bg-blue-500/70 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              } text-white`}
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
// import React, { useState } from "react";
// import { LockKeyhole, Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// const Login = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg("");

//     try {
//       const res = await fetch(`${SERVER_URL}/api/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       if (data.user?.isAdmin) {
//         onLogin();
//         navigate("/magnet/admin/dashboard/users");
//       } else {
//         onLogin();
//         navigate("/home");
//       }
//     } catch (error) {
//       setErrorMsg(error.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex flex-col bg-cover bg-center"
//       style={{
//         backgroundImage:
//           "linear-gradient(to bottom right, rgba(0,0,0,0.7), rgba(0,0,50,0.7)), url('https://scontent.fnbo8-1.fna.fbcdn.net/v/t39.30808-6/481762043_10162240028196885_4978525648961950555_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_ohc=4-tO02Ofj04Q7kNvwGWdHSN&_nc_oc=AdlfKzeS2TPjq9TVouTKx0kVjgZGz5K_q4ikjXdD4DMyWTAzCxaq2W4-2TME2S8oH3s&_nc_zt=23&_nc_ht=scontent.fnbo8-1.fna&_nc_gid=-vENll-7IAl4b5Ejj6yr6A&oh=00_Afaq62IARHThjPn1hTF1fi0QzKbDLdZgYoZZshzpVG0M4A&oe=68D6E365')",
//       }}
//     >
//       <main className="flex-grow flex items-center justify-center px-4 py-10 animate-fade-in">
//         <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
//           {/* Logo / Title */}
//           <div className="flex flex-col items-center mb-8">
//             <img
//               src="https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png"
//               alt="Nambale Magnet School Logo"
//               className="h-20 w-auto mb-4 drop-shadow-lg"
//             />
//             <LockKeyhole className="h-14 w-14 text-blue-300 mb-3" />
//             <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
//               MagTrack Login
//             </h2>
//             <p className="text-sm text-blue-200 mt-1">
//               Authorized Personnel Only
//             </p>
//           </div>

//           {/* Error */}
//           {errorMsg && (
//             <div className="mb-4 text-sm text-red-200 bg-red-800/30 px-4 py-2 rounded-md border border-red-400/30">
//               {errorMsg}
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-5">
//             {/* Username */}
//             <div>
//               <label className="block text-lg font-semibold mb-2 text-white">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
//                 placeholder="Enter username"
//               />
//             </div>

//             {/* Password with eye toggle */}
//             <div>
//               <label className="block text-lg font-semibold mb-2 text-white">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/40 text-white placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
//                   placeholder="Enter password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-white focus:outline-none"
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full transition duration-300 font-semibold py-2 rounded-lg shadow-md ${
//                 loading
//                   ? "bg-blue-500/70 cursor-not-allowed"
//                   : "bg-blue-600 hover:bg-blue-700 active:scale-95"
//               } text-white`}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </main>
//     </div>
//   );
// };

// export default Login;

// // Updated Login component with nms2.jpg background
// import React, { useState } from "react";
// import { LockKeyhole, Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// const Login = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg("");

//     try {
//       const res = await fetch(`${SERVER_URL}/api/auth/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Login failed");
//       }

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       if (data.user?.isAdmin) {
//         onLogin();
//         navigate("/magnet/admin/dashboard/users");
//       } else {
//         onLogin();
//         navigate("/home");
//       }
//     } catch (error) {
//       setErrorMsg(error.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">

//       {/* LEFT: Branding panel (desktop only) */}
//       <div
//         className="hidden md:flex flex-col justify-center px-16 text-white animate-fade-in"
//         style={{
//           background: "linear-gradient(135deg, #7f1d1d 0%, #dc2626 45%, #166534 100%)",
//         }}
//       >
//         <div className="max-w-md">
//           <img
//             src="/assets/nms2.jpg"
//             alt="Nambale Magnet School"
//             className="h-20 w-auto mb-6 bg-white p-2 rounded"
//           />
//           <h1 className="text-4xl font-extrabold mb-4">MagTrack</h1>
//           <p className="text-lg mb-2">Track. Manage. Secure.</p>
//           <p className="text-sm opacity-90">
//             Secure access to the Nambale Magnet School management system.
//           </p>
//         </div>
//       </div>

//       {/* RIGHT: Login form (mobile + desktop) */}
//       <div className="flex items-center justify-center bg-slate-50 px-4 animate-slide-in">
//         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

//           {/* Header */}
//           <div className="flex flex-col items-center mb-6">
//             <img
//               src="data:image/jpeg;base64,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"
//               alt="School Logo"
//               className="h-16 w-auto mb-4"
//             />
//             <LockKeyhole className="h-10 w-10 text-blue-600 mb-2" />
//             <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
//             <p className="text-sm text-slate-500">Sign in to access your account</p>
//           </div>

//           {/* Error */}
//           {errorMsg && (
//             <div className="mb-4 text-sm text-red-600 bg-red-100 px-3 py-2 rounded">
//               {errorMsg}
//             </div>
//           )}

//           {/* Login Form (unchanged logic & fields) */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Username
//               </label>
//               <input
//                 type="text"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                 placeholder="Enter username"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-slate-700 mb-1">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   className="w-full px-3 py-2 border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
//                   placeholder="Enter password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute inset-y-0 right-3 flex items-center text-slate-500"
//                 >
//                   {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                 </button>
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
//             >
//               {loading ? "Logging in..." : "Sign In"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


// import React, { useState } from "react";
// import { LockKeyhole, Eye, EyeOff } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// const Login = ({ onLogin }) => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setErrorMsg("");

//     try {
//       const res = await fetch(`${SERVER_URL}/api/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await res.json();

//       if (!res.ok) throw new Error(data.message || "Login failed");

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       onLogin();
//       navigate(data.user?.isAdmin ? "/magnet/admin/dashboard/users" : "/home");
//     } catch (error) {
//       setErrorMsg(error.message || "An error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center"
//       style={{
//         background: "linear-gradient(to bottom right, #e0f2ff, #60a5fa)",
//       }}
//     >
//       <main className="w-full max-w-md p-8 rounded-3xl bg-white/70 backdrop-blur-md shadow-2xl">
//         {/* Logo / Title */}
//         <div className="flex flex-col items-center mb-8">
//           <img
//             src="https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png"
//             alt="Nambale Magnet School Logo"
//             className="h-20 w-auto mb-4 drop-shadow-lg"
//           />
//           <LockKeyhole className="h-14 w-14 text-blue-600 mb-3" />
//           <h2 className="text-3xl font-extrabold text-blue-800 drop-shadow-md">
//             MagTrack Login
//           </h2>
//           <p className="text-sm text-blue-700 mt-1">
//             Authorized Personnel Only
//           </p>
//         </div>

//         {/* Error */}
//         {errorMsg && (
//           <div className="mb-4 text-sm text-red-700 bg-red-100 px-4 py-2 rounded-md border border-red-300">
//             {errorMsg}
//           </div>
//         )}

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-5">
//           {/* Username */}
//           <div>
//             <label className="block text-lg font-semibold mb-2 text-blue-800">
//               Username
//             </label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//               className="w-full px-4 py-2 rounded-lg border border-blue-300 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80"
//               placeholder="Enter username"
//             />
//           </div>

//           {/* Password */}
//           <div>
//             <label className="block text-lg font-semibold mb-2 text-blue-800">
//               Password
//             </label>
//             <div className="relative">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 className="w-full px-4 py-2 rounded-lg border border-blue-300 text-blue-900 placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 bg-white/80"
//                 placeholder="Enter password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute inset-y-0 right-3 flex items-center text-blue-500 hover:text-blue-700 focus:outline-none"
//               >
//                 {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-2 rounded-lg font-semibold shadow-md transition duration-300 ${
//               loading
//                 ? "bg-blue-400 cursor-not-allowed text-white"
//                 : "bg-blue-600 hover:bg-blue-700 text-white"
//             }`}
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </main>
//     </div>
//   );
// };

// export default Login;
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      onLogin();
      navigate(data.user?.isAdmin ? "/magnet/admin/dashboard/users" : "/home");
    } catch (error) {
      setErrorMsg(error.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900" />
      <div className="absolute inset-0 bg-black/30" />

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-5xl min-h-[560px] rounded-3xl bg-white/20 backdrop-blur-xl shadow-2xl border border-white/20 grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* LEFT SIDE */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-900/30 px-12">
          <img
            src="https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/10/The-Nambale-Magnet-School.png"
            alt="School Logo"
            className="h-36 mb-8 drop-shadow-xl"
          />
          <h1 className="text-4xl font-extrabold text-white mb-3">
            MagTrack
          </h1>
          <p className="text-blue-100 text-lg text-center max-w-xs">
            Visitor & Access Management System
          </p>
        </div>

        {/* RIGHT SIDE — LOGIN */}
        <div className="flex flex-col justify-center px-10 md:px-14 py-12 text-left">

          {/* HEADING WITH ICON ON THE LEFT */}
          <h2 className="flex items-center text-3xl font-bold text-white mb-2">
            <LockKeyhole className="h-8 w-8 text-amber-400 mr-3" />
            MagTrack Login
          </h2>

          <p className="text-blue-100 text-sm mb-8">
            Authorized personnel only
          </p>

          {errorMsg && (
            <div className="mb-5 text-sm text-red-100 bg-red-600/40 px-4 py-2 rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-white/80 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                loading
                  ? "bg-amber-300 text-gray-800 cursor-not-allowed"
                  : "bg-amber-400 text-blue-900 hover:bg-amber-500 hover:shadow-lg hover:scale-[1.02]"
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

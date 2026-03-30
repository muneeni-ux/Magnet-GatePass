import React, { useState, useEffect } from "react";
import { User, Mail, Lock, Shield, Save, Key, CreditCard, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, text: "", color: "bg-slate-100 dark:bg-slate-700", width: "0%" };
  let score = 0;
  if (pass.length > 7) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score < 2) return { score, text: "Weak", color: "bg-red-500", width: "25%" };
  if (score < 4) return { score, text: "Fair", color: "bg-orange-500", width: "50%" };
  if (score === 4) return { score, text: "Good", color: "bg-emerald-400", width: "75%" };
  return { score, text: "Strong", color: "bg-emerald-600", width: "100%" };
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setFormData((prev) => ({ ...prev, email: storedUser.email }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      return toast.error("Password mismatch");
    }
    
    if (formData.password && getPasswordStrength(formData.password).score < 4) {
      return toast.error("Please provide a stronger password (must be Good or Strong)");
    }

    setLoading(true);
    try {
      const payload = {
        email: formData.email,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const userId = user.id || user._id; 

      const res = await fetch(`${SERVER_URL}/api/auth/users/${userId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser)); 
      
      setUser(updatedUser);
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-500 dark:text-slate-400 font-sans text-sm">
        Loading Profile...
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden pt-24 md:pt-0">
        {/* Background Grid */}
       <div className="absolute inset-0 z-0 opacity-[0.03]" 
            style={{
                backgroundImage: "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                backgroundSize: "60px 60px"
            }}>
        </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 relative z-10 md:mt-16">
        
        {/* Left Panel - Profile Card */}
        <div className="w-full md:w-1/3 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-300 dark:border-slate-700 p-8 flex flex-col items-center text-center">
             
             <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 p-1 mb-6 relative">
                 <div className="w-full h-full rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                    <User size={40} className="text-slate-500 dark:text-slate-400" />
                 </div>
                 <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 p-1.5 rounded-full shadow-sm">
                    {user.isAdmin ? <Shield size={12} className="text-blue-500" /> : <User size={12} className="text-slate-500 dark:text-slate-400" />}
                 </div>
             </div>

             <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{user.username}</h2>
             <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-8 ${user.isAdmin ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-400 dark:border-slate-600"}`}>
                 {user.isAdmin ? "Administrator" : "Staff User"}
             </span>

             <div className="w-full space-y-4 mt-auto border-t border-slate-300 dark:border-slate-700 pt-6">
                 <div className="flex justify-between text-xs">
                     <span className="text-slate-500 font-medium uppercase tracking-wide">User ID</span>
                     <span className="text-slate-600 dark:text-slate-300 font-mono">#{user.id?.slice(-6).toUpperCase() || "UNK"}</span>
                 </div>
                 <div className="flex justify-between text-xs">
                     <span className="text-slate-500 font-medium uppercase tracking-wide">Status</span>
                     <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                     </span>
                 </div>
             </div>
        </div>

        {/* Right Panel - Edit Form */}
        <div className="w-full md:w-2/3 p-8 md:p-12 bg-white dark:bg-slate-800">

            <div className="mb-8 border-b border-slate-300 dark:border-slate-700 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Key className="text-slate-500 dark:text-slate-400 h-5 w-5" /> Account Security
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account credentials and contact information.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Field */}
                <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                    <div className="relative group">
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-slate-600"
                        />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">New Password</label>
                        <div className="relative group">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Leave empty to keep"
                                className="w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-slate-600"
                            />
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="mt-2 text-xs">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">Strength:</span>
                                <span className={`font-bold ${getPasswordStrength(formData.password).text === "Weak" ? "text-red-500" : getPasswordStrength(formData.password).text === "Fair" ? "text-orange-500" : "text-emerald-500"}`}>
                                  {getPasswordStrength(formData.password).text}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                                  style={{ width: getPasswordStrength(formData.password).width }}
                                ></div>
                              </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1.5">
                         <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Confirm Password</label>
                         <div className="relative group">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                disabled={!formData.password}
                                placeholder="Confirm new password"
                                className={`w-full bg-slate-50/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm placeholder-slate-600 ${!formData.password ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
                            <button 
                                type="button" 
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={!formData.password}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-6 flex justify-end border-t border-slate-300 dark:border-slate-700 mt-8">
                     <button
                        type="submit"
                        disabled={loading}
                        className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg flex items-center gap-2 ${
                            loading ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white shadow-blue-900/20"
                        }`}
                    >
                        {loading ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
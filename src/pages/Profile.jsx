// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { User, Mail, LockKeyhole, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export default function Profile() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load current user from localStorage
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        setFormData((prev) => ({
          ...prev,
          username: u.username || "",
          email: u.email || "",
        }));
      } catch (err) {
        console.error("Error parsing user from localStorage:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;

    if (formData.username.trim().length < 3) {
      tempErrors.username = "Username must be at least 3 characters.";
      isValid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    if (formData.password.length > 0) {
      if (formData.password.length < 6) {
        tempErrors.password = "Password must be at least 6 characters.";
        isValid = false;
      }
      if (formData.password !== formData.confirmPassword) {
        tempErrors.confirmPassword = "Passwords do not match.";
        isValid = false;
      }
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please resolve form errors.");
      return;
    }

    setLoading(true);

    const payload = {
      username: formData.username,
      email: formData.email,
    };
    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const response = await fetch(`${SERVER_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!");
      
      // Update local storage user details
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast.error(error.message || "Profile update failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-24 transition-colors duration-300">
      
      {/* Profile Card */}
      <div className="w-full max-w-lg shadow-xl rounded-3xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 relative overflow-hidden">
        
        {/* Glow backdrop decor */}
        <div className="absolute -top-20 -left-20 w-44 h-44 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight">Account Profile</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Securely modify login credentials or change passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                  errors.username ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                }`}
              />
            </div>
            {errors.username && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.username}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                  errors.email ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email}</p>}
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-3">Security — Update Password</span>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              New Password (Optional)
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                className={`w-full pl-11 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                  errors.password ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          {formData.password.length > 0 && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Verify new password"
                  required
                  className={`w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-semibold focus:outline-none ${
                    errors.confirmPassword ? "border-red-500" : "border-slate-200 dark:border-slate-800"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide shadow-md flex items-center justify-center gap-2 mt-4 transition duration-300 ${
              loading
                ? "bg-slate-250 cursor-not-allowed text-slate-500"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-[1.01] active:scale-95 shadow-blue-500/10"
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShieldCheck size={18} />
            )}
            {loading ? "Updating Account..." : "Save Account Details"}
          </button>

        </form>

      </div>
    </div>
  );
}

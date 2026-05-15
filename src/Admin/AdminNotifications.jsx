import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiBell, FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${SERVER_URL}/api/notifications`);
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    }
  };

  const handleCreateNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please enter both title and message.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${SERVER_URL}/api/notifications`,
        { title, message },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Notification created successfully");
      setNotifications([response.data.notification, ...notifications]);
      setTitle("");
      setMessage("");
    } catch (error) {
      console.error("Error creating notification:", error);
      toast.error("Failed to create notification");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Notification deleted");
      setNotifications(notifications.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${SERVER_URL}/api/notifications/${id}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(res.data.notification.isActive ? "Notification is now visible" : "Notification hidden");
      setNotifications(notifications.map(n => n._id === id ? { ...n, isActive: res.data.notification.isActive } : n));
    } catch (error) {
      console.error("Error toggling notification:", error);
      toast.error("Failed to toggle notification status");
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected notification(s)?`))
      return;
    try {
      const token = localStorage.getItem("token");
      await Promise.all(
        selectedIds.map((id) => axios.delete(`${SERVER_URL}/api/notifications/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }))
      );
      toast.success("Notifications deleted");
      setNotifications(notifications.filter((n) => !selectedIds.includes(n._id)));
      setSelectedIds([]);
    } catch {
      toast.error("Bulk delete failed");
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg relative z-10 w-fit">
            <FiBell className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Manage Notifications
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Broadcast new notifications to all platform users.
            </p>
          </div>
        </div>

        {/* Create Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6 border-b border-white/60 pb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg"><FiPlus size={18} /></span> Create New Notification
          </h2>
          <form onSubmit={handleCreateNotification} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm shadow-inner"
                placeholder="E.g., System Maintenance Update"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm resize-none shadow-inner"
                placeholder="Enter your detailed notification message here..."
              />
            </div>
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3.5 rounded-xl font-bold transition-all text-white text-sm shadow-lg w-full sm:w-auto flex flex-1 sm:flex-none justify-center items-center gap-2 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/30"
                }`}
              >
                {loading ? "Broadcasting..." : "Broadcast Notification"}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications List */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60">
          <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Broadcasted Notifications
          </h2>
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-slate-500 border-2 border-dashed border-white/60 rounded-2xl bg-white/40 backdrop-blur-sm font-medium">
              No active notifications found.
            </div>
          ) : (
            <div className="space-y-5">
              {selectedIds.length > 0 && (
                <div className="mb-4 bg-red-50 p-3 flex items-center justify-between rounded-lg border border-red-100">
                  <span className="text-sm text-red-800 font-medium">
                    {selectedIds.length} item(s) selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-md hover:bg-red-50 text-sm font-medium transition-colors"
                  >
                    <FiTrash2 size={14} /> Delete Selected
                  </button>
                </div>
              )}
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative group p-5 border transition-all duration-300 flex flex-col gap-3 backdrop-blur-sm rounded-2xl ${
                    selectedIds.includes(notification._id)
                      ? "bg-emerald-50/60 border-emerald-300/80 ring-2 ring-emerald-300 shadow-[0_8px_30px_rgba(16,185,129,0.1)]"
                      : "bg-white/40 border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:bg-white/70 hover:border-emerald-300/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)]"
                  }`}
                >
                    <div className="flex justify-between items-start gap-5">
                    <div className="flex items-start gap-4 flex-1">
                      <label className="mt-1 cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(notification._id)}
                          onChange={() => toggleSelect(notification._id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>
                      <div className="flex-1">
                        <h3 className={`font-extrabold text-base md:text-lg leading-tight ${!notification.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`} style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                          {notification.title}
                        </h3>
                      <p className={`text-sm md:text-base mt-2 font-medium leading-relaxed ${!notification.isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                        {notification.message}
                      </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(notification._id, notification.isActive)}
                        className={`p-2 rounded-xl transition-all shadow-sm flex-shrink-0 ${notification.isActive ? 'bg-white border border-emerald-100 text-emerald-500 hover:bg-emerald-50' : 'bg-white/50 border border-white/60 text-slate-400 hover:bg-white hover:text-slate-600'}`}
                        title={notification.isActive ? "Hide Notification" : "Show Notification"}
                      >
                        {notification.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-2 text-slate-400 bg-white/50 border border-white/60 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl shadow-sm transition-all flex-shrink-0"
                        title="Delete Notification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 flex items-center justify-between mt-2 tracking-wide uppercase">
                    <span>
                      {new Date(notification.createdAt).toLocaleString(
                        undefined,
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                    <span className="bg-white/60 border border-white/80 px-2.5 py-1 rounded-full text-slate-600 shadow-[0_2px_10px_rgba(0,0,0,0.02)] backdrop-blur-md">
                      {notification.readBy?.length || 0} views
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;

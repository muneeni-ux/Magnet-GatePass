import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiBell, FiEye, FiEyeOff } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <FiBell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Notifications
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Broadcast new notifications to all platform users.
            </p>
          </div>
        </div>

        {/* Create Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <FiPlus className="text-emerald-500" /> Create New Notification
          </h2>
          <form onSubmit={handleCreateNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                placeholder="E.g., System Maintenance Update"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm resize-none"
                placeholder="Enter your detailed notification message here..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm hover:shadow active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Broadcasting..." : "Broadcast Notification"}
              </button>
            </div>
          </form>
        </div>

        {/* Notifications List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Broadcasted Notifications
          </h2>
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
              No active notifications found.
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="relative group p-4 border border-slate-100 hover:border-emerald-100 rounded-xl bg-slate-50 hover:bg-emerald-50/30 transition-all flex flex-col gap-2"
                >
                    <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className={`font-semibold leading-tight ${!notification.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {notification.title}
                      </h3>
                      <p className={`text-sm mt-1 ${!notification.isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(notification._id, notification.isActive)}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${notification.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                        title={notification.isActive ? "Hide Notification" : "Show Notification"}
                      >
                        {notification.isActive ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Delete Notification"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-400 flex items-center justify-between mt-1">
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
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 shadow-sm">
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

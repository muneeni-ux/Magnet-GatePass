/*  UserDetails.jsx  */
import React, { useEffect, useMemo, useState } from "react";
import {
  Users2,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const PAGE_SIZE = 8; // ⬅️  items per page

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, text: "", color: "bg-slate-200", width: "0%" };
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

// ───────────────────────────────────────────────────────────────────────────────
// Modal component (re-usable for Add / Edit / Delete confirmation)
// ───────────────────────────────────────────────────────────────────────────────
const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-6 sm:p-8 relative border-white/60 z-10 animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
        <h3 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight border-b border-white/60 pb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </h3>
        {children}
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────────────────────────
export default function UserDetails() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* filters & pagination */
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | admin | user
  const [page, setPage] = useState(1);

  /* modal state */
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [selection, setSelection] = useState(null); // user currently editing/deleting

  /*  new / edit form state  */
  const initialForm = { username: "", email: "", password: "", isAdmin: false };
  const [formData, setFormData] = useState(initialForm);

  /* Password visibility state */
  const [showPassword, setShowPassword] = useState(false);

  // ──────────────────────────────────
  // helper: fetch ALL users
  // ──────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res = await axios.get(`${SERVER_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError("Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ──────────────────────────────────
  // CRUD helpers
  // ──────────────────────────────────
  const saveUser = async (payload, isEdit = false) => {
    if (payload.password && getPasswordStrength(payload.password).score < 4) {
      return toast.error("Please provide a stronger password (must be Good or Strong)");
    }

    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      const url = isEdit
        ? `${SERVER_URL}/api/auth/users/${payload.id}`
        : `${SERVER_URL}/api/auth/signup`;

      const method = isEdit ? "PUT" : "POST";
      await axios({
        url,
        method,
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`User ${isEdit ? "updated" : "created"} successfully`);
      setShowAdd(false);
      setShowEdit(false);
      setFormData(initialForm);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Action failed");
    }
  };

  const deleteUser = async (id) => {
    try {
      const token =
        localStorage.getItem("adminToken") || localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/auth/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted");
      setShowDel(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ──────────────────────────────────
  // derived list (filter + search)
  // ──────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users];
    if (roleFilter !== "all") {
      list = list.filter((u) => (u.isAdmin ? "admin" : "user") === roleFilter);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term),
      );
    }
    return list;
  }, [users, roleFilter, search]);

  // pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // counts
  const totalAdmins = users.filter((u) => u.isAdmin).length;

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-40">
        <ClipLoader color="#ec4899" size={50} />
      </div>
    );
  }
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-2xl shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                System Access & Users
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm md:text-base text-slate-500 font-medium tracking-wide">
                  Total Registered:{" "}
                  <span className="font-extrabold text-slate-700">
                    {users.length}
                  </span>
                </p>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                <p className="text-sm md:text-base text-slate-500 font-medium tracking-wide">
                  Administrators:{" "}
                  <span className="font-extrabold text-emerald-600">
                    {totalAdmins}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAdd(true);
              setFormData(initialForm);
            }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/30 w-full sm:w-auto relative z-10"
          >
            <Plus size={18} /> New Account
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search by username or email address..."
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
            />
          </div>
          <div className="relative w-full sm:w-64 shrink-0">
            <Filter
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm appearance-none shadow-inner cursor-pointer"
            >
              <option value="all">All Clearance Levels</option>
              <option value="admin">Administrators Only</option>
              <option value="user">Standard Users</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glass-panel overflow-hidden rounded-3xl border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/40 border-b border-white/60 text-slate-600 uppercase tracking-widest text-[11px] font-extrabold backdrop-blur-md">
                  <th className="px-6 py-5">Account Identity</th>
                  <th className="px-6 py-5 hidden sm:table-cell">Contact Email</th>
                  <th className="px-6 py-5">Clearance</th>
                  <th className="px-6 py-5 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      <Users2
                        size={40}
                        className="mx-auto text-slate-300 mb-3"
                      />
                      <p className="font-medium">No matching records found.</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((u) => (
                    <tr
                      key={u._id}
                      className="bg-transparent hover:bg-white/60 transition-all duration-200 group border-b border-white/40 last:border-0 hover:shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-white border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] flex items-center justify-center font-extrabold text-slate-600 text-base">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                            {u.username}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs sm:hidden mt-2 inline-block bg-white/50 px-2 py-1 rounded-md">
                          {u.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-slate-600 font-medium tracking-wide">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
                            u.isAdmin
                              ? "bg-emerald-50 text-emerald-800 border-[1.5px] border-emerald-200/60"
                              : "bg-blue-50 text-blue-700 border-[1.5px] border-blue-200/60"
                          }`}
                        >
                          {u.isAdmin ? "Admin" : "Standard"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelection(u);
                              setFormData({ ...u, password: "" });
                              setShowEdit(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-600 bg-white/50 border border-white/60 hover:bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all flex items-center justify-center gap-1.5"
                            title="Edit Details"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelection(u);
                              setShowDel(true);
                            }}
                            className="p-2 text-slate-400 hover:text-red-600 bg-white/50 border border-white/60 hover:bg-red-50 hover:border-red-100 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all flex items-center justify-center"
                            title="Revoke Access"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center px-6 py-5 border-t border-white/60 bg-white/20 backdrop-blur-md">
              <span className="text-sm font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-white/60 bg-white/40 text-slate-600 hover:bg-white/70 disabled:opacity-50 disabled:hover:bg-white/40 transition-all shadow-sm"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 text-sm font-bold rounded-xl border border-white/60 bg-white/40 text-slate-600 hover:bg-white/70 disabled:opacity-50 disabled:hover:bg-white/40 transition-all shadow-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/*  MODALS                                                              */}
      {/* ───────────────────────────────────────────────────────────────────── */}

      {/* ADD / EDIT user modal (Combined logic) */}
      <Modal
        open={showAdd || showEdit}
        title={
          showEdit
            ? `Edit User: ${selection?.username}`
            : "Provision New Account"
        }
        onClose={() => {
          setShowAdd(false);
          setShowEdit(false);
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUser(
              showEdit ? { ...formData, id: selection._id } : formData,
              showEdit,
            );
          }}
          className="space-y-5"
        >
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-extrabold text-slate-700 mb-2">
              Username
            </label>
            <input
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white/80 outline-none transition-all text-sm shadow-inner"
              placeholder="e.g. jdoe"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-extrabold text-slate-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-white/40 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white/80 outline-none transition-all text-sm shadow-inner"
              placeholder="jdoe@company.com"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-widest font-extrabold text-slate-700 mb-2">
              {showEdit ? "New Password (Optional)" : "Initial Password"}
            </label>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                required={!showEdit}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full pl-4 pr-10 py-3 bg-white/40 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white/80 outline-none transition-all text-sm shadow-inner"
                placeholder={
                  showEdit ? "Leave blank to keep current" : "Secure password"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {formData.password && (
              <div className="mt-3 text-xs bg-white/40 border border-white/60 p-3 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-slate-500 font-extrabold uppercase tracking-wide">Strength:</span>
                  <span className={`font-extrabold px-2 py-0.5 rounded-md ${getPasswordStrength(formData.password).text === "Weak" ? "bg-red-100 text-red-600" : getPasswordStrength(formData.password).text === "Fair" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
                    {getPasswordStrength(formData.password).text}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                    style={{ width: getPasswordStrength(formData.password).width }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          <label className="flex items-center gap-4 p-4 bg-white/40 rounded-xl border border-white/60 cursor-pointer hover:bg-white/60 transition-all shadow-sm group">
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${formData.isAdmin ? "bg-blue-600 border-blue-600 shadow-[0_2px_8px_rgba(37,99,235,0.4)]" : "bg-white border-slate-300 group-hover:border-blue-400"}`}
            >
              {formData.isAdmin && (
                <ShieldCheck size={12} className="text-white" />
              )}
            </div>
            <input
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) =>
                setFormData({ ...formData, isAdmin: e.target.checked })
              }
              className="hidden"
            />
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-800 tracking-wide">
                Administrator Access
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Grant full access to all system modules
              </span>
            </div>
          </label>

          <div className="pt-6 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setShowEdit(false);
              }}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white/50 border border-white/80 rounded-xl hover:bg-white/80 transition-all backdrop-blur-sm shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all"
            >
              {showEdit ? "Save Changes" : "Provision Account"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE confirm modal */}
      <Modal
        open={showDel}
        title="Revoke Access"
        onClose={() => setShowDel(false)}
      >
        <div className="flex items-start gap-5 mb-8">
          <div className="p-4 bg-red-100/80 border border-red-200 text-red-600 rounded-2xl shrink-0 shadow-inner">
            <Trash2 size={24} />
          </div>
          <div>
            <p className="text-slate-800 font-bold text-lg leading-snug">
              Are you sure you want to delete the account for{" "}
              <strong className="text-red-600">{selection?.username}</strong>?
            </p>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              This action cannot be undone. All access will be permanently
              revoked.
            </p>
          </div>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowDel(false)}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-slate-600 bg-white/50 border border-white/80 rounded-xl hover:bg-white/80 transition-all backdrop-blur-sm shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteUser(selection._id)}
            className="w-full sm:w-auto px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 rounded-xl shadow-[0_4px_15px_rgba(220,38,38,0.3)] transition-all"
          >
            Yes, Revoke Access
          </button>
        </div>
      </Modal>
    </div>
  );
}

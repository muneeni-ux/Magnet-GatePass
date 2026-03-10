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
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 relative border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">
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
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                System Access & Users
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                  Total Registered:{" "}
                  <span className="font-bold text-slate-700">
                    {users.length}
                  </span>
                </p>
                <div className="w-1 h-1 rounded-full bg-slate-300"></div>
                <p className="text-sm text-slate-500 font-medium tracking-wide">
                  Administrators:{" "}
                  <span className="font-bold text-emerald-600">
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-200"
          >
            <Plus size={18} /> New Account
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search by username or email address..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm shadow-sm"
            />
          </div>
          <div className="relative w-full sm:w-56 shrink-0">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Clearance Levels</option>
              <option value="admin">Administrators Only</option>
              <option value="user">Standard Users</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500">
                  <th className="px-6 py-4 font-semibold">Account Identity</th>
                  <th className="px-6 py-4 font-semibold hidden sm:table-cell">
                    Contact Email
                  </th>
                  <th className="px-6 py-4 font-semibold">Clearance</th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Settings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
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
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">
                            {u.username}
                          </span>
                        </div>
                        <span className="text-slate-500 text-xs sm:hidden mt-1 block">
                          {u.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell text-slate-600">
                        {u.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            u.isAdmin
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-100"
                          } border`}
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
                            className="p-1.5 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 hover:border-blue-200 rounded-lg shadow-sm transition-all"
                            title="Edit Details"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setSelection(u);
                              setShowDel(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-lg shadow-sm transition-all"
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
            <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-white">
              <span className="text-sm font-medium text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
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
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Username
            </label>
            <input
              required
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="e.g. jdoe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder="jdoe@company.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {showEdit ? "New Password (Optional)" : "Initial Password"}
            </label>
            <input
              type="password"
              required={!showEdit}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm"
              placeholder={
                showEdit ? "Leave blank to keep current" : "Secure password"
              }
            />
          </div>
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center ${formData.isAdmin ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"}`}
            >
              {formData.isAdmin && (
                <ShieldCheck size={14} className="text-white" />
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
              <span className="text-sm font-semibold text-slate-800">
                Administrator Access
              </span>
              <span className="text-xs text-slate-500">
                Grant full access to all system modules
              </span>
            </div>
          </label>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setShowAdd(false);
                setShowEdit(false);
              }}
              className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
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
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0">
            <Trash2 size={24} />
          </div>
          <div>
            <p className="text-slate-800 font-medium">
              Are you sure you want to delete the account for{" "}
              <strong>{selection?.username}</strong>?
            </p>
            <p className="text-sm text-slate-500 mt-1">
              This action cannot be undone. All access will be permanently
              revoked.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={() => setShowDel(false)}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteUser(selection._id)}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
          >
            Yes, Revoke Access
          </button>
        </div>
      </Modal>
    </div>
  );
}

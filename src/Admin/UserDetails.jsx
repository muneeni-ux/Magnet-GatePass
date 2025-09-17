/*  UserDetails.jsx  */
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ClipLoader } from 'react-spinners';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const PAGE_SIZE  = 8;                          // ⬅️  items per page

// ───────────────────────────────────────────────────────────────────────────────
// Modal component (re-usable for Add / Edit / Delete confirmation)
// ───────────────────────────────────────────────────────────────────────────────
const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-semibold mb-4">{title}</h3>
        {children}
        <div className="text-right mt-6">
          <button
            onClick={onClose}
            className="inline-block px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Main page
// ───────────────────────────────────────────────────────────────────────────────
export default function UserDetails() {
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");

  /* filters & pagination */
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | admin | user
  const [page,       setPage]       = useState(1);

  /* modal state */
  const [showAdd,    setShowAdd]    = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [showDel,    setShowDel]    = useState(false);
  const [selection,  setSelection]  = useState(null); // user currently editing/deleting

  /*  new / edit form state  */
  const initialForm = { username: "", email: "", password: "", isAdmin: false };
  const [formData, setFormData] = useState(initialForm);

  // ──────────────────────────────────
  // helper: fetch ALL users
  // ──────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const res   = await axios.get(`${SERVER_URL}/api/auth/users`, {
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

  useEffect(() => { fetchUsers(); }, []);

  // ──────────────────────────────────
  // CRUD helpers
  // ──────────────────────────────────
  const saveUser = async (payload, isEdit = false) => {
    try {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      const url   = isEdit
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
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
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
          u.email.toLowerCase().includes(term)
      );
    }
    return list;
  }, [users, roleFilter, search]);

  // pagination
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginated   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // counts
  const totalAdmins = users.filter((u) => u.isAdmin).length;

  if (loading) {
  return (
    <div className="p-6 flex justify-center items-center h-40">
      <ClipLoader color="#ec4899" size={50} />
    </div>
  );
}
  if (error)   return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6 p-6">
      {/* Header + controls */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-sm text-gray-600 mt-1">
            Total&nbsp;users:&nbsp;<strong>{users.length}</strong>   |   Admins:&nbsp;
            <strong>{totalAdmins}</strong>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            type="text"
            placeholder="Search username / email..."
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
          <button
            onClick={() => { setShowAdd(true); setFormData(initialForm); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md"
          >
            + Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100 text-gray-700 text-left text-sm">
            <tr>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2 text-center w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  No users match your criteria.
                </td>
              </tr>
            ) : (
              paginated.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{u.username}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isAdmin
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.isAdmin ? "Admin" : "User"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => { setSelection(u); setFormData({ ...u, password: "" }); setShowEdit(true); }}
                      className="px-2 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setSelection(u); setShowDel(true); }}
                      className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-md"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-2 text-sm">
          <button
            disabled={currentPage === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 rounded-md border disabled:opacity-40"
          >
            ‹ Prev
          </button>
          <span>
            Page {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 rounded-md border disabled:opacity-40"
          >
            Next ›
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/*  ADD user modal                                                    */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <Modal
        open={showAdd}
        title="Add New User"
        onClose={() => setShowAdd(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUser(formData, false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isAdmin"
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
            />
            <label htmlFor="isAdmin" className="text-sm">Admin</label>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Save
          </button>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/*  EDIT user modal                                                   */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <Modal
        open={showEdit}
        title={`Edit: ${selection?.username || ""}`}
        onClose={() => setShowEdit(false)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveUser({ ...formData, id: selection._id }, true);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password (optional)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border px-3 py-2 rounded-md"
              placeholder="Leave blank to keep current"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="editIsAdmin"
              type="checkbox"
              checked={formData.isAdmin}
              onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
            />
            <label htmlFor="editIsAdmin" className="text-sm">Admin</label>
          </div>
          <button
            type="submit"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Update
          </button>
        </form>
      </Modal>

      {/* ───────────────────────────────────────────────────────────────────── */}
      {/*  DELETE confirm modal                                              */}
      {/* ───────────────────────────────────────────────────────────────────── */}
      <Modal
        open={showDel}
        title="Delete User?"
        onClose={() => setShowDel(false)}
      >
        <p className="mb-6">
          Are you sure you want to delete{" "}
          <strong>{selection?.username}</strong>?
        </p>
        <button
          onClick={() => deleteUser(selection._id)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
        >
          Yes, delete
        </button>
      </Modal>
    </div>
  );
}

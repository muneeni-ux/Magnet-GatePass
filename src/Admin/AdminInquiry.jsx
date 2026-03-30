import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Trash2,
  PlusCircle,
  Pencil,
  Users,
  ImagePlus,
  UserCircle,
  Briefcase,
  Mail,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

function AdminInquiry() {
  const [staff, setStaff] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null); // ✅ track if editing

  // ✅ Fetch staff list
  const fetchStaff = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/api/inquiry-staff`);
      setStaff(res.data);
    } catch (err) {
      console.error("Error fetching staff:", err);
      toast.error("Failed to fetch staff.");
    }
  };

  // ✅ Image upload to backend -> Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgFormData = new FormData();
    imgFormData.append("image", file); // matches parser.single("image")

    try {
      setLoading(true);
      const res = await fetch(`${SERVER_URL}/api/upload/image`, {
        method: "POST",
        body: imgFormData,
      });
      const data = await res.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, image: data.imageUrl }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error("Image upload failed.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Error uploading image.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Add or Update staff
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      toast.error("Please upload a staff image.");
      return;
    }

    try {
      if (editId) {
        // update staff
        await axios.put(`${SERVER_URL}/api/inquiry-staff/${editId}`, formData);
        toast.success("Staff updated!");
      } else {
        // create staff
        await axios.post(`${SERVER_URL}/api/inquiry-staff`, formData);
        toast.success("Staff member added!");
      }

      setFormData({ name: "", role: "", email: "", phone: "", image: "" });
      setEditId(null);
      fetchStaff();
    } catch (err) {
      console.error("Save staff error:", err);
      toast.error("Failed to save staff.");
    }
  };

  // ✅ Edit staff (prefill form)
  const handleEdit = (member) => {
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      phone: member.phone,
      image: member.image,
    });
    setEditId(member._id);
    toast("Editing staff: " + member.name, { icon: "✏️" });
  };

  // ✅ Delete staff
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this staff member?")) return;
    try {
      await axios.delete(`${SERVER_URL}/api/inquiry-staff/${id}`);
      toast.success("Staff deleted.");
      fetchStaff();
    } catch (err) {
      console.error("Delete staff error:", err);
      toast.error("Failed to delete staff.");
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg relative z-10 w-fit">
            <Users className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Manage Inquiry Staff
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Add and organize contact personnel for visitor inquiries.
            </p>
          </div>
        </div>

        {/* Add/Edit Staff Form */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6 border-b border-white/60 pb-5" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="p-2 bg-amber-100/50 text-amber-600 rounded-lg"><PlusCircle size={18} /></span>
              {editId ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px] flex items-center gap-2">
                  <UserCircle size={14} className="text-amber-500" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px] flex items-center gap-2">
                  <Briefcase size={14} className="text-amber-500" /> Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head of Admissions"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px] flex items-center gap-2">
                  <Mail size={14} className="text-amber-500" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm shadow-inner"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px] flex items-center gap-2">
                  <Phone size={14} className="text-amber-500" /> Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all text-sm shadow-inner"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px] flex items-center gap-2">
                  <ImagePlus size={14} className="text-amber-500" /> Profile Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="file"
                      id="file-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-4 py-3 bg-white/40 border border-dashed border-slate-300 rounded-xl hover:bg-white/60 hover:border-amber-300 cursor-pointer transition-all text-sm text-slate-600 font-bold backdrop-blur-sm"
                    >
                      {loading ? "Uploading..." : "Click to select image"}
                    </label>
                  </div>

                  {formData.image && (
                    <div className="shrink-0 relative group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-14 h-14 object-cover rounded-full border-[3px] border-amber-200 shadow-md transform hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center gap-4 border-t border-white/60">
              <button
                type="submit"
                disabled={loading}
                className={`px-8 py-3.5 rounded-xl font-bold transition-all text-white text-sm shadow-lg w-full sm:w-auto flex-1 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed shadow-none"
                    : editId
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/30"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/30"
                }`}
              >
                {loading
                  ? "Processing..."
                  : editId
                    ? "Update Staff Profile"
                    : "Save Staff Profile"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setFormData({
                      name: "",
                      role: "",
                      email: "",
                      phone: "",
                      image: "",
                    });
                  }}
                  className="px-8 py-3.5 rounded-xl border border-white/60 bg-white/50 hover:bg-white/80 text-slate-600 text-sm font-bold transition-all backdrop-blur-md w-full sm:w-auto"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Staff Table */}
        <div className="glass-panel overflow-hidden rounded-3xl border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/40 border-b border-white/60 text-slate-600 uppercase tracking-widest text-[11px] font-extrabold backdrop-blur-md">
                  <th className="px-6 py-5 w-16 text-center">Profile</th>
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Role</th>
                  <th className="px-6 py-5 hidden md:table-cell">Contact Info</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {staff.map((member) => (
                  <tr
                    key={member._id}
                    className="bg-transparent hover:bg-white/60 transition-all duration-200 group border-b border-white/40 last:border-0 hover:shadow-[0_4px_15px_rgba(0,0,0,0.02)]"
                  >
                    <td className="px-6 py-4 flex justify-center">
                      <img
                        src={member.image || "https://via.placeholder.com/50"}
                        alt={member.name}
                        className="w-12 h-12 object-cover rounded-full border-[3px] border-white shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {member.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 tracking-wide">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                          <Mail size={12} className="text-indigo-400" /> {member.email}
                        </span>
                        <span className="text-slate-600 text-xs font-medium flex items-center gap-1.5">
                          <Phone size={12} className="text-emerald-400" /> {member.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-slate-400 hover:text-amber-600 bg-white/50 border border-white/60 hover:bg-white rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 text-slate-400 hover:text-red-600 bg-white/50 border border-white/60 hover:bg-red-50 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium tracking-wide">
                        No staff members found.
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Add a new inquiry contact using the form above.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminInquiry;

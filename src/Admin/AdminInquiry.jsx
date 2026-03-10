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
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Inquiry Staff
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Add and organize contact personnel for visitor inquiries.
            </p>
          </div>
        </div>

        {/* Add/Edit Staff Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
              <PlusCircle size={20} className="text-amber-500" />
              {editId ? "Edit Staff Member" : "Add New Staff Member"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <UserCircle size={14} className="text-slate-400" /> Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" /> Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Head of Admissions"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" /> Email Address
                </label>
                <input
                  type="email"
                  placeholder="jane.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="07XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                  <ImagePlus size={14} className="text-slate-400" /> Profile
                  Image
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
                      className="flex items-center justify-center w-full px-4 py-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors text-sm text-slate-600 font-medium"
                    >
                      {loading ? "Uploading..." : "Click to select image"}
                    </label>
                  </div>

                  {formData.image && (
                    <div className="shrink-0 relative group">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-full border-2 border-amber-200 shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all text-white text-sm shadow-sm ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : editId
                      ? "bg-amber-600 hover:bg-amber-700"
                      : "bg-blue-600 hover:bg-blue-700"
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
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500">
                  <th className="px-6 py-4 font-semibold w-16">Profile</th>
                  <th className="px-6 py-4 font-semibold">Name</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold hidden md:table-cell">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <img
                        src={member.image || "https://via.placeholder.com/50"}
                        alt={member.name}
                        className="w-10 h-10 object-cover rounded-full border border-slate-200 shadow-sm"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {member.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-600 text-xs flex items-center gap-1.5">
                          <Mail size={12} /> {member.email}
                        </span>
                        <span className="text-slate-600 text-xs flex items-center gap-1.5">
                          <Phone size={12} /> {member.phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 bg-white border border-slate-200 hover:border-amber-200 rounded-lg shadow-sm transition-all"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 hover:border-red-200 rounded-lg shadow-sm transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
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

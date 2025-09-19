import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, PlusCircle, Pencil } from "lucide-react";
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
    <div className="p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6 text-black">
        Manage Staff (Inquiries)
      </h1>

      {/* Add/Edit Staff Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 grid gap-4 mb-8"
      >
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <PlusCircle size={20} className="text-green-600" />{" "}
          {editId ? "Edit Staff Member" : "Add Staff Member"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="border p-2 rounded-lg"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border p-2 rounded-lg md:col-span-2"
          />

          {loading && (
            <p className="text-sm text-gray-500 md:col-span-2">
              Uploading image...
            </p>
          )}
          {formData.image && (
            <div className="md:col-span-2 flex items-center gap-4">
              <img
                src={formData.image}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-full border"
              />
              <span className="text-sm text-green-600">Image ready ✅</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition text-white ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : editId
              ? "bg-yellow-600 hover:bg-yellow-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading
            ? "Please wait..."
            : editId
            ? "Update Staff"
            : "Save Staff"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setFormData({ name: "", role: "", email: "", phone: "", image: "" });
            }}
            className="ml-3 px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Staff Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 shadow-md rounded-lg">
          <thead className="bg-blue-100">
            <tr>
              <th className="border p-3 text-left">Image</th>
              <th className="border p-3 text-left">Name</th>
              <th className="border p-3 text-left">Role</th>
              <th className="border p-3 text-left">Email</th>
              <th className="border p-3 text-left">Phone</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member._id} className="hover:bg-gray-50">
                <td className="border p-2">
                  <img
                    src={member.image || "https://via.placeholder.com/50"}
                    alt={member.name}
                    className="w-12 h-12 object-cover rounded-full border"
                  />
                </td>
                <td className="border p-2 font-medium">{member.name}</td>
                <td className="border p-2">{member.role}</td>
                <td className="border p-2">{member.email}</td>
                <td className="border p-2">{member.phone}</td>
                <td className="border p-2 flex gap-2 justify-center">
                  {/* ✏️ Edit */}
                  <button
                    onClick={() => handleEdit(member)}
                    className="bg-yellow-100 text-yellow-700 p-2 rounded-full hover:bg-yellow-200 transition"
                  >
                    <Pencil size={18} />
                  </button>

                  {/* 🗑 Delete */}
                  <button
                    onClick={() => handleDelete(member._id)}
                    className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4 text-gray-500">
                  No staff added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminInquiry;

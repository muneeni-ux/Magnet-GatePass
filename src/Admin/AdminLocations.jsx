import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiMapPin, FiEdit2, FiPhone } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminLocations = () => {
  const [gates, setGates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [gateName, setGateName] = useState("");
  const [gatePhone, setGatePhone] = useState("");

  const [deptName, setDeptName] = useState("");
  const [deptGateId, setDeptGateId] = useState("");
  const [deptPhone, setDeptPhone] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const [gatesRes, deptsRes] = await Promise.all([
        axios.get(`${SERVER_URL}/api/locations/gates`),
        axios.get(`${SERVER_URL}/api/locations/departments`),
      ]);
      setGates(gatesRes.data);
      setDepartments(deptsRes.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load locations");
    }
  };

  const handleCreateGate = async (e) => {
    e.preventDefault();
    if (!gateName.trim()) {
      toast.error("Gate name is required");
      return;
    }
    if (gateName.trim().length < 3) {
      toast.error("Gate name must be at least 3 characters");
      return;
    }
    if (gatePhone && (gatePhone.length < 10 || gatePhone.length > 13)) {
      toast.error("Phone number must be between 10 and 13 digits");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${SERVER_URL}/api/locations/gates`,
        { name: gateName, phone: gatePhone },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Gate added successfully");
      setGates(
        [...gates, res.data.gate].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setGateName("");
      setGatePhone("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create gate");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGate = async (id) => {
    if (
      !window.confirm(
        "Delete gate? This will also delete all departments assigned to it.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/locations/gates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Gate deleted");
      setGates(gates.filter((g) => g._id !== id));
      setDepartments(departments.filter((d) => d.gateId._id !== id)); // Adjust populated data
    } catch (error) {
      toast.error("Failed to delete gate");
    }
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim() || !deptGateId || !deptPhone.trim()) {
      toast.error("All fields (Name, Gate, Phone) are required");
      return;
    }
    if (deptName.trim().length < 2) {
      toast.error("Department name must be at least 2 characters");
      return;
    }
    if (deptPhone.length < 10 || deptPhone.length > 13) {
      toast.error("Phone number must be between 10 and 13 digits");
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = { name: deptName, gateId: deptGateId, phone: deptPhone };
      const res = await axios.post(
        `${SERVER_URL}/api/locations/departments`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      // Re-fetch everything to get the populated gateId object correctly
      await fetchLocations();
      toast.success("Department added successfully");
      setDeptName("");
      setDeptGateId("");
      setDeptPhone("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create department",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/locations/departments/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Department deleted");
      setDepartments(departments.filter((d) => d._id !== id));
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manage Locations
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Configure entry gates and link designated departments for visitor
              routing.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GATES SECTION */}
          <div className="space-y-6">
            {/* Create Gate Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FiPlus className="text-blue-500" /> Add New Gate
              </h2>
              <form onSubmit={handleCreateGate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Gate Name
                  </label>
                  <input
                    type="text"
                    value={gateName}
                    onChange={(e) => setGateName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="E.g., Gate A (Main Entry)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Fallback Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={gatePhone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setGatePhone(numericValue);
                    }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                    placeholder="07XXXXXXXX"
                    maxLength={13}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Used if the gate itself is the final destination.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm disabled:opacity-70"
                >
                  Save Gate
                </button>
              </form>
            </div>

            {/* List Gates */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Active Gates
              </h2>
              {gates.length === 0 ? (
                <p className="text-sm text-slate-500">No gates configured.</p>
              ) : (
                <div className="space-y-3">
                  {gates.map((gate) => (
                    <div
                      key={gate._id}
                      className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:border-blue-200 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {gate.name}
                        </p>
                        {gate.phone && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <FiPhone size={10} /> {gate.phone}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteGate(gate._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-lg shadow-sm"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DEPARTMENTS SECTION */}
          <div className="space-y-6">
            {/* Create Department Form */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FiPlus className="text-emerald-500" /> Add Target Department
              </h2>
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                    placeholder="E.g., HR Office"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Assigned Gate
                    </label>
                    <select
                      value={deptGateId}
                      onChange={(e) => setDeptGateId(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                    >
                      <option value="">Select Gate</option>
                      {gates.map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      SMS Alert Phone
                    </label>
                    <input
                      type="tel"
                      value={deptPhone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/\D/g, "");
                        setDeptPhone(numericValue);
                      }}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm"
                      placeholder="07XXXXXXXX"
                      maxLength={13}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || gates.length === 0}
                  className="w-full px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg text-sm transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Save Department
                </button>
              </form>
            </div>

            {/* List Departments */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                Configured Destinations
              </h2>
              {departments.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No departments configured.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {departments.map((dept) => (
                    <div
                      key={dept._id}
                      className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:border-emerald-200 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">
                          {dept.name}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                            Via {dept.gateId?.name || "Unknown Gate"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPhone size={10} /> {dept.phone}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteDepartment(dept._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-white rounded-lg shadow-sm"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLocations;

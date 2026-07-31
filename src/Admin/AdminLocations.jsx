import React, { useState, useEffect } from "react";
import axios from "axios";
import { FiPlus, FiTrash2, FiMapPin, FiPhone, FiCheckSquare, FiSquare, FiEdit2, FiX } from "react-icons/fi";
import toast from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminLocations = () => {
  const [gates, setGates] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states - Gate
  const [editingGateId, setEditingGateId] = useState(null);
  const [gateName, setGateName] = useState("");
  const [gatePhone, setGatePhone] = useState("");

  // Form states - Department
  const [editingDeptId, setEditingDeptId] = useState(null);
  const [deptName, setDeptName] = useState("");
  const [selectedGateIds, setSelectedGateIds] = useState([]);
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

  // ================= GATE HANDLERS =================
  const handleEditGate = (gate) => {
    setEditingGateId(gate._id);
    setGateName(gate.name);
    setGatePhone(gate.phone || "");
  };

  const handleCancelEditGate = () => {
    setEditingGateId(null);
    setGateName("");
    setGatePhone("");
  };

  const handleSaveGate = async (e) => {
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
      if (editingGateId) {
        // UPDATE GATE
        await axios.put(
          `${SERVER_URL}/api/locations/gates/${editingGateId}`,
          { name: gateName, phone: gatePhone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Gate updated successfully");
      } else {
        // CREATE GATE
        await axios.post(
          `${SERVER_URL}/api/locations/gates`,
          { name: gateName, phone: gatePhone },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Gate added successfully");
      }

      await fetchLocations();
      handleCancelEditGate();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save gate");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGate = async (id) => {
    if (
      !window.confirm(
        "Delete gate? Associated departments will be unlinked.",
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${SERVER_URL}/api/locations/gates/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Gate deleted");
      fetchLocations();
    } catch (error) {
      toast.error("Failed to delete gate");
    }
  };

  // ================= DEPARTMENT HANDLERS =================
  const handleEditDepartment = (dept) => {
    setEditingDeptId(dept._id);
    setDeptName(dept.name);
    setDeptPhone(dept.phone || "");

    const existingGates = (dept.gates && dept.gates.length > 0)
      ? dept.gates.map((g) => (typeof g === "object" ? g._id : g))
      : (dept.gateId ? [typeof dept.gateId === "object" ? dept.gateId._id : dept.gateId] : []);

    setSelectedGateIds(existingGates);
  };

  const handleCancelEditDept = () => {
    setEditingDeptId(null);
    setDeptName("");
    setSelectedGateIds([]);
    setDeptPhone("");
  };

  const handleToggleGateSelection = (gateId) => {
    setSelectedGateIds((prev) =>
      prev.includes(gateId)
        ? prev.filter((id) => id !== gateId)
        : [...prev, gateId]
    );
  };

  const handleSelectAllGates = () => {
    if (selectedGateIds.length === gates.length) {
      setSelectedGateIds([]);
    } else {
      setSelectedGateIds(gates.map((g) => g._id));
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptName.trim() || !deptPhone.trim()) {
      toast.error("Department Name and Phone are required");
      return;
    }
    if (selectedGateIds.length === 0) {
      toast.error("Please select at least one assigned gate (or all gates)");
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
      const payload = {
        name: deptName,
        gates: selectedGateIds,
        phone: deptPhone,
      };

      if (editingDeptId) {
        // UPDATE DEPARTMENT
        await axios.put(
          `${SERVER_URL}/api/locations/departments/${editingDeptId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Department ${deptName} updated successfully!`);
      } else {
        // CREATE DEPARTMENT
        await axios.post(
          `${SERVER_URL}/api/locations/departments`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success(`Department ${deptName} created and linked to ${selectedGateIds.length} gate(s)!`);
      }

      await fetchLocations();
      handleCancelEditDept();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save department",
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
      if (editingDeptId === id) handleCancelEditDept();
    } catch (error) {
      toast.error("Failed to delete department");
    }
  };

  return (
    <div className="min-h-screen text-slate-800 font-sans pb-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-5 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="p-4 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg relative z-10">
            <FiMapPin className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Manage Locations & Departments
            </h1>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Configure entry gates and edit designated departments linked across single or multiple gates.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* GATES SECTION */}
          <div className="space-y-8">
            {/* Gate Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="p-2 bg-blue-100/50 text-blue-600 rounded-lg">
                    {editingGateId ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
                  </span>{" "}
                  {editingGateId ? "Edit Entry Gate" : "Add New Gate"}
                </h2>
                {editingGateId && (
                  <button
                    onClick={handleCancelEditGate}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
                  >
                    <FiX size={14} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveGate} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    Gate Name
                  </label>
                  <input
                    type="text"
                    value={gateName}
                    onChange={(e) => setGateName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="E.g., Gate A (Main Entry)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    Fallback Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={gatePhone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setGatePhone(numericValue);
                    }}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="07XXXXXXXX"
                    maxLength={13}
                  />
                  <p className="text-[11px] font-medium text-slate-400 mt-2">
                    Used if the gate itself is the final destination.
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-3.5 mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 disabled:opacity-70 disabled:hover:shadow-none"
                >
                  {editingGateId ? "Update Gate" : "Save Gate"}
                </button>
              </form>
            </div>

            {/* List Gates */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Active Gates ({gates.length})
              </h2>
              {gates.length === 0 ? (
                <div className="bg-white/40 p-6 rounded-2xl text-center border border-white/60">
                  <p className="text-sm font-bold text-slate-400">No gates configured.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {gates.map((gate) => (
                    <div
                      key={gate._id}
                      className={`flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 ${
                        editingGateId === gate._id
                          ? "bg-blue-50 border-blue-400 shadow-md"
                          : "bg-white/40 hover:bg-white/80 border-white/60 backdrop-blur-md shadow-sm"
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-slate-800">
                          {gate.name}
                        </p>
                        {gate.phone && (
                          <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                            <FiPhone size={12} className="text-indigo-400" /> {gate.phone}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditGate(gate)}
                          className="p-2.5 text-blue-600 hover:text-blue-800 transition-colors bg-white/80 hover:bg-blue-50 rounded-xl shadow-sm"
                          title="Edit Gate"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGate(gate._id)}
                          className="p-2.5 text-slate-400 hover:text-red-600 transition-colors bg-white/80 hover:bg-red-50 rounded-xl shadow-sm"
                          title="Delete Gate"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* DEPARTMENTS SECTION */}
          <div className="space-y-8">
            {/* Department Form */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl relative group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg">
                    {editingDeptId ? <FiEdit2 size={18} /> : <FiPlus size={18} />}
                  </span>{" "}
                  {editingDeptId ? "Edit Target Department" : "Add Target Department"}
                </h2>
                {editingDeptId && (
                  <button
                    onClick={handleCancelEditDept}
                    className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg"
                  >
                    <FiX size={14} /> Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="E.g., Administration Block"
                  />
                </div>

                {/* Multi-Gate Selection Checkboxes */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700 tracking-wide uppercase text-[11px]">
                      Assigned Entry Gates *
                    </label>
                    {gates.length > 0 && (
                      <button
                        type="button"
                        onClick={handleSelectAllGates}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition"
                      >
                        {selectedGateIds.length === gates.length ? "Deselect All" : "Select All Gates"}
                      </button>
                    )}
                  </div>

                  {gates.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                      Please create at least one gate first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-white/40 border border-white/60 rounded-xl max-h-40 overflow-y-auto">
                      {gates.map((g) => {
                        const isChecked = selectedGateIds.includes(g._id);
                        return (
                          <div
                            key={g._id}
                            onClick={() => handleToggleGateSelection(g._id)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                              isChecked
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 font-bold"
                                : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                            }`}
                          >
                            {isChecked ? (
                              <FiCheckSquare className="text-emerald-600 shrink-0" size={16} />
                            ) : (
                              <FiSquare className="text-slate-400 shrink-0" size={16} />
                            )}
                            <span className="text-xs truncate">{g.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] font-medium text-slate-400 mt-1.5">
                    Assigning a department to multiple gates allows staff checked in anywhere to activate this department across all entry gates.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 tracking-wide uppercase text-[11px]">
                    SMS Alert Phone *
                  </label>
                  <input
                    type="tel"
                    value={deptPhone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/\D/g, "");
                      setDeptPhone(numericValue);
                    }}
                    className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm shadow-inner"
                    placeholder="07XXXXXXXX"
                    maxLength={13}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || gates.length === 0}
                  className="w-full px-6 py-3.5 mt-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 disabled:opacity-70 disabled:hover:shadow-none"
                >
                  {editingDeptId ? "Update Department" : "Save Department"}
                </button>
              </form>
            </div>

            {/* List Departments */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl">
              <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Configured Destinations ({departments.length})
              </h2>
              {departments.length === 0 ? (
                <div className="bg-white/40 p-6 rounded-2xl text-center border border-white/60">
                  <p className="text-sm font-bold text-slate-400">
                    No departments configured.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[460px] overflow-y-auto px-1 custom-scrollbar">
                  {departments.map((dept) => {
                    const assignedGates = (dept.gates && dept.gates.length > 0)
                      ? dept.gates
                      : (dept.gateId ? [dept.gateId] : []);

                    const gateNames = assignedGates
                      .map((g) => (typeof g === 'object' ? g.name : g))
                      .filter(Boolean)
                      .join(", ");

                    const isEditingThis = editingDeptId === dept._id;

                    return (
                      <div
                        key={dept._id}
                        className={`flex items-center justify-between p-4 border rounded-2xl transition-all duration-300 ${
                          isEditingThis
                            ? "bg-emerald-50 border-emerald-400 shadow-md"
                            : "bg-white/40 hover:bg-white/80 border-white/60 backdrop-blur-md shadow-sm"
                        }`}
                      >
                        <div>
                          <p className="font-extrabold text-slate-800">
                            {dept.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 mt-1.5 font-bold">
                            <span className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-emerald-700 shadow-sm">
                              Via: {gateNames || "All Gates"}
                            </span>
                            <span className="flex items-center gap-1 text-indigo-500">
                              <FiPhone size={12} /> {dept.phone}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditDepartment(dept)}
                            className="p-2.5 text-emerald-600 hover:text-emerald-800 transition-colors bg-white/80 hover:bg-emerald-50 rounded-xl shadow-sm"
                            title="Edit Department"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(dept._id)}
                            className="p-2.5 text-slate-400 hover:text-red-600 transition-colors bg-white/80 hover:bg-red-50 rounded-xl shadow-sm"
                            title="Delete Department"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
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

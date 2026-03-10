import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import { AlertTriangle, Printer, Users, UserCheck } from "lucide-react";
import { format } from "date-fns";
import { ClipLoader } from "react-spinners";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const AdminEmergency = () => {
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const contentRef = useRef(null);

  // Fetch visitors currently inside the premises
  const fetchActiveVisitors = async () => {
    setLoading(true);
    try {
      // By fetching all and filtering where timeOut is null
      // (For a production system with millions of rows, the backend should have a dedicated /active endpoint, but this mirrors the existing structure)
      const res = await axios.get(`${SERVER_URL}/api/visitors`);
      const allVisitors = res.data || [];
      const currentInside = allVisitors.filter((v) => !v.timeOut);
      setActiveVisitors(currentInside);
    } catch (err) {
      console.error(
        "Failed to fetch active visitors for emergency roster:",
        err,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveVisitors();
  }, []);

  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Emergency_Evacuation_Roster_${format(new Date(), "yyyy-MM-dd_HHmm")}`,
    pageStyle: `
      @page { size: landscape; margin: 15mm; }
      @media print {
        body { -webkit-print-color-adjust: exact; }
      }
    `,
  });

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-slate-800 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Warning Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-red-600 outline outline-4 outline-red-200 p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-700 text-white rounded-xl shadow-inner">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight uppercase tracking-widest">
                Emergency Evacuation Roster
              </h1>
              <p className="text-red-100 font-medium mt-1">
                Real-time active premises headcount. DO NOT close until all
                clear.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right border-r border-red-500 pr-4 hidden md:block">
              <p className="text-red-200 text-sm uppercase font-bold tracking-wider">
                Current Headcount
              </p>
              <p className="text-3xl font-black text-white">
                {activeVisitors.length}
              </p>
            </div>
            <button
              onClick={handlePrint}
              disabled={loading}
              className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-700 font-bold px-6 py-3 rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              <Printer size={18} /> Print Roster
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end">
          <button
            onClick={fetchActiveVisitors}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-semibold"
          >
            Refresh Data
          </button>
        </div>

        {/* Printable Area */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-8"
          ref={contentRef}
        >
          {/* Print-Only Header (Hidden on Screen) */}
          <div className="hidden print:block mb-8 border-b-2 border-red-600 pb-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-red-700 uppercase tracking-tight">
                  EVACUATION ROSTER
                </h2>
                <p className="text-slate-600 font-bold mt-1 text-lg">
                  NAMBALE MAGNET SCHOOL
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500 font-bold uppercase">
                  Generated At
                </p>
                <p className="text-lg font-bold text-slate-800">
                  {format(new Date(), "dd/MM/yyyy HH:mm:ss")}
                </p>
                <p className="text-sm font-bold mt-2">
                  Total Expected:{" "}
                  <span className="text-red-600 text-xl">
                    {activeVisitors.length}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <ClipLoader color="#ef4444" size={50} />
            </div>
          ) : activeVisitors.length === 0 ? (
            <div className="text-center py-20 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200 m-4">
              <UserCheck size={64} className="mx-auto text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-emerald-800 mb-2">
                Premises Clear
              </h3>
              <p className="text-emerald-600 font-medium">
                There are currently no active visitors logged inside the
                facility.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto print:overflow-visible print:w-full">
              <table className="w-full text-left border-collapse print:text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-700 print:bg-slate-200">
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                      Visitor Name
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                      Phone Number
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                      Destination Dept
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                      Entry Gate
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                      Time In
                    </th>
                    <th className="px-4 py-3 font-bold uppercase tracking-wider text-xs print:table-cell hidden bg-red-100 border-l-2 border-red-300 w-24 text-center">
                      Found?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm print:text-xs">
                  {activeVisitors.map((v, idx) => (
                    <tr
                      key={v._id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-100">
                        {v.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700 border-r border-slate-100">
                        {v.phone}
                      </td>
                      <td className="px-4 py-3 text-slate-800 border-r border-slate-100">
                        {v.department}
                      </td>
                      <td className="px-4 py-3 text-slate-600 border-r border-slate-100">
                        {v.gate}
                      </td>
                      <td className="px-4 py-3 text-slate-500 border-r border-slate-100">
                        {v.vehicleReg || "Walk In"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 border-r border-slate-100">
                        {format(new Date(v.createdAt), "HH:mm")}
                      </td>
                      <td className="px-4 py-3 print:table-cell hidden border border-slate-300"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="hidden print:block mt-8 pt-8 border-t-2 border-slate-800">
                <div className="flex justify-between font-bold text-sm">
                  <p>Cleared By (Name): ___________________________</p>
                  <p>Signature: ___________________________</p>
                  <p>Time: ______________</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmergency;

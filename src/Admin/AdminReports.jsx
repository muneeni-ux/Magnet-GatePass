import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Activity, Users, Clock, Loader2, ShieldAlert, FileText, UserCheck, Download } from "lucide-react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
];

export default function AdminReports() {
  const [data, setData] = useState({
    departments: [],
    hourly: [],
    totalVisits: 0,
  });
  const [complianceData, setComplianceData] = useState(null);
  const [occurrenceData, setOccurrenceData] = useState([]);
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const results = await Promise.allSettled([
          axios.get(`${SERVER_URL}/api/reports/analytics`),
          axios.get(`${SERVER_URL}/api/reports/compliance`),
          axios.get(`${SERVER_URL}/api/reports/occurrences`),
          axios.get(`${SERVER_URL}/api/reports/staff-activity`)
        ]);

        if (results[0].status === 'fulfilled' && results[0].value.data.success) {
          setData(results[0].value.data.data);
        }
        if (results[1].status === 'fulfilled' && results[1].value.data.success) {
          setComplianceData(results[1].value.data.data);
        }
        if (results[2].status === 'fulfilled' && results[2].value.data.success) {
          console.log("Setting occurrence data:", results[2].value.data.data);
          setOccurrenceData(results[2].value.data.data);
        }
        if (results[3].status === 'fulfilled' && results[3].value.data.success) {
          setStaffData(results[3].value.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
        toast.error("Failed to load traffic heatmaps");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const dateStr = format(new Date(), "dd/MM/yyyy HH:mm:ss");

    const addHeaderAndFooter = (doc) => {
        try { doc.addImage("/VisiTrack-L3.png", "PNG", 14, 10, 25, 25); } catch (e) {}
        
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59);
        doc.text("VISITRACK SECURITY SYSTEM", 45, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text("System Analytics & Performance Summary", 45, 26);
        
        doc.setFontSize(9);
        doc.text(`Generated on: ${dateStr}`, 45, 32);
        
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 40, pageWidth - 14, 40);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text("© 2026 VisiTrack Security System. All rights reserved.", 14, pageHeight - 10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 25, pageHeight - 10);
    };

    addHeaderAndFooter(doc);

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Traffic Summary", 14, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Estimated Monthly Volume: ${data.totalVisits.toLocaleString()} visitors`, 14, 58);
    doc.text(`Departments Monitored: ${data.departments?.length || 0}`, 14, 64);

    if (staffData.length > 0) {
      autoTable(doc, {
        head: [["Staff Name", "Role", "Registered", "Missing Checkouts", "Compliance Rate"]],
        body: staffData.map(s => [
          s.staffName, 
          s.role, 
          s.totalRegistered, 
          s.missingCheckouts, 
          `${s.complianceRate ? s.complianceRate.toFixed(1) : 0}%`
        ]),
        startY: 75,
        styles: { fontSize: 8, cellPadding: 3, font: "helvetica" },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 253, 244] },
        didDrawPage: (data) => {
          if (doc.internal.getNumberOfPages() > 1) {
            addHeaderAndFooter(doc);
          }
        },
        margin: { top: 45, bottom: 20 },
      });
    }

    doc.save(`System_Reports_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Analytics Report Generated!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">
          Aggregating Traffic Data...
        </p>
      </div>
    );
  }

  const ackData = complianceData?.acknowledgmentRate?.length > 0 ? [
    { name: 'Acknowledged', count: complianceData.acknowledgmentRate.filter(d => d._id).reduce((sum, d) => sum + d.count, 0), fill: "#10b981" },
    { name: 'Unacknowledged', count: complianceData.acknowledgmentRate.filter(d => !d._id).reduce((sum, d) => sum + d.count, 0), fill: "#f59e0b" }
  ].filter(d => d.count > 0) : [];

  return (
    <div className="min-h-screen pb-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 font-sans text-slate-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 glass-panel p-6 sm:p-8 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-4 tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg">
              <Activity className="h-6 w-6" />
            </div>
            Traffic & Analytics
          </h1>
          <p className="text-slate-500 text-sm md:text-base mt-2 font-medium">
            Site-wide visitor patterns and departmental load distribution.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full md:w-auto">
          <button
            onClick={exportToPDF}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3.5 flex-shrink-0 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 w-full sm:w-auto"
          >
            <Download size={18} />
            Export PDF
          </button>
          <div className="bg-white/40 px-6 py-4 rounded-2xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] sm:flex items-center gap-4 backdrop-blur-md hidden">
            <div className="p-3 bg-white/60 border border-white rounded-xl shadow-inner">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Monthly Volume
              </p>
              <p className="text-2xl font-extrabold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {data.totalVisits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="p-2 bg-slate-100/50 text-slate-600 rounded-lg backdrop-blur-sm"><Clock className="w-5 h-5" /></span>
              Peak Entry Hours
            </h2>
            <span className="text-xs font-bold px-3 py-1.5 bg-white/50 border border-white/80 text-slate-600 rounded-lg shadow-sm backdrop-blur-md">
              24H Aggregate
            </span>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative z-10">
            {data.hourly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.hourly}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(255,255,255,0.4)"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.4)" }}
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.6)",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="visitors"
                    name="Entries"
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No hourly data available yet.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="p-2 bg-indigo-100/50 text-indigo-600 rounded-lg backdrop-blur-sm"><Activity className="w-5 h-5" /></span>
              Department Load
            </h2>
            <span className="text-xs font-bold px-3 py-1.5 bg-white/50 border border-white/80 text-slate-600 rounded-lg shadow-sm backdrop-blur-md">
              This Month
            </span>
          </div>

          <div className="flex-1 w-full min-h-[300px] relative z-10">
            {data.departments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.departments}
                    cx="50%"
                    cy="45%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {data.departments.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.6)",
                      background: "rgba(255,255,255,0.9)",
                      backdropFilter: "blur(8px)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                    }}
                    formatter={(value, name) => [`${value} Visitors`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry, index) => (
                      <span className="text-slate-700 font-medium text-sm ml-1">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                 No department data available yet.
               </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60 flex flex-col mt-8 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8 relative z-10">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="p-2 bg-red-100/50 text-red-600 rounded-lg backdrop-blur-sm"><ShieldAlert className="w-5 h-5" /></span>
            Security Occurrences by Gate
          </h2>
          <span className="text-xs font-bold px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-[0_2px_10px_rgba(239,68,68,0.1)] backdrop-blur-md">
            Incident Tracking
          </span>
        </div>
        
        <div className="flex-1 w-full min-h-[300px] relative z-10">
          {occurrenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={occurrenceData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.4)" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.4)" }}
                  contentStyle={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="totalLogs" name="Standard Logs" stackId="a" fill="#3b82f6" barSize={40} />
                <Bar dataKey="unusualEvents" name="Unusual Events" stackId="a" fill="#ef4444" barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400 text-sm min-h-[200px]">
               <div className="flex flex-col items-center">
                 <ShieldAlert className="h-8 w-8 text-slate-300 mb-2" />
                 <p>No occurrence data available yet.</p>
               </div>
             </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="p-2 bg-amber-100/50 text-amber-600 rounded-lg backdrop-blur-sm"><FileText className="w-5 h-5" /></span>
              Visitor Compliance
            </h2>
            <span className="text-xs font-bold px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg shadow-[0_2px_10px_rgba(245,158,11,0.1)] backdrop-blur-md">
              Check-outs
            </span>
          </div>

          <div className="flex-1 w-full min-h-[250px] mb-4 relative z-10">
            {complianceData && complianceData.byNature?.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={complianceData.byNature}
                   cx="50%"
                   cy="45%"
                   innerRadius={60}
                   outerRadius={90}
                   paddingAngle={5}
                   dataKey="count"
                   nameKey="_id"
                 >
                   {complianceData.byNature.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry._id === 'official' ? "#3b82f6" : "#f59e0b"} />
                   ))}
                 </Pie>
                  <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span style={{ textTransform: 'capitalize' }}>{value}</span>} />
               </PieChart>
             </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm min-h-[150px]">
                 <div className="flex flex-col items-center">
                   <FileText className="h-8 w-8 text-slate-300 mb-2" />
                   <p>No compliance data available.</p>
                 </div>
               </div>
            )}
          </div>
          
          <div className="border-t border-white/60 pt-6 relative z-10">
            <h3 className="text-[11px] uppercase tracking-widest font-extrabold text-slate-500 mb-4">Overstay Warnings (No Check-out)</h3>
             {complianceData && complianceData.overstays?.length > 0 ? (
               <ul className="space-y-3">
                 {complianceData.overstays.map((dept, i) => (
                   <li key={i} className="flex justify-between items-center text-sm p-3.5 bg-red-50/50 rounded-xl border border-red-100 shadow-sm backdrop-blur-sm transition-all hover:bg-red-50/80">
                     <span className="text-slate-800 font-bold">{dept._id}</span>
                     <span className="font-extrabold text-red-600 flex items-center gap-1.5 bg-white/60 px-2.5 py-1 rounded-lg border border-red-100">
                        <Clock className="w-4 h-4" />
                        {dept.count} overstays
                     </span>
                   </li>
                 ))}
               </ul>
             ) : (
               <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-emerald-700 text-sm">
                  <UserCheck className="w-4 h-4" />
                  <span>All visitors have checked out properly.</span>
               </div>
             )}
          </div>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="p-2 bg-emerald-100/50 text-emerald-600 rounded-lg backdrop-blur-sm"><UserCheck className="w-5 h-5" /></span>
              Staff Efficiency
            </h2>
            <span className="text-xs font-bold px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg shadow-[0_2px_10px_rgba(16,185,129,0.1)] backdrop-blur-md">
              Performance
            </span>
          </div>

          <div className="flex-1 w-full overflow-y-auto max-h-[350px] pr-2 custom-scrollbar relative z-10">
             {staffData.length > 0 ? (
                <div className="space-y-3.5">
                  {staffData.map((staff, i) => (
                    <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-white/60 bg-white/40 hover:bg-white/70 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] backdrop-blur-sm">
                      <div>
                        <p className="font-extrabold text-slate-800 text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{staff.staffName}</p>
                        <p className="text-[11px] font-bold tracking-widest uppercase text-slate-500 mt-1">{staff.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-700">{staff.totalRegistered} Registered</p>
                        <p className={`text-xs font-extrabold mt-1.5 px-3 py-1 rounded-lg inline-block shadow-sm ${staff.complianceRate >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : staff.complianceRate >= 70 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                           {staff.complianceRate ? staff.complianceRate.toFixed(1) : 0}% check-out rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 text-sm min-h-[200px]">
                 <div className="flex flex-col items-center">
                   <Users className="h-8 w-8 text-slate-300 mb-2" />
                   <p>No staff activity data available.</p>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-white/60 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <span className="p-2 bg-blue-100/50 text-blue-600 rounded-lg backdrop-blur-sm"><UserCheck className="w-5 h-5" /></span>
              Host Acknowledgment Rate
            </h2>
            <span className="text-xs font-bold px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg shadow-sm backdrop-blur-md">
              Security
            </span>
          </div>

          <div className="flex-1 w-full min-h-[250px] mb-4 relative z-10">
            {ackData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={ackData}
                   cx="50%"
                   cy="45%"
                   innerRadius={60}
                   outerRadius={90}
                   paddingAngle={5}
                   dataKey="count"
                   nameKey="name"
                 >
                   {ackData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.fill} />
                   ))}
                 </Pie>
                  <Tooltip contentStyle={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                 <Legend verticalAlign="bottom" height={36} iconType="circle" />
               </PieChart>
             </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm min-h-[150px]">
                 <div className="flex flex-col items-center">
                   <ShieldAlert className="h-8 w-8 text-slate-300 mb-2" />
                   <p>No acknowledgment data available.</p>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

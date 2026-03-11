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
  LineChart,
  Line,
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
        const [analyticsRes, complianceRes, occurrenceRes, staffRes] = await Promise.all([
          axios.get(`${SERVER_URL}/api/reports/analytics`),
          axios.get(`${SERVER_URL}/api/reports/compliance`),
          axios.get(`${SERVER_URL}/api/reports/occurrences`),
          axios.get(`${SERVER_URL}/api/reports/staff-activity`)
        ]);

        if (analyticsRes.data.success) {
          setData(analyticsRes.data.data);
        }
        if (complianceRes.data.success) {
          setComplianceData(complianceRes.data.data);
        }
        if (occurrenceRes.data.success) {
          setOccurrenceData(occurrenceRes.data.data);
        }
        if (staffRes.data.success) {
          setStaffData(staffRes.data.data);
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
        // Header
        try {
          doc.addImage("/magnetlogo.jpg", "JPEG", 14, 10, 25, 25);
        } catch (e) {
          console.warn("Logo failed to load in PDF:", e);
        }
        
        doc.setFontSize(18);
        doc.setTextColor(30, 41, 59); // Slate-800
        doc.text("MAGNET SECURITY SYSTEM", 45, 20);
        
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139); // Slate-500
        doc.text("System Analytics & Performance Summary", 45, 26);
        
        doc.setFontSize(9);
        doc.text(`Generated on: ${dateStr}`, 45, 32);
        
        // Horizontal line
        doc.setDrawColor(226, 232, 240); // Slate-200
        doc.line(14, 40, pageWidth - 14, 40);

        // Footer
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184); // Slate-400
        doc.text("© 2024 Magnet Security System. All rights reserved.", 14, pageHeight - 10);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 25, pageHeight - 10);
    };

    // Initial Header
    addHeaderAndFooter(doc);

    // Summary Content
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text("Traffic Summary", 14, 50);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(`Estimated Monthly Volume: ${data.totalVisits.toLocaleString()} visitors`, 14, 58);
    doc.text(`Departments Monitored: ${data.departments?.length || 0}`, 14, 64);

    // Staff Efficiency Table
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
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' }, // Emerald-500
        alternateRowStyles: { fillColor: [240, 253, 244] }, // Emerald-50
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

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Traffic & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Site-wide visitor patterns and departmental load distribution.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex-shrink-0 rounded-xl text-sm font-medium transition-colors shadow-sm"
          >
            <Download size={16} />
            Export PDF
          </button>
          {/* Quick Stat Card */}
          <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Monthly Volume
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {data.totalVisits.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Hourly Heatmap (Bar Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Peak Entry Hours
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
              24H Aggregate
            </span>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
            {data.hourly.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.hourly}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f1f5f9" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="visitors"
                    name="Entries"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
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

        {/* Department Distribution (Pie Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-400" />
              Department Load
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md">
              This Month
            </span>
          </div>

          <div className="flex-1 w-full min-h-[300px]">
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
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
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

      {/* NEW REPORTS SECTION */}
      
      {/* 1. Security Occurrences & Incident Report */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Security Occurrences by Gate
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-700 rounded-md">
            Incident Tracking
          </span>
        </div>
        
        <div className="flex-1 w-full min-h-[300px]">
          {occurrenceData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={occurrenceData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="totalLogs" name="Standard Logs" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} barSize={40} />
                <Bar dataKey="unusualEvents" name="Unusual Events" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
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
        {/* 2. Visitor Compliance & Overstay */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Visitor Compliance
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md">
              Check-outs
            </span>
          </div>

          <div className="flex-1 w-full min-h-[250px] mb-4">
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
                 <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
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
          
          <div className="border-t border-slate-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Overstay Warnings (No Check-out)</h3>
             {complianceData && complianceData.overstays?.length > 0 ? (
               <ul className="space-y-2">
                 {complianceData.overstays.map((dept, i) => (
                   <li key={i} className="flex justify-between items-center text-sm p-2 bg-red-50/50 rounded-lg border border-red-100">
                     <span className="text-slate-700 font-medium">{dept._id}</span>
                     <span className="font-bold text-red-600 flex items-center gap-1">
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

        {/* 3. Staff Efficiency & Activity Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              Staff Efficiency
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-md">
              Performance
            </span>
          </div>

          <div className="flex-1 w-full overflow-y-auto max-h-[350px] pr-2 scrollbar-thin scrollbar-thumb-slate-200">
             {staffData.length > 0 ? (
                <div className="space-y-3">
                  {staffData.map((staff, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-800">{staff.staffName}</p>
                        <p className="text-xs text-slate-500 capitalize">{staff.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{staff.totalRegistered} Registered</p>
                        <p className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-block ${staff.complianceRate >= 90 ? 'bg-emerald-100 text-emerald-700' : staff.complianceRate >= 70 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
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
    </div>
  );
}

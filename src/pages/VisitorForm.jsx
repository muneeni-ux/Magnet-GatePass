
import React, { useState } from "react";
import {
  User,
  MapPin,
  IdCard,
  Car,
  Building2,
  Phone,
  UserCheck,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Map each department to the office’s phone number (2547XXXXXXXX format, no “+”)
const departmentPhones = {
  Logistics: "254738380692",
  "Human Resource": "254738380692",
  Production: "254738380692",
  Finance: "254738380692",
  "Sales and Marketing": "254738380692",
  BDS: "254738380692",
  "Directors Office": "254738380692",
};

export default function VisitorForm() {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    idNumber: "",
    vehicleReg: "",
    company: "",
    visitorType: "",
    phone: "",
    officer: "",
    department: "",
    purpose: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Save the visitor record
      const response = await fetch(`${SERVER_URL}/api/visitors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit visitor data");
      }

      const savedVisitor = await response.json();
      console.log("Visitor saved:", savedVisitor);

      // 2) Determine which office phone to notify
      const officePhone = departmentPhones[formData.department];
      if (!officePhone) {
        console.warn(
          "No phone number mapped for department:",
          formData.department
        );
      }

      // 3) Compose an SMS message
      const smsMessage = `New Visitor Alert:
Name: ${formData.name}
Phone: ${formData.phone}
Address: ${formData.address}
ID Number: ${formData.idNumber}
Vehicle Reg: ${formData.vehicleReg}
Company: ${formData.company}
Visitor Type: ${formData.visitorType}
Officer to Visit: ${formData.officer}
Department: ${formData.department}
Purpose: ${formData.purpose}`;

      // 4) Send SMS to the office (instead of an email)
      if (officePhone) {
        const smsResponse = await fetch(`${SERVER_URL}/api/sms/send-sms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: officePhone,
            message: smsMessage,
          }),
        });

        if (!smsResponse.ok) {
          console.error("SMS sending failed");
          toast.error("Form saved but failed to notify the officer via SMS.");
        } else {
          console.log("SMS sent successfully");
          toast.success("Visitor registered and officer notified via SMS!");
        }
      } else {
        toast.success("Visitor registered (no SMS sent: no phone mapped).");
      }

      // 5) Reset form
      setFormData({
        name: "",
        address: "",
        idNumber: "",
        vehicleReg: "",
        company: "",
        visitorType: "",
        phone: "",
        officer: "",
        department: "",
        purpose: "",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("There was a problem submitting the form.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-200 via-blue-100 to-yellow-50 text-gray-900 font-sans mt-12 md:mt-24">
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-5xl shadow-2xl rounded-3xl p-10 sm:p-12 bg-white/60 backdrop-blur-2xl border border-white/40">
          <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-10">
            Visitor Registration
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base"
          >
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Address"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              />
            </div>

            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="ID Number"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              />
            </div>

            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Company (Optional)"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
              />
            </div>

            <div className="relative">
              <ClipboardCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="visitorType"
                value={formData.visitorType}
                onChange={handleChange}
                placeholder="Visitor Type (e.g. Contractor)"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              />
            </div>

            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleChange}
                placeholder="Vehicle Registration"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
              />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Visitor’s Phone Number"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              />
            </div>

            <div className="relative">
              <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="officer"
                value={formData.officer}
                onChange={handleChange}
                placeholder="Officer to Visit"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              />
            </div>

            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition"
                required
              >
                <option value="">Select Department</option>
                <option value="Logistics">Logistics</option>
                <option value="Human Resource">Human Resource</option>
                <option value="Production">Production</option>
                <option value="Finance">Finance</option>
                <option value="Sales and Marketing">Sales and Marketing</option>
                <option value="BDS">BDS</option>
                <option value="Directors Office">Directors Office</option>
              </select>
            </div>

            <textarea
              name="purpose"
              placeholder="Purpose of Visit"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full border-2 border-indigo-400 p-3 rounded-lg bg-white bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-indigo-600 hover:shadow-lg transition sm:col-span-2"
              rows="4"
              required
            />

            <div className="flex justify-center sm:col-span-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-700 hover:bg-indigo-800"
                } text-white px-10 py-3 rounded-full shadow-lg transition font-semibold text-lg tracking-wide`}
              >
                {loading ? "Submitting..." : "Submit Form"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

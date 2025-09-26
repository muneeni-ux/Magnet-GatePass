import React, { useState } from "react";
import { User, IdCard, Car, Phone, BookOpen } from "lucide-react";
import { toast } from "react-hot-toast";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

// Map each department to the office’s phone number (format: 2547XXXXXXXX)
const departmentPhones = {
  "Dean of Students": "254702563223",
  "Head Teacher": "254727768331",
  Farm: "254702031959",
  Finance: "254745096003",
  "Social Worker": "254721137324",
  "Directors Office": "254727768331",
};

export default function VisitorForm() {
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    phone: "",
    vehicleReg: "",
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

      if (!response.ok) throw new Error("Failed to submit visitor data");

      const savedVisitor = await response.json();
      console.log("Visitor saved:", savedVisitor);

      // 2) Find department phone
      const officePhone = departmentPhones[formData.department];
      if (!officePhone) {
        console.warn(
          "No phone number mapped for department:",
          formData.department
        );
      }

      // 3) Compose SMS message
      const smsMessage = `New Visitor Alert:
Name: ${formData.name}
Phone: ${formData.phone}
ID Number: ${formData.idNumber}
Vehicle Reg: ${formData.vehicleReg || "N/A"}
Department: ${formData.department}
Purpose: ${formData.purpose}`;

      // 4) Send SMS
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
          toast.error("Form saved but SMS notification failed.");
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
        idNumber: "",
        phone: "",
        vehicleReg: "",
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-200 via-blue-100 to-yellow-50 text-gray-900 font-sans mt-6 md:mt-12">
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="relative w-full max-w-4xl shadow-2xl rounded-3xl p-10 sm:p-12 bg-white/70 backdrop-blur-xl border border-white/40">
          <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-10">
            Visitor Registration
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm sm:text-base"
          >
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={(e) => {
                  // Allow only letters, spaces, and basic punctuation
                  const value = e.target.value.replace(/[0-9]/g, "");
                  setFormData({ ...formData, name: value });
                }}
                placeholder="Full Name"
                required
                pattern="[A-Za-z\s]+"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* ID Number */}
            {/* <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="ID Number"
                required
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div> */}
            {/* ID Number */}
            <div className="relative">
              <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="idNumber"
                value={formData.idNumber}
                onChange={(e) => {
                  // Allow only digits and max length 12
                  const value = e.target.value.replace(/\D/g, "").slice(0, 12);
                  setFormData({ ...formData, idNumber: value });
                }}
                placeholder="ID Number"
                required
                maxLength={12}
                inputMode="numeric"
                pattern="\d{1,12}"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                required
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFormData({ ...formData, phone: value });
                }}
                placeholder="Phone Number"
                maxLength={12}
                inputMode="numeric"
                pattern="\d{1,12}"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Vehicle Registration */}
            <div className="relative">
              <Car className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <input
                type="text"
                name="vehicleReg"
                value={formData.vehicleReg}
                onChange={handleChange}
                placeholder="Vehicle Registration (Optional)"
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            {/* Department */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600" />
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full pl-10 border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600"
              >
                <option value="">Select Department</option>
                <option value="Dean of Students">Dean of Students</option>
                <option value="Head Teacher">Head Teacher</option>
                <option value="Farm">Farm</option>
                <option value="Finance">Finance</option>
                <option value="Social Worker">Social Worker</option>
                <option value="Directors Office">Directors Office</option>
              </select>
            </div>

            {/* Purpose */}
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Purpose of Visit"
              required
              className="w-full border-2 border-indigo-400 p-3 rounded-lg bg-white focus:ring-2 focus:ring-indigo-600 sm:col-span-2"
              rows="4"
            />

            {/* Submit */}
            <div className="flex justify-center sm:col-span-2 mt-6">
              <button
                type="submit"
                disabled={loading}
                className={`${
                  loading
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-700 hover:bg-indigo-800"
                } text-white px-10 py-3 rounded-full shadow-lg transition font-semibold text-lg`}
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

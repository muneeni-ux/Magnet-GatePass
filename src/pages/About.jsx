import React, { useEffect, useState } from "react";
import { Handshake, Clock, ClipboardList, Phone } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const SERVER_URL = process.env.REACT_APP_SERVER_URL;

const About = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch(`${SERVER_URL}/api/inquiry-staff`);
        const data = await response.json();
        setProfiles(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch profiles:", error);
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen overflow-x-hidden font-sans animate-fadeIn mt-12 md:mt-16">
      
      {/* Hero Section */}
      <div
        className="w-full min-h-[50vh] bg-cover bg-center flex items-center justify-center text-center px-4"
        style={{
          backgroundImage:
            "url('https://thenambalemagnetschool.sc.ke/wp-content/uploads/2019/08/The-Nambale-Magnet-School-Students-tuition-fees.jpg')",
        }}
      >
        <div className="bg-black bg-opacity-60 p-8 rounded-2xl shadow-lg">
          <h1 className="text-3xl sm:text-4xl md:text-5xl text-white font-bold mb-3 animate-fadeIn">
            About MagTrack
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-3xl mx-auto animate-fadeInDelay">
            A modern, secure visitor access management system designed to record,
            monitor, and control all school visits — enhancing student safety,
            staff accountability, and professional engagement.
          </p>
        </div>
      </div>

      {/* Why MagTrack Section */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-indigo-800 animate-fadeIn">
            Why MagTrack?
          </h2>
          <p className="text-base text-gray-700 mb-12 text-center leading-relaxed max-w-3xl mx-auto animate-fadeInDelay">
            At <strong>Nambale Magnet School</strong>, the safety of our students
            and staff is our top priority. MagTrack provides a structured and
            reliable way to manage visitors, ensuring that every individual in school is properly recorded, verified, and monitored.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 animate-fadeInDelay2">
            <div className="bg-indigo-50 p-6 rounded-xl shadow-md text-center hover:scale-105 transition duration-300">
              <Handshake size={40} className="text-indigo-700 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-indigo-800">
                Professional Reception
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Visitors are welcomed respectfully while maintaining strict
                access control.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl shadow-md text-center hover:scale-105 transition duration-300">
              <Clock size={40} className="text-indigo-700 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-indigo-800">
                Time Tracking
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Automatically logs entry and exit times for accurate monitoring.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl shadow-md text-center hover:scale-105 transition duration-300">
              <ClipboardList size={40} className="text-indigo-700 mb-3 mx-auto" />
              <h3 className="text-lg font-semibold text-indigo-800">
                Centralized Records
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Easily access historical visitor data for audits and reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-indigo-800 animate-fadeIn">
            How MagTrack Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 animate-fadeInDelay">
            {[
              {
                step: "1",
                title: "Visitor Check-In",
                desc: "Visitors provide their details and reason for visit at the entrance desk.",
              },
              {
                step: "2",
                title: "Verification",
                desc: "Visitor information is verified and securely stored in the system.",
              },
              {
                step: "3",
                title: "Live Monitoring",
                desc: "Staff can see who is currently in school at any time.",
              },
              {
                step: "4",
                title: "Check-Out",
                desc: "Exit time is recorded to complete the visit log.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md text-center"
              >
                <div className="text-4xl font-bold text-indigo-700 mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-indigo-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="w-full py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-800 mb-8 animate-fadeIn">
            Security & Data Protection
          </h2>
          <p className="text-gray-700 text-base leading-relaxed max-w-3xl mx-auto animate-fadeInDelay">
            MagTrack is built with security at its core. All visitor data is
            protected and accessible only to authorized school staff, ensuring
            privacy, compliance, and accountability.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fadeInDelay2">
            <div className="bg-indigo-50 p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-indigo-800 mb-2">
                Controlled Access
              </h3>
              <p className="text-sm text-gray-600">
                Only approved personnel can view, edit, or manage visitor data.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl shadow-sm">
              <h3 className="font-semibold text-indigo-800 mb-2">
                Audit & Accountability
              </h3>
              <p className="text-sm text-gray-600">
                Detailed logs support investigations, reporting, and compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Staff Section */}
      <section className="w-full py-16 px-6 bg-indigo-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-indigo-800 mb-12 animate-fadeIn">
            Inquiry & Support Desk
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">
              Loading staff profiles...
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 animate-fadeInDelay3">
              {profiles.map((profile, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition duration-300"
                >
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-md">
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-indigo-800">
                    {profile.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{profile.role}</p>

                  <div className="mt-4">
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex justify-center items-center gap-2 text-sm text-indigo-700 hover:underline"
                    >
                      <Phone size={18} />
                      <span>{profile.phone}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254743072126?text=Hello%20Nambale%20Magnet%20School%20Support"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center animate-bounce transition-all duration-300 z-10"
        title="Chat with Support on WhatsApp"
      >
        <FaWhatsapp size={28} />
      </a>
    </div>
  );
};

export default About;

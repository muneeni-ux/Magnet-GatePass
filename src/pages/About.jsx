
import React, { useEffect, useState } from "react";
import { Handshake, BarChart, Briefcase, Mail, Phone } from "lucide-react";

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
    <div className="relative flex flex-col min-h-screen overflow-x-hidden font-light italic animate-fadeIn mt-12 md:mt-32">
      {/* Hero Section */}
      <div
        className="w-full min-h-[50vh] bg-cover bg-center flex items-center justify-center text-center px-4"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=500&dpr=2')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-black bg-opacity-60 p-8 rounded-xl">
          <h1 className="italic text-3xl sm:text-4xl md:text-5xl text-white font-semibold mb-3 animate-fadeIn">
            About Our Company
          </h1>
          <p className="italic text-base sm:text-lg md:text-xl text-gray-100 max-w-2xl mx-auto animate-fadeInDelay">
            Empowering modern agriculture through innovative, sustainable, and
            quality solutions.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="w-full py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="italic text-3xl md:text-4xl font-bold text-center mb-10 text-blue-700 animate-fadeIn">
            Our Mission & Values
          </h2>
          <p className="italic text-base text-gray-700 mb-10 text-center leading-relaxed max-w-3xl mx-auto animate-fadeInDelay">
            We are dedicated to supporting farmers, pet owners, and
            agribusinesses with top-quality products. From animal drugs and pet
            food to pesticides and hybrid seeds, our mission is to enhance
            productivity, sustainability, and animal welfare.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fadeInDelay2">
            <div className="bg-blue-50 p-6 rounded-xl shadow-lg text-center hover:scale-105 transition duration-300">
              <Handshake size={36} className="text-blue-700 mb-3 mx-auto" />
              <h3 className="italic text-lg font-semibold text-blue-800">
                Trusted Quality
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                All our products meet the highest standards in animal health and
                crop care.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-lg text-center hover:scale-105 transition duration-300">
              <BarChart size={36} className="text-blue-700 mb-3 mx-auto" />
              <h3 className="italic text-lg font-semibold text-blue-800">
                Innovative Solutions
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Blending science and practice for cutting-edge agro solutions.
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-xl shadow-lg text-center hover:scale-105 transition duration-300">
              <Briefcase size={36} className="text-blue-700 mb-3 mx-auto" />
              <h3 className="italic text-lg font-semibold text-blue-800">
                Customer Support
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Guidance, after-sale support, and tailored expert advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team / Contacts Section */}
      <section className="w-full py-16 px-6 bg-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="italic text-3xl font-bold text-center text-blue-800 mb-12 animate-fadeIn">
            Inquiry Staff
          </h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading staff profiles...</p>
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
                  <h3 className="italic text-xl font-semibold text-blue-800">
                    {profile.name}
                  </h3>
                  <p className="italic text-sm text-gray-600 mt-1">
                    {profile.role}
                  </p>

                  <div className="mt-4 space-y-2">
                    <a
                      href={`mailto:${profile.email}`}
                      className="flex justify-center items-center gap-2 text-sm text-blue-700 hover:underline"
                    >
                      <Mail size={18} />
                      <span>{profile.email}</span>
                    </a>
                    <a
                      href={`tel:${profile.phone}`}
                      className="flex justify-center items-center gap-2 text-sm text-blue-700 hover:underline"
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

      {/* Floating Help Button */}
      <a
        href="mailto:support@agrofirm.com"
        className="fixed bottom-6 right-6 bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-full shadow-lg flex items-center justify-center animate-bounce transition-all duration-300"
        title="Contact Support"
      >
        <Mail size={28} />
      </a>
    </div>
  );
};

export default About;

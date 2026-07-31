
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollTop';
import ResetPassword from './pages/ResetPassword';
import HostAck from './pages/HostAck';
import { Toaster } from 'react-hot-toast';
// Admin components
import Signup from './components/SignUp';
import UsersDetails from "./Admin/UserDetails";
import AdminDashboard from "./Admin/AdminDashboard";
import ProtectedRoute from "./Admin/ProtectedRoute";
import VisitordsDetails from './Admin/VisitordsDetails';
import AdminStaffRoster from './Admin/AdminStaffRoster';
import AdminOccurrence from './Admin/AdminOccurrence';
import AdminFAQs from './Admin/AdminFAQs';
// User components
import Home from './pages/Home';
// import About from './pages/About';
import Occurrence from './pages/Occurrence';
import NotFound from './pages/NotFound';
import Form from './pages/VisitorForm';
import History from './pages/VisitorHistory';
import FAQs from './pages/FAQs';
import Profile from './pages/Profile';
import HelpDesk from './pages/HelpDesk';
import AdminInquiry from './Admin/AdminInquiry';
import AdminNotifications from './Admin/AdminNotifications';
import AdminLocations from './Admin/AdminLocations';
import AdminEmergency from './Admin/AdminEmergency';
import AdminReports from './Admin/AdminReports';
import AdminSMSLogs from './Admin/AdminSMSLogs';
import { SettingsProvider } from './context/SettingsContext';

import BottomTabBar from './components/BottomTabBar';

const App = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!token;
  const isAdmin = user?.isAdmin;

  // Paths where Navbar/Footer should be hidden
  const hideNavAndFooterPaths = ['/', '/visitrack/admin'];

  const shouldHideNavAndFooter = hideNavAndFooterPaths.includes(location.pathname) || 
                                 location.pathname.startsWith('/reset-password/') || 
                                 location.pathname.startsWith('/v/');

  return (
    <SettingsProvider>
      <div className="pb-24 md:pb-0 overflow-x-hidden min-h-screen">
        <ScrollToTop />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #334155',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.025em'
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#042f2e' },
              style: { border: '1px solid #065f46' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#450a0a' },
              style: { border: '1px solid #991b1b' },
            },
          }}
        />

        {/* Conditionally show Navbar */}
        {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <Navbar setIsLoggedIn={() => { }} />}

        <Routes>
          <Route path="/" element={<Login onLogin={() => { }} />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/v/:token" element={<HostAck />} />

          {isLoggedIn && !isAdmin && (
            <>
              <Route path="/home" element={<Home />} />
              <Route path="/form" element={<Form />} />
              <Route path="/history" element={<History />} />
              {/* <Route path="/about" element={<About />} /> */}
              <Route path="/occurrence" element={<Occurrence />} />
              <Route path="/faq" element={<FAQs />} />
              <Route path="/helpdesk" element={<HelpDesk />} />
              <Route path="/profile" element={<Profile />} />
            </>
          )}

          {/* Admin Routes */}
          <Route path="/visitrack/admin" element={<Login />} />
          <Route
            path="/visitrack/admin/dashboard/*"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="users" replace />} />
            <Route path="users" element={<UsersDetails />} />
            <Route path="usersignup" element={<Signup />} />
            <Route path="visitorsdetails" element={<VisitordsDetails />} />
            <Route path="staff-roster" element={<AdminStaffRoster />} />
            <Route path="occurrence" element={<AdminOccurrence />} />
            <Route path="faq" element={<AdminFAQs />} />
            <Route path="inquiry" element={<AdminInquiry />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="locations" element={<AdminLocations />} />
            <Route path="analytics" element={<AdminReports />} />
            <Route path="emergency" element={<AdminEmergency />} />
            <Route path="sms" element={<AdminSMSLogs />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Mobile Bottom Tab Bar */}
        {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <BottomTabBar />}

        {/* Conditionally show Footer */}
        {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <Footer />}
      </div>
    </SettingsProvider>
  );
};

export default App;


import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollTop';
import { Toaster } from 'react-hot-toast';
import Signup from './components/SignUp';
// Admin components
import UsersDetails from "./Admin/UserDetails";
import AdminDashboard from "./Admin/AdminDashboard";
import ProtectedRoute from "./Admin/ProtectedRoute";
import VisitordsDetails from './Admin/VisitordsDetails';
import AdminOccurrence from './Admin/AdminOccurrence';
import Home from './pages/Home';
import About from './pages/About';
import Occurrence from './pages/Occurrence';
import NotFound from './pages/NotFound';
import Form from './pages/VisitorForm';
import History from './pages/VisitorHistory';

const App = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  const isLoggedIn = !!token;
  const isAdmin = user?.isAdmin;

  // Paths where Navbar/Footer should be hidden
  const hideNavAndFooterPaths = ['/', '/magnet/admin'];

  const shouldHideNavAndFooter = hideNavAndFooterPaths.includes(location.pathname);

  return (
    <div>
      <ScrollToTop />
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          success: {
            style: {
              background: '#D1FAE5',
              color: '#065F46',
            },
          },
          error: {
            style: {
              background: '#FEE2E2',
              color: '#991B1B',
            },
          },
        }}
      />

      {/* Conditionally show Navbar */}
      {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <Navbar setIsLoggedIn={() => {}} />}

      <Routes>
        <Route path="/" element={<Login onLogin={() => {}} />} />

        {isLoggedIn && !isAdmin && (
          <>
            <Route path="/home" element={<Home />} />
            <Route path="/form" element={<Form />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
            <Route path="/occurrence" element={<Occurrence />} />
          </>
        )}

        {/* Admin Routes */}
        <Route path="/magnet/admin" element={<Login />} />
        <Route
          path="/magnet/admin/dashboard/*"
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
           <Route path="occurrence" element={<AdminOccurrence />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Conditionally show Footer */}
      {!shouldHideNavAndFooter && isLoggedIn && !isAdmin && <Footer />}
    </div>
  );
};

export default App;

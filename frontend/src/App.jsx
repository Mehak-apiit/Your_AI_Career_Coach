import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Home from './pages/Home';
import ResumeAnalyzer from './pages/dashboard/ResumeAnalyzer';
import RoadmapGenerator from './pages/dashboard/RoadmapGenerator';
import Chat from './pages/dashboard/Chat';
import Profile from './pages/dashboard/Profile';
import MockInterview from './pages/dashboard/MockInterview';
import AdminDashboard from './pages/admin/AdminDashboard';


const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => (
  <BrowserRouter>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/dashboard/resume" element={<ProtectedRoute><ResumeAnalyzer /></ProtectedRoute>} />
        {/* <Route path="/dashboard/resume" element={<ResumeAnalyzer />} /> */}
        <Route path="/dashboard/roadmap" element={<ProtectedRoute><RoadmapGenerator /></ProtectedRoute>} />
        {/* <Route path="/dashboard/roadmap" element={<RoadmapGenerator />} /> */}
        <Route path="/dashboard/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        {/* <Route path="/dashboard/chat" element={<Chat />} /> */}
        <Route path="/dashboard/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        {/* <Route path="/dashboard/profile" element={<Profile />} /> */}
        <Route path="/dashboard/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Toaster />
    </div>
  </BrowserRouter>
);

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

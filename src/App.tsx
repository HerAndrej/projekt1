import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import CreatorDashboard from './pages/creator/Dashboard';
import ProtectedRoute from './components/shared/ProtectedRoute';
import Layout from './components/layout/Layout';

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login\" replace />} />
          
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Creator Routes */}
            <Route 
              path="/creator/*" 
              element={
                <ProtectedRoute requiredRole="creator">
                  <CreatorDashboard />
                </ProtectedRoute>
              } 
            />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
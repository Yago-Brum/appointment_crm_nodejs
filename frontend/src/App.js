import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Calendar from './components/Calendar/Calendar';
import Clients from './components/Clients/Clients';
import Appointments from './components/Appointments/Appointments';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/Layout/MainLayout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes with MainLayout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="appointments" element={<Appointments />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

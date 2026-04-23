// ============================================================
// TriageQ — Main Application Entry Point
// ============================================================

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import QueuePage from './pages/Queue';
import History from './pages/History';
import Reports from './pages/Reports';
import DSDemo from './pages/DSDemo';
import Login from './pages/Login';
import UserRegister from './pages/UserRegister';
import TVDisplay from './pages/TVDisplay';
import PatientCareHub from './pages/PatientCareHub';
import InvoiceView from './pages/InvoiceView';
import PrescriptionView from './pages/PrescriptionView';
import About from './pages/About';
import { seedDemoData } from './services/store';
import { useAuth } from './services/authStore';

function AppRoutes() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/queue"    element={<QueuePage />} />
        <Route path="/history"  element={<History />} />
        <Route path="/reports"  element={<Reports />} />
        <Route path="/ds-demo"  element={<DSDemo />} />
        <Route path="/care-hub" element={<PatientCareHub />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route path="/prescription/:id" element={<PrescriptionView />} />
        <Route path="/about"    element={<About />} />
        <Route path="/user-register" element={<UserRegister />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  // Seed demo data on first load
  useEffect(() => {
    seedDemoData();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tv" element={<TVDisplay />} />
        <Route path="*" element={<AppRoutes />} />
      </Routes>
    </BrowserRouter>
  );
}

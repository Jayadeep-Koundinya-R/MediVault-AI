import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardLayout } from './DashboardLayout';
import { ToastContainer } from './components/Toast';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/labs" element={<DashboardLayout initialTab="labs" />} />
        <Route path="/prescriptions" element={<DashboardLayout initialTab="prescriptions" />} />
        <Route path="/vaccinations" element={<DashboardLayout initialTab="vaccinations" />} />
        <Route path="/consultations" element={<DashboardLayout initialTab="consultations" />} />
        <Route path="/doctor-portal" element={<DashboardLayout initialTab="doctor-portal" />} />
        <Route path="/pricing" element={<DashboardLayout initialTab="pricing" />} />
        <Route path="/settings" element={<DashboardLayout initialTab="settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

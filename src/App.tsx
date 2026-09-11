import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Public Auth Pages
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ConsentPage } from './pages/ConsentPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Protected App Pages
import { HomePage } from './pages/HomePage';
import { TimelinePage } from './pages/TimelinePage';
import UploadFlowPage from './pages/UploadFlowPage';
import RecordDetailPage from './pages/RecordDetailPage';
import LabsPage from './pages/LabsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import VaccinationsPage from './pages/VaccinationsPage';
import SummaryPage from './pages/SummaryPage';
import FlagDetailPage from './pages/FlagDetailPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPage from './pages/PrivacyPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.consentGiven) {
    return <Navigate to="/consent" replace />;
  }

  return children;
};

// Public Route Guard (redirects already logged-in users directly into the app)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();

  if (user && user.consentGiven) {
    return <Navigate to="/app/home" replace />;
  }

  return children;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing & Onboarding */}
        <Route path="/" element={<PublicRoute><WelcomePage /></PublicRoute>} />
        <Route path="/welcome" element={<PublicRoute><WelcomePage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Statutory Consent Onboarding Route */}
        <Route path="/consent" element={<ConsentPage />} />

        {/* Protected Clinical Vault Routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/home" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="upload" element={<UploadFlowPage />} />
          <Route path="upload/*" element={<UploadFlowPage />} />
          <Route path="records/:id" element={<RecordDetailPage />} />
          <Route path="labs" element={<LabsPage />} />
          <Route path="prescriptions" element={<PrescriptionsPage />} />
          <Route path="vaccinations" element={<VaccinationsPage />} />
          <Route path="summary" element={<SummaryPage />} />
          <Route path="flags/:id" element={<FlagDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

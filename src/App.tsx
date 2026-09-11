import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useApp } from './context/AppContext';

// Layouts
import { AppLayout } from './components/layout/AppLayout';
import { DoctorLayout } from './components/layout/DoctorLayout';

// Public Patient Auth Pages
import { WelcomePage } from './pages/WelcomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ConsentPage } from './pages/ConsentPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

// Public Doctor Auth Pages
import { DoctorLoginPage } from './pages/DoctorLoginPage';
import { DoctorSignupPage } from './pages/DoctorSignupPage';

// Protected Patient App Pages
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

// New MediVault 2.0 Patient Pages
import { TrustedDoctorsPage } from './pages/TrustedDoctorsPage';
import { FindDoctorPage } from './pages/FindDoctorPage';
import { DoctorSharingPreferencesPage } from './pages/DoctorSharingPreferencesPage';
import { FamilyPage } from './pages/FamilyPage';
import { FamilyMemberDetailPage } from './pages/FamilyMemberDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { AccessManagementPage } from './pages/AccessManagementPage';

// New MediVault 2.0 Doctor Portal Pages
import { DoctorDashboardPage } from './pages/doctor/DoctorDashboardPage';
import { DoctorPatientsPage } from './pages/doctor/DoctorPatientsPage';
import { DoctorPatientDetailPage } from './pages/doctor/DoctorPatientDetailPage';
import { DoctorReportsPage } from './pages/doctor/DoctorReportsPage';
import { DoctorMessagesPage } from './pages/doctor/DoctorMessagesPage';
import { DoctorProfilePage } from './pages/doctor/DoctorProfilePage';

// Protected Patient Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is a doctor attempting to access patient routes, redirect to doctor dashboard
  if (user.accountType === 'doctor') {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  if (!user.consentGiven) {
    return <Navigate to="/consent" replace />;
  }

  return children;
};

// Protected Doctor Route Guard
const DoctorProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/doctor/login" state={{ from: location }} replace />;
  }

  // If user is a patient attempting to access doctor routes, redirect to patient home
  if (user.accountType === 'patient') {
    return <Navigate to="/app/home" replace />;
  }

  return children;
};

// Public Route Guard (redirects already logged-in users directly to their appropriate dashboard)
const PublicRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user } = useApp();

  if (user) {
    if (user.accountType === 'doctor') {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    if (user.consentGiven) {
      return <Navigate to="/app/home" replace />;
    }
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
        
        {/* Doctor Public Auth Routes */}
        <Route path="/doctor/login" element={<PublicRoute><DoctorLoginPage /></PublicRoute>} />
        <Route path="/doctor/signup" element={<PublicRoute><DoctorSignupPage /></PublicRoute>} />

        {/* Statutory Consent Onboarding Route */}
        <Route path="/consent" element={<ConsentPage />} />

        {/* Protected Patient Clinical Vault Routes */}
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
          <Route path="settings/access" element={<AccessManagementPage />} />
          <Route path="privacy" element={<PrivacyPage />} />

          {/* MediVault 2.0 Patient Features */}
          <Route path="doctors" element={<TrustedDoctorsPage />} />
          <Route path="doctors/find" element={<FindDoctorPage />} />
          <Route path="doctors/:id/sharing" element={<DoctorSharingPreferencesPage />} />
          <Route path="family" element={<FamilyPage />} />
          <Route path="family/:id" element={<FamilyMemberDetailPage />} />
          <Route path="messages" element={<MessagesPage />} />
        </Route>

        {/* Protected Doctor Portal Routes */}
        <Route
          path="/doctor"
          element={
            <DoctorProtectedRoute>
              <DoctorLayout />
            </DoctorProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="dashboard" element={<DoctorDashboardPage />} />
          <Route path="patients" element={<DoctorPatientsPage />} />
          <Route path="patients/:id" element={<DoctorPatientDetailPage />} />
          <Route path="reports" element={<DoctorReportsPage />} />
          <Route path="messages" element={<DoctorMessagesPage />} />
          <Route path="profile" element={<DoctorProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

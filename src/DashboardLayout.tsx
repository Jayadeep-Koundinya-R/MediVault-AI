import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { StatsCards } from './components/StatsCards';
import { BiomarkerTrendChart } from './components/BiomarkerTrendChart';
import { BiomarkerTrendsView } from './components/BiomarkerTrendsView';
import { RecordsTimeline } from './components/RecordsTimeline';
import { UploadModal } from './components/UploadModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { AISummaryModal } from './components/AISummaryModal';
import { ConsentModal } from './components/ConsentBanner';
import { TiltCard } from './components/TiltCard';
import { TimeTravelScrubber, timeMilestones } from './components/TimeTravelScrubber';
import { OrganHologramModal } from './components/OrganHologramModal';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { LabReportsPage } from './pages/LabReportsPage';
import { PrescriptionsPage } from './pages/PrescriptionsPage';
import { VaccinationsPage } from './pages/VaccinationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DoctorConsultationsPage } from './pages/DoctorConsultationsPage';
import { DoctorPortalPage } from './pages/DoctorPortalPage';
import { PricingPlansPage } from './pages/PricingPlansPage';
import { NotificationsDrawer } from './components/NotificationsDrawer';
import { soundFX } from './utils/audioEffects';
import { showToast } from './components/Toast';

import {
  currentUser,
  initialDocuments,
  initialPrescriptions,
  initialLabResults,
  initialVaccinations,
  initialRiskFlags,
  initialAISummary,
  buildTimelineItems,
} from './data/mockHealthData';
import { initialNotifications } from './data/mockDoctorData';
import {
  HealthDocument,
  Prescription,
  LabResult,
  Vaccination,
  TimelineItem,
  RiskFlag,
  PatientProfile,
  DocumentType,
  AppNotification,
} from './types';
import { initialFamilyProfiles } from './services/api';

interface DashboardLayoutProps {
  initialTab?: string;
}

export function DashboardLayout({ initialTab }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(initialTab || 'timeline');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeIndex, setTimeIndex] = useState(timeMilestones.length - 1);

  // Notifications State (PRD Retention Center) - default clean
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Sync activeNav with initialTab prop
  useEffect(() => {
    setActiveNav(initialTab || 'timeline');
  }, [initialTab]);

  // Data state — starts fresh and clean ready for real uploads and Supabase
  const [documents, setDocuments] = useState<HealthDocument[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);

  const handleLoadSampleData = () => {
    setDocuments(initialDocuments);
    setPrescriptions(initialPrescriptions);
    setLabResults(initialLabResults);
    setVaccinations(initialVaccinations);
    setRiskFlags(initialRiskFlags);
    setNotifications(initialNotifications);
    soundFX.playChime();
    showToast('info', 'Demo Records Loaded', 'Sample multi-hospital health records populated.');
  };

  const handleClearAllData = () => {
    setDocuments([]);
    setPrescriptions([]);
    setLabResults([]);
    setVaccinations([]);
    setRiskFlags([]);
    setNotifications([]);
    soundFX.playTick();
    showToast('info', 'Vault Cleared', 'All dummy records removed. Clean slate active.');
  };

  // Multi-profile family state (PRD Stretch Feature #5)
  const [familyProfiles, setFamilyProfiles] = useState<PatientProfile[]>(initialFamilyProfiles);
  const [activeProfile, setActiveProfile] = useState<PatientProfile>(initialFamilyProfiles[0]);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadDocType, setUploadDocType] = useState<DocumentType>('lab_report');
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isHologramOpen, setIsHologramOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimelineItem | null>(null);

  // Compute timeline items
  const rawTimelineItems = useMemo(() => {
    return buildTimelineItems(prescriptions, labResults, vaccinations, documents, riskFlags);
  }, [prescriptions, labResults, vaccinations, documents, riskFlags]);

  // Apply Time-Travel filter
  const timeScrubbedItems = useMemo(() => {
    const cutoffDate = timeMilestones[timeIndex]?.date || '2099-12-31';
    return rawTimelineItems.filter((item) => item.date <= cutoffDate);
  }, [rawTimelineItems, timeIndex]);

  // Apply search query filtering
  const timelineItems = useMemo(() => {
    if (!searchQuery.trim()) return timeScrubbedItems;
    const q = searchQuery.toLowerCase();
    return timeScrubbedItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.sourceFacility.toLowerCase().includes(q) ||
        item.valueDisplay.toLowerCase().includes(q) ||
        (item.referenceRange && item.referenceRange.toLowerCase().includes(q))
    );
  }, [timeScrubbedItems, searchQuery]);

  const handleOpenUploadWithType = (type: DocumentType = 'lab_report') => {
    setUploadDocType(type);
    setIsUploadOpen(true);
  };

  // Handle new record from Upload Modal
  const handleSaveRecord = (
    newDoc: HealthDocument,
    payload: LabResult | Prescription | Vaccination
  ) => {
    setDocuments((prev) => [newDoc, ...prev]);

    if (newDoc.type === 'lab_report') {
      const lab = payload as LabResult;
      setLabResults((prev) => [lab, ...prev]);

      if (lab.testName.toLowerCase().includes('glucose') && lab.value >= 126) {
        const newFlag: RiskFlag = {
          flagId: `flag_${Date.now()}`,
          userId: activeProfile.userId,
          labResultId: lab.labResultId,
          ruleTriggered: 'fasting_glucose_diabetic_threshold',
          thresholdDescription: `Fasting glucose ${lab.value} mg/dL >= 126 mg/dL (ADA/WHO diabetes threshold)`,
          severity: 'high',
          flaggedAt: new Date().toISOString(),
          acknowledged: false,
        };
        setRiskFlags((prev) => [newFlag, ...prev]);
        soundFX.playAlertPulse();
      }
    } else if (newDoc.type === 'prescription') {
      setPrescriptions((prev) => [payload as Prescription, ...prev]);
    } else if (newDoc.type === 'vaccination') {
      setVaccinations((prev) => [payload as Vaccination, ...prev]);
    }

    showToast('success', 'Record Saved!', `${newDoc.type.replace('_', ' ')} added to your health timeline`);
    setTimeIndex(timeMilestones.length - 1);
  };

  // Handle manual correction edit in Record Detail Modal
  const handleUpdateRecordValue = (id: string, newValue: string) => {
    const labId = id.replace('item_', '');
    const labMatch = labResults.find((l) => l.labResultId === labId);
    if (labMatch) {
      const num = parseFloat(newValue) || labMatch.value;
      setLabResults((prev) =>
        prev.map((l) => (l.labResultId === labId ? { ...l, value: num, manuallyCorrected: true } : l))
      );
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord({
          ...selectedRecord,
          valueDisplay: `${num} ${labMatch.unit}`,
          manuallyCorrected: true,
        });
      }
      showToast('info', 'Value Updated', 'Record marked as manually corrected');
      return;
    }

    const rxMatch = prescriptions.find((r) => r.prescriptionId === labId);
    if (rxMatch) {
      setPrescriptions((prev) =>
        prev.map((r) => (r.prescriptionId === labId ? { ...r, dosage: newValue, manuallyCorrected: true } : r))
      );
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord({
          ...selectedRecord,
          valueDisplay: newValue,
          manuallyCorrected: true,
        });
      }
      showToast('info', 'Value Updated', 'Prescription marked as manually corrected');
    }
  };

  // Sidebar navigation handler
  const handleSidebarNav = (tabId: string) => {
    if (tabId === 'settings') {
      navigate('/settings');
      return;
    }
    if (tabId === 'labs') {
      navigate('/labs');
      return;
    }
    if (tabId === 'prescriptions') {
      navigate('/prescriptions');
      return;
    }
    if (tabId === 'vaccinations') {
      navigate('/vaccinations');
      return;
    }
    if (tabId === 'summary') {
      setIsSummaryOpen(true);
      return;
    }
    if (tabId === 'consultations') {
      navigate('/consultations');
      return;
    }
    if (tabId === 'doctor-portal') {
      navigate('/doctor-portal');
      return;
    }
    if (tabId === 'pricing') {
      navigate('/pricing');
      return;
    }
    if (tabId === 'trends') {
      navigate('/dashboard');
      setActiveNav('trends');
      return;
    }

    // timeline
    navigate('/dashboard');
    setActiveNav('timeline');
    setCurrentFilter('all');
  };

  // Determine which content to render based on activeNav
  const renderContent = () => {
    switch (activeNav) {
      case 'trends':
        return (
          <BiomarkerTrendsView
            labResults={labResults}
            riskFlags={riskFlags}
            onOpenSummary={() => setIsSummaryOpen(true)}
            onOpenUpload={() => handleOpenUploadWithType('lab_report')}
            onSelectRecord={(item) => setSelectedRecord(item)}
          />
        );
      case 'labs':
        return (
          <LabReportsPage
            labs={labResults}
            riskFlags={riskFlags}
            documents={documents}
            onSelectRecord={(item) => setSelectedRecord(item)}
            onOpenUpload={() => handleOpenUploadWithType('lab_report')}
          />
        );
      case 'prescriptions':
        return (
          <PrescriptionsPage
            prescriptions={prescriptions}
            documents={documents}
            onSelectRecord={(item) => setSelectedRecord(item)}
            onOpenUpload={() => handleOpenUploadWithType('prescription')}
          />
        );
      case 'vaccinations':
        return (
          <VaccinationsPage
            vaccinations={vaccinations}
            documents={documents}
            onSelectRecord={(item) => setSelectedRecord(item)}
            onOpenUpload={() => handleOpenUploadWithType('vaccination')}
          />
        );
      case 'consultations':
        return <DoctorConsultationsPage onSelectRecord={(item) => setSelectedRecord(item)} />;
      case 'doctor-portal':
        return <DoctorPortalPage />;
      case 'pricing':
        return <PricingPlansPage />;
      case 'settings':
        return (
          <SettingsPage
            activeProfile={activeProfile}
            allProfiles={familyProfiles}
            onSelectProfile={(p) => setActiveProfile(p)}
            onUpdateProfile={(p) => {
              setFamilyProfiles((prev) => prev.map((pr) => (pr.userId === p.userId ? p : pr)));
              setActiveProfile(p);
            }}
            onLoadSampleData={handleLoadSampleData}
            onClearAllData={handleClearAllData}
          />
        );
      default:
        return (
          <>
            {/* Dashboard Grid (3D Tilt Cards) */}
            <div className="dashboard-grid">
              <TiltCard maxTilt={5}>
                <StatsCards
                  timelineItems={timeScrubbedItems}
                  riskFlags={riskFlags}
                  onFilterFlagged={() => setCurrentFilter('flagged')}
                />
              </TiltCard>

              <TiltCard maxTilt={4}>
                <BiomarkerTrendChart
                  onOpenSummaryModal={() => setIsSummaryOpen(true)}
                  onOpenFlagDetails={() => setCurrentFilter('flagged')}
                  hasData={labResults.length > 0}
                  onOpenUpload={() => handleOpenUploadWithType('lab_report')}
                />
              </TiltCard>
            </div>

            {/* Time-Travel Scrubber */}
            {rawTimelineItems.length > 0 && (
              <TimeTravelScrubber
                currentDateIndex={timeIndex}
                onDateChange={(idx) => setTimeIndex(idx)}
              />
            )}

            {/* Consolidated Medical Records Timeline Table */}
            <RecordsTimeline
              items={timelineItems}
              currentFilter={currentFilter}
              setCurrentFilter={setCurrentFilter}
              onSelectRecord={(item) => setSelectedRecord(item)}
            />
          </>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeNav}
        setActiveTab={handleSidebarNav}
        onOpenConsent={() => setIsConsentOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-main" style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Bar Header */}
        <TopNav
          user={currentUser}
          activeProfile={activeProfile}
          allProfiles={familyProfiles}
          onSelectProfile={(p) => setActiveProfile(p)}
          onNavigateSettings={() => handleSidebarNav('settings')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenUpload={() => handleOpenUploadWithType('lab_report')}
          onOpenConsent={() => setIsConsentOpen(true)}
          onOpenHologram={() => setIsHologramOpen(true)}
          onOpenCopilot={() => setIsCopilotOpen(true)}
          unreadAlertCount={notifications.filter((n) => !n.read).length}
          onAlertClick={() => setIsNotificationsOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          isDoctorMode={activeNav === 'doctor-portal'}
          onToggleDoctorMode={() => {
            if (activeNav === 'doctor-portal') {
              handleSidebarNav('timeline');
            } else {
              handleSidebarNav('doctor-portal');
            }
          }}
        />

        {renderContent()}
      </main>

      {/* Upload & OCR Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        initialDocumentType={uploadDocType}
        onClose={() => setIsUploadOpen(false)}
        onSaveRecord={handleSaveRecord}
      />

      {/* Record Detail & Inspection Drawer */}
      <RecordDetailModal
        item={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onUpdateValue={handleUpdateRecordValue}
      />

      {/* AI Health Summary Modal */}
      <AISummaryModal
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        summary={initialAISummary}
        riskFlags={riskFlags}
        hasRecords={rawTimelineItems.length > 0}
        onOpenUpload={() => handleOpenUploadWithType('lab_report')}
      />

      {/* 3D Biological Organ & Vitals Hologram Modal */}
      <OrganHologramModal
        isOpen={isHologramOpen}
        onClose={() => setIsHologramOpen(false)}
        onSelectOrganFilter={(filter) => setCurrentFilter(filter)}
      />

      {/* AI Clinical Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onOpenRecord={(item) => setSelectedRecord(item)}
        timelineItems={rawTimelineItems}
      />

      {/* DPDP Act 2023 Consent Modal */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
      />

      {/* Notifications Center Drawer (Retention Center) */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
        onSelectNotification={(notif) => {
          if (notif.actionUrl) {
            navigate(notif.actionUrl);
          }
        }}
      />
    </div>
  );
}

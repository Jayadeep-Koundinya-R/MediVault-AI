import { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { StatsCards } from './components/StatsCards';
import { BiomarkerTrendChart } from './components/BiomarkerTrendChart';
import { RecordsTimeline } from './components/RecordsTimeline';
import { UploadModal } from './components/UploadModal';
import { RecordDetailModal } from './components/RecordDetailModal';
import { AISummaryModal } from './components/AISummaryModal';
import { ConsentModal } from './components/ConsentBanner';

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
import { HealthDocument, Prescription, LabResult, Vaccination, TimelineItem, RiskFlag } from './types';

export function App() {
  const [activeNav, setActiveNav] = useState('timeline');
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data state
  const [documents, setDocuments] = useState<HealthDocument[]>(initialDocuments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [labResults, setLabResults] = useState<LabResult[]>(initialLabResults);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>(initialVaccinations);
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>(initialRiskFlags);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TimelineItem | null>(null);

  // Compute timeline items
  const rawTimelineItems = useMemo(() => {
    return buildTimelineItems(prescriptions, labResults, vaccinations, documents, riskFlags);
  }, [prescriptions, labResults, vaccinations, documents, riskFlags]);

  // Apply search query filtering
  const timelineItems = useMemo(() => {
    if (!searchQuery.trim()) return rawTimelineItems;
    const q = searchQuery.toLowerCase();
    return rawTimelineItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.sourceFacility.toLowerCase().includes(q) ||
        item.valueDisplay.toLowerCase().includes(q) ||
        (item.referenceRange && item.referenceRange.toLowerCase().includes(q))
    );
  }, [rawTimelineItems, searchQuery]);

  // Handle new record from Upload Modal
  const handleSaveRecord = (
    newDoc: HealthDocument,
    payload: LabResult | Prescription | Vaccination
  ) => {
    setDocuments((prev) => [newDoc, ...prev]);

    if (newDoc.type === 'lab_report') {
      const lab = payload as LabResult;
      setLabResults((prev) => [lab, ...prev]);

      // Trigger clinical rule check (PRD: Threshold-based Risk Flags)
      if (lab.testName.toLowerCase().includes('glucose') && lab.value >= 126) {
        const newFlag: RiskFlag = {
          flagId: `flag_${Date.now()}`,
          userId: currentUser.userId,
          labResultId: lab.labResultId,
          ruleTriggered: 'fasting_glucose_diabetic_threshold',
          thresholdDescription: `Fasting glucose ${lab.value} mg/dL >= 126 mg/dL (ADA/WHO diabetes threshold)`,
          severity: 'high',
          flaggedAt: new Date().toISOString(),
          acknowledged: false,
        };
        setRiskFlags((prev) => [newFlag, ...prev]);
      }
    } else if (newDoc.type === 'prescription') {
      setPrescriptions((prev) => [payload as Prescription, ...prev]);
    } else if (newDoc.type === 'vaccination') {
      setVaccinations((prev) => [payload as Vaccination, ...prev]);
    }
  };

  // Handle manual correction edit in Record Detail Modal
  const handleUpdateRecordValue = (id: string, newValue: string) => {
    // Check if it's a lab result
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
      return;
    }

    // Check if prescription
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
    }
  };

  // Sidebar navigation handler
  const handleSidebarNav = (tabId: string) => {
    setActiveNav(tabId);
    if (tabId === 'timeline') setCurrentFilter('all');
    else if (tabId === 'labs') setCurrentFilter('lab_report');
    else if (tabId === 'prescriptions') setCurrentFilter('prescription');
    else if (tabId === 'vaccinations') setCurrentFilter('vaccination');
    else if (tabId === 'trends') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'summary') {
      setIsSummaryOpen(true);
    }
  };

  const unreadAlerts = riskFlags.filter((f) => !f.acknowledged).length;

  return (
    <div className="app-container">
      {/* Sidebar Navigation matching Flat-21 Dribbble design */}
      <Sidebar
        activeTab={activeNav}
        setActiveTab={handleSidebarNav}
        onOpenConsent={() => setIsConsentOpen(true)}
      />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Top Bar Header */}
        <TopNav
          user={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenUpload={() => setIsUploadOpen(true)}
          onOpenConsent={() => setIsConsentOpen(true)}
          unreadAlertCount={unreadAlerts}
          onAlertClick={() => setCurrentFilter('flagged')}
        />

        {/* Dashboard Grid (Donut Metrics + Longitudinal Trend Area Chart) */}
        <div className="dashboard-grid">
          {/* Left Column: Donut Gauges & Pillar Indicators */}
          <StatsCards
            timelineItems={rawTimelineItems}
            riskFlags={riskFlags}
            onFilterFlagged={() => setCurrentFilter('flagged')}
          />

          {/* Right Column: Central Biomarker Trend & Forecast with Floating AI Card */}
          <BiomarkerTrendChart
            onOpenSummaryModal={() => setIsSummaryOpen(true)}
            onOpenFlagDetails={() => setCurrentFilter('flagged')}
          />
        </div>

        {/* Consolidated Medical Records Timeline Table (Matching Flat-21 "Sales Orders") */}
        <RecordsTimeline
          items={timelineItems}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
          onSelectRecord={(item) => setSelectedRecord(item)}
        />
      </main>

      {/* Upload & OCR Modal */}
      <UploadModal
        isOpen={isUploadOpen}
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
      />

      {/* DPDP Act 2023 Consent Modal */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
      />
    </div>
  );
}

export default App;

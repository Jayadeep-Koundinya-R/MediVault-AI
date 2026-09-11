import React, { useState } from 'react';
import { 
  Globe, 
  Moon, 
  Sun, 
  Bell, 
  Database, 
  Trash2, 
  RotateCcw, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Sliders 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ConfirmDialog from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { 
    records, 
    loadDemoData, 
    clearDemoData, 
    ocrMode, 
    setOcrMode, 
    addToast 
  } = useApp();

  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light');

  // Notification toggles
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [labAlertsEnabled, setLabAlertsEnabled] = useState(true);
  const [abdmSyncEnabled, setAbdmSyncEnabled] = useState(true);

  // Dialogs
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleLanguageChange = (lang: 'en' | 'hi' | 'te') => {
    setSelectedLanguage(lang);
    const names = { en: 'English', hi: 'हिंदी (Hindi)', te: 'తెలుగు (Telugu)' };
    addToast(`Language changed to ${names[lang]}`);
  };

  const handleThemeToggle = () => {
    const next = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(next);
    addToast(`Clinical theme switched to ${next} preview`, 'info');
  };

  const handleExportAll = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "healthvault_records_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Exported local records database (JSON)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
          <span>Application Preferences</span>
          <span>•</span>
          <span>Controls & Testing Suite</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          Settings & Local Vault Controls
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Customize language, notification alerts, demo test data, and OCR simulation modes.
        </p>
      </div>

      {/* LANGUAGE & LOCALIZATION */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Globe className="w-5 h-5 text-teal-700" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Regional Language</h3>
            <p className="text-xs text-slate-500">Supports major Indian languages for clinical accessibility</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleLanguageChange('en')}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedLanguage === 'en'
                ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div>
              <span className="font-bold text-slate-900 text-sm block">English</span>
              <span className="text-xs text-slate-500">Default (Indian Medical Standard)</span>
            </div>
            {selectedLanguage === 'en' && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
          </button>

          <button
            onClick={() => handleLanguageChange('hi')}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedLanguage === 'hi'
                ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div>
              <span className="font-bold text-slate-900 text-sm block">हिंदी</span>
              <span className="text-xs text-slate-500">Hindi Clinical View</span>
            </div>
            {selectedLanguage === 'hi' && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
          </button>

          <button
            onClick={() => handleLanguageChange('te')}
            className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
              selectedLanguage === 'te'
                ? 'border-teal-600 bg-teal-50/50 ring-2 ring-teal-600/20 shadow-xs'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div>
              <span className="font-bold text-slate-900 text-sm block">తెలుగు</span>
              <span className="text-xs text-slate-500">Telugu Clinical View</span>
            </div>
            {selectedLanguage === 'te' && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
          </button>
        </div>
      </Card>

      {/* NOTIFICATION PREFERENCES */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Notification Alerts</h3>
            <p className="text-xs text-slate-500">Control alert frequency and clinical notification triggers</p>
          </div>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          <div className="pt-2 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Medication Dosing Reminders</h4>
              <p className="text-xs text-slate-500">Daily device reminders for prescribed medicine intake</p>
            </div>
            <button
              onClick={() => setRemindersEnabled(!remindersEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                remindersEnabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                remindersEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Abnormal Biomarker Threshold Alerts</h4>
              <p className="text-xs text-slate-500">Instant warnings when lab values cross reference intervals</p>
            </div>
            <button
              onClick={() => setLabAlertsEnabled(!labAlertsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                labAlertsEnabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                labAlertsEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">ABDM Health Locker Activity</h4>
              <p className="text-xs text-slate-500">Notifies when hospitals or labs link new digital records</p>
            </div>
            <button
              onClick={() => setAbdmSyncEnabled(!abdmSyncEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                abdmSyncEnabled ? 'bg-teal-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                abdmSyncEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>
      </Card>

      {/* DEMO / DEVELOPER TESTING CONTROLS */}
      <Card className="p-6 space-y-4 border-2 border-indigo-100 bg-indigo-50/20">
        <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Devert-a-thon Evaluator Suite</h3>
              <p className="text-xs text-slate-500">Inspect simulated OCR responses and fault-tolerance states</p>
            </div>
          </div>
          <Badge variant="info">Evaluation Tools</Badge>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Optical Character Recognition (OCR) Simulation Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 text-xs">
              {[
                { id: 'default', label: 'Default High Conf', desc: 'Standard clean extraction' },
                { id: 'high', label: 'Forced High', desc: 'Pre-filled clean entities' },
                { id: 'low', label: 'Low Confidence', desc: 'Faint ink / verification banner' },
                { id: 'failed', label: 'OCR Failure', desc: 'Blurry / manual entry fallback' },
                { id: 'mismatch', label: 'Category Mismatch', desc: 'Prescription vs Lab Report switch' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setOcrMode(mode.id as any)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    ocrMode === mode.id
                      ? 'border-indigo-600 bg-white ring-2 ring-indigo-600/20 shadow-xs font-bold text-indigo-900'
                      : 'border-slate-200 bg-white/70 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className="font-semibold">{mode.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* STORAGE & DEMO RESET CONTROLS */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Local Vault Storage & Demo State</h3>
              <p className="text-xs text-slate-500">
                Currently storing <strong>{records.length} records</strong> locally on this browser.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportAll}
          >
            Export All Records (JSON)
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5 text-teal-700" />}
              onClick={() => setShowResetConfirm(true)}
            >
              Restore Rahul Sharma Seed Data
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setShowClearConfirm(true)}
            >
              Clear Local Vault
            </Button>
          </div>
        </div>
      </Card>

      {/* ABOUT HEALTHVAULT */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            HealthVault &bull; Digital Health Record System
          </div>
          <span className="font-mono text-[11px] text-slate-400">v1.0.0 (DVPS24)</span>
        </div>
        <p className="leading-relaxed">
          Engineered for the Devert-a-thon Digital Health Challenge. Built adhering to the 
          <strong> Digital Personal Data Protection (DPDP) Act, 2023</strong> and the 
          <strong> Ayushman Bharat Digital Mission (ABDM)</strong> national interoperability standards.
        </p>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Restore Default Demo Data?"
        message="This will reload patient Rahul Sharma's 12 seeded clinical records, 3 sequential glucose tests, and associated active medications."
        confirmText="Yes, Restore Demo Data"
        cancelText="Cancel"
        variant="primary"
        onConfirm={() => {
          loadDemoData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Entire Local Vault?"
        message="This will delete all stored records, lab results, and risk flags to test empty states. You can restore demo data at any time from Settings."
        confirmText="Yes, Clear All Data"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          clearDemoData();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};

export default SettingsPage;

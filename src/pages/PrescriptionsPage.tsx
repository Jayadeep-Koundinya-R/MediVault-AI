import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Pill, 
  Plus, 
  Bell, 
  Calendar, 
  User, 
  Building2, 
  Clock, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import ReminderModal from '../components/records/ReminderModal';

export const PrescriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { records } = useApp();
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Reminder modal
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedMedName, setSelectedMedName] = useState('');

  const rxRecords = records.filter(r => r.type === 'prescription' && r.prescription);

  // Filter based on tab and search
  const filteredRx = rxRecords.filter(r => {
    if (!r.prescription) return false;

    // Simulate active vs past: older than 6 months or paracetamol considered past
    const isPast = r.prescription.drugName.toLowerCase().includes('paracetamol');
    if (activeTab === 'active' && isPast) return false;
    if (activeTab === 'past' && !isPast) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const medName = r.prescription.drugName.toLowerCase();
      const docName = r.prescription.prescribingDoctor.toLowerCase();
      const hosp = r.sourceName.toLowerCase();
      return medName.includes(q) || docName.includes(q) || hosp.includes(q);
    }

    return true;
  });

  const handleOpenReminder = (drugName: string) => {
    setSelectedMedName(drugName);
    setIsReminderOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
            <span>Medication Vault</span>
            <span>•</span>
            <span>Regimens & Dosages</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Prescriptions & Medications
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Consolidated clinical prescriptions, dosage schedules, and daily intake reminders.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/app/upload?type=prescription')}
        >
          Add Prescription
        </Button>
      </div>

      {/* Safety Summary Banner */}
      <div className="bg-teal-900 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl text-teal-200 shrink-0">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-teal-300">
                Active Regimen Overview
              </span>
              <span className="text-[10px] bg-teal-800 text-teal-100 px-2 py-0.5 rounded font-mono">
                Verified Prescriptions
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              3 Active Maintenance Medications
            </h3>
            <p className="text-xs text-teal-200 mt-0.5 max-w-lg">
              Metformin 500mg, Telmisartan 40mg, and Vitamin D3 60,000 IU. Always verify changes with your physician.
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<Sparkles className="w-3.5 h-3.5 text-teal-700" />}
            onClick={() => navigate('/app/summary')}
          >
            Review Drug Interactions
          </Button>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search drug e.g. Metformin, Telmisartan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Regimens ({rxRecords.filter(r => !r.prescription?.drugName.toLowerCase().includes('paracetamol')).length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'past'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Past / Completed ({rxRecords.filter(r => r.prescription?.drugName.toLowerCase().includes('paracetamol')).length})
          </button>
        </div>
      </div>

      {/* Prescription List */}
      {filteredRx.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-10 h-10 text-teal-400" />}
          title="No Prescriptions Found"
          description={
            searchQuery
              ? `No prescriptions found matching "${searchQuery}".`
              : 'You have no prescriptions listed in this tab.'
          }
          actionLabel="Upload Prescription"
          onAction={() => navigate('/app/upload?type=prescription')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRx.map((record) => {
            const rx = record.prescription!;
            return (
              <Card
                key={record.id}
                className="p-5 hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                          {rx.drugName}
                        </h3>
                        <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                          {rx.dosage}
                        </span>
                      </div>
                    </div>

                    <Badge variant={activeTab === 'active' ? 'info' : 'neutral'}>
                      {activeTab === 'active' ? 'Ongoing' : 'Completed'}
                    </Badge>
                  </div>

                  {/* Schedule Details */}
                  <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">Frequency:</span>
                      <span>{rx.frequency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">Prescriber:</span>
                      <span>{rx.prescribingDoctor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-800">Facility:</span>
                      <span>{rx.sourceHospital}</span>
                    </div>
                    {rx.instructions && (
                      <div className="pt-1 text-[11px] text-slate-500 italic border-t border-slate-200/60">
                        &ldquo;{rx.instructions}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Rx: {new Date(rx.prescribedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReminder(rx.drugName)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Bell className="w-3.5 h-3.5" /> Set Reminder
                    </button>
                    <Link
                      to={`/app/records/${record.id}`}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-md transition-colors"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Medicine Reminder Modal */}
      <ReminderModal
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        medicineName={selectedMedName}
      />
    </div>
  );
};

export default PrescriptionsPage;

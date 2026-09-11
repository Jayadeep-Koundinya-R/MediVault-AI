import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RecordType } from '../types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { 
  Search, 
  Filter, 
  Plus, 
  Activity, 
  FileText, 
  Syringe, 
  Calendar, 
  Building2, 
  ChevronRight,
  AlertTriangle,
  FileQuestion,
  X
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { records, filter, setFilter } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | RecordType>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Extract distinct sources for filter
  const allSources = Array.from(new Set(records.map(r => r.document.sourceName).filter(Boolean))) as string[];

  // Filter logic
  const filteredRecords = records.filter(record => {
    // Tab filter
    if (activeTab !== 'all' && record.document.type !== activeTab) {
      return false;
    }

    // Search query filter across multiple fields
    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase();
      const matchTitle = record.document.title.toLowerCase().includes(q);
      const matchSource = (record.document.sourceName || '').toLowerCase().includes(q);
      const matchRx = record.prescription && (
        record.prescription.drugName.toLowerCase().includes(q) ||
        record.prescription.prescribingDoctor.toLowerCase().includes(q) ||
        record.prescription.sourceHospital.toLowerCase().includes(q)
      );
      const matchLab = record.labResults && record.labResults.some(l => 
        l.testName.toLowerCase().includes(q) || l.sourceLab.toLowerCase().includes(q)
      );
      const matchVax = record.vaccination && (
        record.vaccination.vaccineName.toLowerCase().includes(q) ||
        record.vaccination.facility.toLowerCase().includes(q)
      );

      if (!matchTitle && !matchSource && !matchRx && !matchLab && !matchVax) {
        return false;
      }
    }

    // Source filter
    if (filter.source && record.document.sourceName !== filter.source) {
      return false;
    }

    // Date range filter
    if (filter.dateRange !== 'all') {
      const recordDate = new Date(record.document.uploadedAt).getTime();
      const now = new Date().getTime();
      const daysDiff = (now - recordDate) / (1000 * 3600 * 24);

      if (filter.dateRange === '7d' && daysDiff > 7) return false;
      if (filter.dateRange === '30d' && daysDiff > 30) return false;
      if (filter.dateRange === '6m' && daysDiff > 180) return false;
    }

    return true;
  });

  const clearFilters = () => {
    setFilter({
      searchQuery: '',
      types: [],
      dateRange: 'all',
      source: ''
    });
    setActiveTab('all');
  };

  const hasActiveFilters = filter.searchQuery || filter.source || filter.dateRange !== 'all' || activeTab !== 'all';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-900 tracking-tight">
            Health Timeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chronological archive of your prescriptions, lab tests, and immunizations.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/app/upload')}
          leftIcon={<Plus size={18} />}
          size="md"
        >
          Add Record
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search medicines, labs, tests, doctors, hospitals..."
            value={filter.searchQuery}
            onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full h-11 bg-white border border-slate-300 rounded-xl pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 shadow-clinical-sm transition-all"
          />
          {filter.searchQuery && (
            <button
              onClick={() => setFilter(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterModal(true)}
          className={`h-11 px-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold transition-colors ${
            hasActiveFilters
              ? 'bg-brand-50 border-brand-900 text-brand-900 shadow-clinical-sm'
              : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter size={16} />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-brand-900"></span>
          )}
        </button>
      </div>

      {/* Category Tabs: All, Labs, Prescriptions, Vaccinations */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-brand-900 text-white shadow-clinical-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({records.length})
        </button>

        <button
          onClick={() => setActiveTab('lab_report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'lab_report'
              ? 'bg-brand-900 text-white shadow-clinical-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity size={15} />
          <span>Labs ({records.filter(r => r.document.type === 'lab_report').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('prescription')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'prescription'
              ? 'bg-brand-900 text-white shadow-clinical-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText size={15} />
          <span>Prescriptions ({records.filter(r => r.document.type === 'prescription').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('vaccination')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'vaccination'
              ? 'bg-brand-900 text-white shadow-clinical-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Syringe size={15} />
          <span>Vaccinations ({records.filter(r => r.document.type === 'vaccination').length})</span>
        </button>
      </div>

      {/* Timeline Record List */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-clinical-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileQuestion size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-900">No matching records</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            We couldn’t find any health records matching your active filters or search terms.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const isLab = record.document.type === 'lab_report';
            const isRx = record.document.type === 'prescription';
            const isVax = record.document.type === 'vaccination';
            const dateStr = new Date(record.document.uploadedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            return (
              <div
                key={record.id}
                onClick={() => navigate(`/app/records/${record.id}`)}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-brand-900/40 hover:shadow-clinical transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isLab ? 'bg-blue-50 text-brand-900' : isRx ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-trust-700'
                  }`}>
                    {isLab && <Activity size={22} />}
                    {isRx && <FileText size={22} />}
                    {isVax && <Syringe size={22} />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1 mb-1">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                        {record.document.title}
                      </h3>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        {dateStr}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center space-x-2">
                      <span className="font-medium text-slate-700">{record.document.sourceName || 'General Clinic'}</span>
                      {record.prescription && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600">Prescribed by {record.prescription.prescribingDoctor}</span>
                        </>
                      )}
                      {record.vaccination && (
                        <>
                          <span>•</span>
                          <span className="text-slate-600">{record.vaccination.facility}</span>
                        </>
                      )}
                    </p>

                    {/* Summary snippets */}
                    {record.labResults && (
                      <div className="mt-2.5 flex items-center space-x-2 flex-wrap gap-1.5">
                        {record.labResults.slice(0, 3).map((l, i) => (
                          <span
                            key={i}
                            className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                              l.status === 'high' ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {l.testName}: {l.value} {l.unit}
                          </span>
                        ))}
                        {record.labResults.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            +{record.labResults.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trailing Badges & Chevron */}
                <div className="flex items-center justify-between sm:justify-end space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="flex items-center space-x-2">
                    {record.flags && record.flags.length > 0 && (
                      <Badge variant="warning" size="sm">
                        {record.flags.length} Risk Flag{record.flags.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    {record.prescription?.manuallyCorrected && (
                      <Badge variant="neutral" size="sm">
                        Manually Corrected
                      </Badge>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===================================================================
          FILTER MODAL / DRAWER
          =================================================================== */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Records"
        subtitle="Narrow your timeline by date range or specific diagnostic source."
        maxWidth="sm"
      >
        <div className="space-y-5">
          {/* Date Filter */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Time Period
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'All Time' },
                { id: '7d', label: 'Last 7 Days' },
                { id: '30d', label: 'Last 30 Days' },
                { id: '6m', label: 'Last 6 Months' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setFilter(prev => ({ ...prev, dateRange: opt.id as any }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    filter.dateRange === opt.id
                      ? 'bg-brand-900 text-white border-brand-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Source Filter */}
          {allSources.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Hospital or Laboratory
              </label>
              <select
                value={filter.source}
                onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
                className="w-full h-11 bg-white border border-slate-300 rounded-xl px-3 text-xs text-slate-800 focus:outline-none focus:border-brand-900"
              >
                <option value="">All Care Providers ({allSources.length})</option>
                {allSources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="secondary"
              onClick={clearFilters}
              className="flex-1"
              size="md"
            >
              Clear All
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowFilterModal(false)}
              className="flex-1"
              size="md"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

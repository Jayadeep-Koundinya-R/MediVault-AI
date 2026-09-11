import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { RecordType, UnifiedRecord } from '../types';
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
  Clock,
  CalendarRange,
  ArrowUpDown,
  History,
  Building2, 
  ChevronRight,
  AlertTriangle,
  FileQuestion,
  X,
  Layers,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

// ============================================================================
// CHRONOLOGICAL & TIME HELPER UTILITIES
// ============================================================================

function getRecordEventDate(record: UnifiedRecord): Date {
  const dateStr = 
    record.labResults?.[0]?.testDate ||
    record.prescription?.prescribedDate ||
    record.vaccination?.dateAdministered ||
    record.document.uploadedAt;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? new Date() : d;
}

function getRelativeTimeString(targetDate: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - targetDate.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1 && diffHours >= 0) return 'Just now';
  if (diffHours < 24 && diffHours >= 1) return `${diffHours}h ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'wk' : 'wks'} ago`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30.44);
    return `${months} ${months === 1 ? 'mo' : 'mos'} ago`;
  }
  const years = (diffDays / 365.25).toFixed(1).replace('.0', '');
  return `${years} ${years === '1' ? 'yr' : 'yrs'} ago`;
}

function getTimeSpanString(earliest: Date, latest: Date): string {
  const diffMs = Math.abs(latest.getTime() - earliest.getTime());
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Same day';
  if (diffDays < 30) return `${diffDays} days`;
  const months = Math.floor(diffDays / 30.44);
  const years = Math.floor(diffDays / 365.25);
  const remMonths = months % 12;
  if (years === 0) return `${months} ${months === 1 ? 'month' : 'months'}`;
  if (remMonths === 0) return `${years} ${years === 1 ? 'year' : 'years'}`;
  return `${years}y ${remMonths}m`;
}

interface MonthGroup {
  monthKey: string;
  monthName: string;
  year: number;
  records: UnifiedRecord[];
}

interface YearGroup {
  year: number;
  months: MonthGroup[];
  totalRecords: number;
}

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================

export const TimelinePage: React.FC = () => {
  const { records, filter, setFilter } = useApp();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | RecordType>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc'); // desc = newest first, asc = oldest first
  const [selectedYear, setSelectedYear] = useState<'all' | number>('all');

  // Extract distinct sources for filter
  const allSources = useMemo(() => {
    return Array.from(new Set(records.map(r => r.document.sourceName).filter(Boolean))) as string[];
  }, [records]);

  // Extract all available years across all records
  const availableYears = useMemo(() => {
    const years = records.map(r => getRecordEventDate(r).getFullYear());
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [records]);

  // Time Horizon Calculations (Overall metrics)
  const timeHorizon = useMemo(() => {
    if (records.length === 0) return null;
    const sortedDates = [...records]
      .map(r => getRecordEventDate(r).getTime())
      .sort((a, b) => a - b);
    
    const earliest = new Date(sortedDates[0]);
    const latest = new Date(sortedDates[sortedDates.length - 1]);
    const spanText = getTimeSpanString(earliest, latest);
    const latestRelative = getRelativeTimeString(latest);

    return {
      earliest,
      latest,
      spanText,
      latestRelative,
      totalCount: records.length,
      yearsCount: availableYears.length,
    };
  }, [records, availableYears]);

  // Filter and sort records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      // Tab filter
      if (activeTab !== 'all' && record.document.type !== activeTab) {
        return false;
      }

      // Year filter (quick scrubber)
      if (selectedYear !== 'all') {
        const recordYear = getRecordEventDate(record).getFullYear();
        if (recordYear !== selectedYear) return false;
      }

      // Search query filter across multiple clinical fields
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

      // Relative Date range filter
      if (filter.dateRange !== 'all') {
        const recordDate = getRecordEventDate(record).getTime();
        const now = new Date().getTime();
        const daysDiff = (now - recordDate) / (1000 * 3600 * 24);

        if (filter.dateRange === '7d' && daysDiff > 7) return false;
        if (filter.dateRange === '30d' && daysDiff > 30) return false;
        if (filter.dateRange === '6m' && daysDiff > 180) return false;
      }

      return true;
    }).sort((a, b) => {
      const timeA = getRecordEventDate(a).getTime();
      const timeB = getRecordEventDate(b).getTime();
      return sortDirection === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [records, activeTab, selectedYear, filter, sortDirection]);

  // Group records chronologically by Year, then by Month
  const groupedTimeline = useMemo(() => {
    const yearMap = new Map<number, Map<string, UnifiedRecord[]>>();

    filteredRecords.forEach(record => {
      const date = getRecordEventDate(record);
      const year = date.getFullYear();
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!yearMap.has(year)) {
        yearMap.set(year, new Map());
      }
      const monthMap = yearMap.get(year)!;
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, []);
      }
      monthMap.get(monthKey)!.push(record);
    });

    const yearsList: YearGroup[] = [];
    const sortedYears = Array.from(yearMap.keys()).sort((a, b) => 
      sortDirection === 'desc' ? b - a : a - b
    );

    sortedYears.forEach(year => {
      const monthMap = yearMap.get(year)!;
      const sortedMonthKeys = Array.from(monthMap.keys()).sort((a, b) => 
        sortDirection === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
      );

      const months: MonthGroup[] = sortedMonthKeys.map(key => {
        const recordsInMonth = monthMap.get(key)!;
        const [_, m] = key.split('-');
        const monthDate = new Date(year, parseInt(m, 10) - 1, 1);
        const monthName = monthDate.toLocaleDateString('en-IN', { month: 'long' });
        return {
          monthKey: key,
          monthName,
          year,
          records: recordsInMonth,
        };
      });

      const totalRecords = months.reduce((acc, m) => acc + m.records.length, 0);
      yearsList.push({ year, months, totalRecords });
    });

    return yearsList;
  }, [filteredRecords, sortDirection]);

  const clearFilters = () => {
    setFilter({
      searchQuery: '',
      types: [],
      dateRange: 'all',
      source: ''
    });
    setActiveTab('all');
    setSelectedYear('all');
  };

  const hasActiveFilters = 
    filter.searchQuery || 
    filter.source || 
    filter.dateRange !== 'all' || 
    activeTab !== 'all' || 
    selectedYear !== 'all';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Title & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-900 tracking-tight">
              Health Timeline
            </h2>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/60">
              <Clock size={12} className="mr-1" />
              Chronological Vault
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Longitudinal chronological archive of your prescriptions, lab panels, and immunizations.
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

      {/* ===================================================================
          TIME HORIZON OVERVIEW CARD (Top Chronological Anchor)
          =================================================================== */}
      {timeHorizon && (
        <div className="bg-gradient-to-br from-slate-900 via-brand-950 to-brand-900 rounded-3xl p-5 sm:p-7 text-white shadow-clinical-md border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Horizon Duration & Range */}
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide border border-teal-500/30">
                <CalendarRange size={13} />
                <span>LONGITUDINAL TIME HORIZON</span>
              </div>

              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <span className="font-display font-black text-xl sm:text-2xl text-white">
                  {timeHorizon.earliest.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <span className="text-teal-400 font-mono font-bold text-lg">→</span>
                <span className="font-display font-black text-xl sm:text-2xl text-white">
                  {timeHorizon.latest.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-xs font-mono font-semibold border border-teal-400/30">
                  {timeHorizon.spanText} duration
                </span>
              </div>

              <p className="text-xs text-slate-300 flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-teal-300 font-medium">Origin: {timeHorizon.earliest.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <span className="text-slate-500">•</span>
                <span>Latest encounter: {timeHorizon.latestRelative}</span>
              </p>
            </div>

            {/* Right: Quick Stat Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-teal-300 text-[11px] font-semibold">
                  <Layers size={13} />
                  <span>Total Records</span>
                </div>
                <div className="font-display font-black text-xl text-white mt-1">
                  {timeHorizon.totalCount}
                </div>
                <div className="text-[10px] text-slate-400">Consolidated</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-teal-300 text-[11px] font-semibold">
                  <Calendar size={13} />
                  <span>Active Years</span>
                </div>
                <div className="font-display font-black text-xl text-white mt-1">
                  {timeHorizon.yearsCount}
                </div>
                <div className="text-[10px] text-slate-400">Calendar epochs</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center sm:text-left col-span-2 sm:col-span-1">
                <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-amber-300 text-[11px] font-semibold">
                  <Sparkles size={13} />
                  <span>Sort Order</span>
                </div>
                <div className="font-display font-bold text-sm text-white mt-1">
                  {sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}
                </div>
                <div className="text-[10px] text-slate-400">Chronological axis</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          CHRONOLOGICAL CONTROLS BAR: SEARCH, YEAR SCRUBBER & SORT
          =================================================================== */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-clinical-sm">
        {/* Search & Action Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search medicines, diagnostic lab tests, doctors, clinical facilities..."
              value={filter.searchQuery}
              onChange={(e) => setFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 transition-all"
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

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {/* Sort Chronology Toggle */}
            <button
              onClick={() => setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="flex-1 sm:flex-none h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              title="Toggle timeline chronology direction"
            >
              <ArrowUpDown size={15} className="text-slate-500" />
              <span>{sortDirection === 'desc' ? 'Newest First' : 'Oldest First'}</span>
            </button>

            {/* Filter Modal Trigger */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`h-11 px-4 rounded-xl border flex items-center space-x-2 text-xs font-semibold transition-colors ${
                hasActiveFilters
                  ? 'bg-teal-50 border-teal-700 text-teal-800 shadow-clinical-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Filter size={16} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
              )}
            </button>
          </div>
        </div>

        {/* Year Scrubber / Quick-Jump Bar */}
        {availableYears.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 flex items-center mr-1">
              <History size={12} className="mr-1" />
              Year:
            </span>
            <button
              onClick={() => setSelectedYear('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedYear === 'all'
                  ? 'bg-brand-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Years ({records.length})
            </button>
            {availableYears.map(year => {
              const count = records.filter(r => getRecordEventDate(r).getFullYear() === year).length;
              return (
                <button
                  key={year}
                  onClick={() => setSelectedYear(prev => prev === year ? 'all' : year)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedYear === year
                      ? 'bg-brand-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {year} <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        )}
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

      {/* ===================================================================
          CHRONOLOGICAL TIMELINE SPINES, EPOCHS & EVENT CARDS
          =================================================================== */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-clinical-sm">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileQuestion size={32} />
          </div>
          <h4 className="text-base font-bold text-slate-900">No records in selected timeframe</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-5">
            We couldn’t find any health records matching your active filters, year selection, or search query.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Reset Chronology & Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedTimeline.map((yearGroup) => (
            <div key={yearGroup.year} className="space-y-6">
              {/* Year Milestone Header */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-1.5 rounded-2xl bg-brand-900 text-white shadow-clinical-sm">
                  <Calendar size={15} className="text-cyan-300" />
                  <span className="font-display font-black text-base sm:text-lg tracking-tight">
                    {yearGroup.year}
                  </span>
                </div>
                <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-900/30 via-slate-200 to-transparent" />
                <span className="text-xs font-semibold text-slate-500 font-mono">
                  {yearGroup.totalRecords} {yearGroup.totalRecords === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Months within Year */}
              <div className="space-y-8">
                {yearGroup.months.map((monthGroup) => (
                  <div key={monthGroup.monthKey} className="space-y-4">
                    {/* Month Epoch Indicator */}
                    <div className="flex items-center space-x-2 pl-4 sm:pl-8 text-xs font-bold uppercase tracking-wider text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-teal-600" />
                      <span>{monthGroup.monthName} {monthGroup.year}</span>
                      <span className="text-[11px] font-mono text-slate-400 font-normal">
                        ({monthGroup.records.length} {monthGroup.records.length === 1 ? 'record' : 'records'})
                      </span>
                    </div>

                    {/* Continuous Spine Container */}
                    <div className="relative pl-6 sm:pl-10 space-y-4">
                      {/* Vertical Spine Line */}
                      <div className="absolute left-2 sm:left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-500 via-slate-300 to-slate-200" />

                      {monthGroup.records.map((record) => {
                        const isLab = record.document.type === 'lab_report';
                        const isRx = record.document.type === 'prescription';
                        const isVax = record.document.type === 'vaccination';
                        
                        const eventDate = getRecordEventDate(record);
                        const monthShort = eventDate.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();
                        const dayNum = eventDate.getDate();
                        const yearNum = eventDate.getFullYear();
                        const timeStr = eventDate.toLocaleTimeString('en-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit', 
                          hour12: true 
                        });
                        const relativeTime = getRelativeTimeString(eventDate);

                        return (
                          <div key={record.id} className="relative group">
                            {/* Chronological Spine Node (Pulse dot on the vertical line) */}
                            <div 
                              className={`absolute -left-6 sm:-left-10 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-xs flex items-center justify-center transition-transform group-hover:scale-125 z-10 ${
                                isLab ? 'bg-cyan-600 ring-4 ring-cyan-100' :
                                isRx ? 'bg-emerald-600 ring-4 ring-emerald-100' :
                                'bg-indigo-600 ring-4 ring-indigo-100'
                              }`}
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>

                            {/* Horizontal Connector Arm */}
                            <div className="hidden sm:block absolute -left-6 top-8 w-6 border-t-2 border-slate-200 group-hover:border-teal-500 transition-colors" />

                            {/* Clinical Event Card */}
                            <div
                              onClick={() => navigate(`/app/records/${record.id}`)}
                              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-teal-500 hover:shadow-clinical-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              {/* Left: Prominent Date Block + Event Details */}
                              <div className="flex items-start space-x-4">
                                {/* Calendar & Time Block */}
                                <div className="flex flex-col items-center justify-center w-16 sm:w-20 py-2.5 px-1.5 rounded-2xl bg-slate-50 border border-slate-200 group-hover:bg-teal-50/60 group-hover:border-teal-200 transition-colors shrink-0 text-center shadow-xs">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800">
                                    {monthShort}
                                  </span>
                                  <span className="font-display font-black text-2xl sm:text-3xl text-slate-900 leading-none my-0.5">
                                    {dayNum}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    {yearNum}
                                  </span>
                                  <div className="mt-1.5 pt-1.5 border-t border-slate-200/80 w-full flex flex-col items-center">
                                    <span className="text-[9px] font-mono text-slate-500 font-medium whitespace-nowrap">
                                      {timeStr}
                                    </span>
                                    <span className="mt-0.5 text-[9px] font-semibold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                                      {relativeTime}
                                    </span>
                                  </div>
                                </div>

                                {/* Event Content */}
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                                      isLab ? 'bg-cyan-100 text-cyan-800' :
                                      isRx ? 'bg-emerald-100 text-emerald-800' :
                                      'bg-indigo-100 text-indigo-800'
                                    }`}>
                                      {isLab && <Activity size={14} />}
                                      {isRx && <FileText size={14} />}
                                      {isVax && <Syringe size={14} />}
                                    </div>

                                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                                      {record.document.title}
                                    </h3>

                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wide">
                                      {isLab ? 'Diagnostic Lab' : isRx ? 'Prescription' : 'Immunization'}
                                    </span>
                                  </div>

                                  <p className="text-xs text-slate-500 flex items-center space-x-2 flex-wrap">
                                    <span className="font-medium text-slate-700 flex items-center">
                                      <Building2 size={12} className="mr-1 text-slate-400" />
                                      {record.document.sourceName || 'General Clinic'}
                                    </span>
                                    {record.prescription && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-600">Dr. {record.prescription.prescribingDoctor}</span>
                                      </>
                                    )}
                                    {record.vaccination && (
                                      <>
                                        <span>•</span>
                                        <span className="text-slate-600">{record.vaccination.facility}</span>
                                      </>
                                    )}
                                  </p>

                                  {/* Lab parameters or drug highlights */}
                                  {record.labResults && (
                                    <div className="mt-2 flex items-center space-x-1.5 flex-wrap gap-1">
                                      {record.labResults.slice(0, 3).map((l, i) => (
                                        <span
                                          key={i}
                                          className={`text-[11px] px-2 py-0.5 rounded font-mono ${
                                            l.status === 'high' 
                                              ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200' 
                                              : 'bg-slate-100 text-slate-700'
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

                                  {record.prescription && (
                                    <div className="mt-1.5 flex items-center space-x-1.5">
                                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                        {record.prescription.drugName} {record.prescription.dosage} ({record.prescription.frequency})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right: Trailing Badges & Action Arrow */}
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
                                <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-teal-50 flex items-center justify-center text-slate-400 group-hover:text-teal-700 transition-colors">
                                  <ChevronRight size={18} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===================================================================
          FILTER MODAL / DRAWER
          =================================================================== */}
      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Health Timeline"
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

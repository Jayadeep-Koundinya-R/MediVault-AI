import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FlaskConical, 
  Search, 
  TrendingUp, 
  Plus, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import TrendChart from '../components/insights/TrendChart';

export const LabsPage: React.FC = () => {
  const navigate = useNavigate();
  const { records } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'abnormal' | 'routine'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrendInline, setShowTrendInline] = useState(false);

  // Filter lab records
  const labRecords = records.filter(r => r.type === 'lab_report');

  const filteredLabs = labRecords.filter(r => {
    // Tab filter
    if (activeTab === 'abnormal' && r.status !== 'abnormal' && r.status !== 'attention_needed') {
      return false;
    }
    if (activeTab === 'routine' && (r.status === 'abnormal' || r.status === 'attention_needed')) {
      return false;
    }

    // Search query matches title, sourceName, or testName inside labResults
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesMeta = r.title.toLowerCase().includes(q) || r.sourceName.toLowerCase().includes(q);
      const matchesTests = r.labResults?.some(t => t.testName.toLowerCase().includes(q));
      return matchesMeta || matchesTests;
    }

    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-700">
            <span>Diagnostics Vault</span>
            <span>•</span>
            <span>Pathology & Biomarkers</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Laboratory Reports
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Track pathology blood panels, lipid profiles, and metabolic biomarkers over time.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/app/upload?type=lab_report')}
        >
          Add Lab Report
        </Button>
      </div>

      {/* Prominent Trend Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl text-amber-300 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-amber-300">
                  Trend Alert Detected
                </span>
                <span className="text-[10px] bg-red-500/30 text-red-200 px-2 py-0.5 rounded-full font-mono">
                  3 Tests Logged
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Fasting Blood Glucose is trending upward (108 &rarr; 124 &rarr; 142 mg/dL)
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5 max-w-xl">
                3 sequential fasting glucose tests cross the ADA reference threshold of &ge; 126 mg/dL.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowTrendInline(!showTrendInline)}
              className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition-colors"
            >
              {showTrendInline ? 'Hide Trend Chart' : 'Preview Chart'}
            </button>
            <Link
              to="/app/summary"
              className="text-xs font-bold bg-white text-indigo-900 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shadow"
            >
              Full Analysis &rarr;
            </Link>
          </div>
        </div>

        {/* Inline Trend Chart expandable */}
        {showTrendInline && (
          <div className="mt-4 pt-4 border-t border-white/10 bg-white/5 rounded-xl p-4">
            <TrendChart />
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search test e.g. Glucose, HbA1c..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full sm:w-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Reports ({labRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('abnormal')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'abnormal'
                ? 'bg-white text-red-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Abnormal Findings
          </button>
          <button
            onClick={() => setActiveTab('routine')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'routine'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Within Normal
          </button>
        </div>
      </div>

      {/* Reports List */}
      {filteredLabs.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-10 h-10 text-indigo-400" />}
          title="No Lab Reports Found"
          description={
            searchQuery
              ? `No tests matching "${searchQuery}" in your records.`
              : 'You have not uploaded any pathology or laboratory test reports yet.'
          }
          actionLabel="Upload Laboratory Report"
          onAction={() => navigate('/app/upload?type=lab_report')}
        />
      ) : (
        <div className="space-y-4">
          {filteredLabs.map((lab) => (
            <Card
              key={lab.id}
              className="p-5 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="neutral">Lab Report</Badge>
                    {lab.status === 'abnormal' && (
                      <Badge variant="warning">Abnormal Values</Badge>
                    )}
                    {lab.status === 'attention_needed' && (
                      <Badge variant="danger">Attention Needed</Badge>
                    )}
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(lab.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-900 transition-colors">
                    {lab.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {lab.sourceName}
                    </span>
                    <span>•</span>
                    <span>{lab.labResults?.length || 0} Biomarkers Analyzed</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/app/records/${lab.id}`}
                    className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    View Report &rarr;
                  </Link>
                </div>
              </div>

              {/* Biomarkers quick preview chips */}
              {lab.labResults && lab.labResults.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                  {lab.labResults.map((t, i) => (
                    <div
                      key={i}
                      className={`text-[11px] px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${
                        t.status === 'high'
                          ? 'bg-red-50 border-red-200 text-red-800'
                          : t.status === 'low'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-medium">{t.testName}:</span>
                      <span className="font-bold font-mono">{t.value}</span>
                      <span className="text-[10px] text-slate-500">{t.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LabsPage;

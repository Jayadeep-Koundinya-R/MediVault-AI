import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { 
  Plus, 
  FileText, 
  Activity, 
  Syringe, 
  Files, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight, 
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, records, flags } = useApp();
  const navigate = useNavigate();

  const totalRecords = records.length;
  const labReportsCount = records.filter(r => r.document.type === 'lab_report').length;
  const prescriptionsCount = records.filter(r => r.document.type === 'prescription').length;
  const vaccinationsCount = records.filter(r => r.document.type === 'vaccination').length;

  const activeFlags = flags.filter(f => !f.acknowledged);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Patient Greeting & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-900 tracking-tight">
            Good morning, {user?.name ? user.name.split(' ')[0] : 'Rahul'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what's happening with your health records.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate('/app/upload')}
          leftIcon={<Plus size={18} />}
          size="md"
          className="self-start sm:self-auto shadow-clinical"
        >
          Add Record
        </Button>
      </div>

      {totalRecords === 0 ? (
        <EmptyState
          title="Your health timeline is empty"
          description="Start by uploading your first prescription, lab report or vaccination record."
          primaryActionText="Upload First Record"
          onPrimaryAction={() => navigate('/app/upload')}
          secondaryActionText="Add Manually"
          onSecondaryAction={() => navigate('/app/upload/manual')}
        />
      ) : (
        <>
          {/* =================================================================
              HEALTH OVERVIEW CARDS (Real dynamic counts)
              ================================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Card 1: Total Records */}
            <Card 
              onClick={() => navigate('/app/timeline')}
              className="cursor-pointer hover:border-brand-900/40 hover:-translate-y-0.5 transition-all p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-brand-900 flex items-center justify-center">
                  <Files size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">All</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tnum">
                {totalRecords}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">Total Records</span>
            </Card>

            {/* Card 2: Lab Reports */}
            <Card 
              onClick={() => navigate('/app/labs')}
              className="cursor-pointer hover:border-brand-900/40 hover:-translate-y-0.5 transition-all p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-900 flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Diagnostic</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tnum">
                {labReportsCount}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">Lab Reports</span>
            </Card>

            {/* Card 3: Prescriptions */}
            <Card 
              onClick={() => navigate('/app/prescriptions')}
              className="cursor-pointer hover:border-brand-900/40 hover:-translate-y-0.5 transition-all p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Rx</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tnum">
                {prescriptionsCount}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">Prescriptions</span>
            </Card>

            {/* Card 4: Vaccinations */}
            <Card 
              onClick={() => navigate('/app/vaccinations')}
              className="cursor-pointer hover:border-brand-900/40 hover:-translate-y-0.5 transition-all p-4 sm:p-5"
            >
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-trust-700 flex items-center justify-center">
                  <Syringe size={18} />
                </div>
                <span className="text-[11px] font-semibold text-slate-400">Immunized</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tnum">
                {vaccinationsCount}
              </div>
              <span className="text-xs text-slate-500 mt-0.5 block">Vaccinations</span>
            </Card>
          </div>

          {/* =================================================================
              ATTENTION / RISK FLAGS AREA
              ================================================================= */}
          {activeFlags.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldAlert size={18} className="text-amber-600" />
                  <h3 className="font-display font-bold text-base text-slate-900">Needs Attention</h3>
                </div>
                <span className="text-xs text-slate-500">{activeFlags.length} active flag{activeFlags.length > 1 ? 's' : ''}</span>
              </div>

              {activeFlags.map((flag) => (
                <div
                  key={flag.id}
                  className="bg-amber-50/50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 shadow-clinical-sm transition-all hover:bg-amber-50/80"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 mt-0.5">
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="font-bold text-base text-slate-900">{flag.testName}</h4>
                          <span className="text-base font-extrabold text-amber-900 font-mono tnum">
                            {flag.currentValue} {flag.unit}
                          </span>
                        </div>
                        <p className="text-xs text-amber-800/90 mt-0.5 font-medium">
                          {flag.thresholdDescription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      <Badge variant="warning">Above reference range</Badge>
                      <button
                        onClick={() => navigate(`/app/summary/flag/${flag.id}`)}
                        className="text-xs font-bold text-amber-900 hover:text-amber-950 underline px-2 py-1"
                      >
                        View details
                      </button>
                    </div>
                  </div>

                  {/* Mandatory Non-Diagnostic Clinical Note */}
                  <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-xl border border-amber-200/60 leading-relaxed">
                    ⚠️ <strong>Important Note:</strong> This is not a diagnosis. Consider discussing this result with a qualified healthcare professional.
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* =================================================================
              RECENT RECORDS TIMELINE PREVIEW
              ================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-slate-900">Recent Records</h3>
              <button
                onClick={() => navigate('/app/timeline')}
                className="inline-flex items-center space-x-1 text-xs font-bold text-brand-900 hover:underline"
              >
                <span>View all timeline</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {records.slice(0, 5).map((record) => {
                const dateStr = new Date(record.document.uploadedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short'
                });

                const isLab = record.document.type === 'lab_report';
                const isRx = record.document.type === 'prescription';
                const isVax = record.document.type === 'vaccination';

                return (
                  <div
                    key={record.id}
                    onClick={() => navigate(`/app/records/${record.id}`)}
                    className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-brand-900/30 hover:shadow-clinical transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLab ? 'bg-blue-50 text-brand-900' : isRx ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-trust-700'
                      }`}>
                        {isLab && <Activity size={20} />}
                        {isRx && <FileText size={20} />}
                        {isVax && <Syringe size={20} />}
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {record.document.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                          <span>{record.document.sourceName || 'Provider'}</span>
                          <span>•</span>
                          <span className="font-mono text-[11px]">{dateStr}</span>
                          {record.prescription && (
                            <>
                              <span>•</span>
                              <span className="font-semibold text-emerald-800">{record.prescription.drugName} {record.prescription.dosage}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {record.flags && record.flags.length > 0 && (
                        <Badge variant="warning" size="sm">
                          {record.flags.length} Flag{record.flags.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

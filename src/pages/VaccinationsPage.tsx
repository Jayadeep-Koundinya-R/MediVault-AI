import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Syringe, 
  Plus, 
  Calendar, 
  Building2, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';

export const VaccinationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { records, addToast } = useApp();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const vaccineRecords = records.filter(r => r.type === 'vaccination' && r.vaccination);

  const handleDownloadCertificate = (id: string, name: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      addToast(`Downloaded verified immunization certificate: ${name}.pdf`);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-700">
            <span>Immunization Vault</span>
            <span>•</span>
            <span>Vaccines & Certificates</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            Vaccination History
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Official immunization records, booster timelines, and verifiable digital certificates.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/app/upload?type=vaccination')}
        >
          Add Vaccine Record
        </Button>
      </div>

      {/* Due Soon / Booster Advisory Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white/10 backdrop-blur rounded-xl text-emerald-300 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
                  Annual Booster Advisory
                </span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded font-mono">
                  Recommended
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Influenza Quadrivalent Annual Shot
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5 max-w-xl">
                Your last flu vaccine was administered on 18 Aug 2025. Annual booster is recommended before the winter flu season.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/app/upload?type=vaccination')}
          >
            Log Administered Dose
          </Button>
        </div>
      </div>

      {/* Vaccination Cards Timeline */}
      {vaccineRecords.length === 0 ? (
        <EmptyState
          icon={<Syringe className="w-10 h-10 text-emerald-400" />}
          title="No Vaccination Records"
          description="You have not added any immunization records or vaccination certificates yet."
          actionLabel="Log First Vaccine"
          onAction={() => navigate('/app/upload?type=vaccination')}
        />
      ) : (
        <div className="space-y-4">
          {vaccineRecords.map((record) => {
            const vax = record.vaccination!;
            return (
              <Card
                key={record.id}
                className="p-5 hover:border-emerald-300 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="success">Completed Dose</Badge>
                        <span className="text-xs font-semibold text-slate-500">
                          Dose #{vax.doseNumber}
                        </span>
                        {vax.batchNumber && (
                          <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            Lot: {vax.batchNumber}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                        {vax.vaccineName}
                      </h3>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Given: {new Date(vax.dateAdministered).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {vax.facility}
                        </span>
                        {vax.nextDueDate && (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold font-mono">
                            <Clock className="w-3.5 h-3.5 text-emerald-600" />
                            Next Booster: {vax.nextDueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleDownloadCertificate(record.id, vax.vaccineName)}
                      disabled={downloadingId === record.id}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {downloadingId === record.id ? 'Generating...' : 'Certificate'}
                    </button>
                    <Link
                      to={`/app/records/${record.id}`}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
                    >
                      Details &rarr;
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VaccinationsPage;

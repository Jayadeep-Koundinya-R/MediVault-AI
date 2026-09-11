import React, { useState } from 'react';
import {
  Check,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { subscriptionPlans } from '../data/mockDoctorData';
import { PlanId } from '../types';
import { soundFX } from '../utils/audioEffects';
import { showToast } from '../components/Toast';
import confetti from 'canvas-confetti';

export const PricingPlansPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<PlanId>('family_vault');

  const handleSelectPlan = (planId: PlanId, planName: string) => {
    if (planId === currentPlan) return;
    soundFX.playChime();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    setCurrentPlan(planId);
    showToast('success', 'Plan Updated!', `You are now subscribed to ${planName}.`);
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header" style={{ textAlign: 'center', margin: '0 auto 30px auto', maxWidth: '700px' }}>
        <div>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 800,
              textTransform: 'uppercase',
              backgroundColor: '#EEF2FF',
              color: '#4F46E5',
            }}
          >
            Flexible Healthcare Economics
          </span>
          <h2 className="page-title" style={{ fontSize: '28px', marginTop: '10px' }}>
            Transparent Plans for Individuals & Families
          </h2>
          <p className="page-subtitle" style={{ fontSize: '14px', marginTop: '6px' }}>
            Start completely free with document storage. Upgrade when you need certified doctor reviews, longitudinal AI synthesis, and family multi-profile coverage.
          </p>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '40px',
        }}
      >
        {subscriptionPlans.map((plan) => {
          const isSelected = plan.id === currentPlan;
          return (
            <div
              key={plan.id}
              className="ui-card"
              style={{
                padding: '24px',
                borderRadius: '16px',
                border: isSelected ? '2px solid #4F46E5' : plan.popular ? '2px solid #A5B4FC' : '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isSelected ? '0 10px 30px rgba(79, 70, 229, 0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {plan.popular && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#4F46E5',
                    color: '#FFFFFF',
                    padding: '3px 12px',
                    borderRadius: '9999px',
                    fontSize: '10.5px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  Most Popular
                </div>
              )}

              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  {plan.name}
                </h3>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px', minHeight: '34px' }}>
                  {plan.description}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '20px' }}>
                <span style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B' }}>{plan.price}</span>
                <span style={{ fontSize: '13px', color: '#64748B' }}>{plan.period}</span>
              </div>

              <button
                onClick={() => handleSelectPlan(plan.id, plan.name)}
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: isSelected ? '#10B981' : plan.popular ? '#4F46E5' : '#F1F5F9',
                  color: isSelected || plan.popular ? '#FFFFFF' : '#334155',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 size={16} /> Active Plan
                  </>
                ) : (
                  <>Upgrade to {plan.name}</>
                )}
              </button>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                  Features Included:
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12.5px', color: '#334155' }}>
                    <Check size={15} color="#10B981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Monetization Philosophy Banner */}
      <div
        className="ui-card"
        style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #F8FAFF 0%, #EEF2FF 100%)',
          border: '1px solid #C7D2FE',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4338CA', fontWeight: 800, fontSize: '15px', marginBottom: '8px' }}>
          <ShieldCheck size={20} />
          <span>Why MediVault's Monetization Model Works</span>
        </div>
        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
          Unlike black-box AI apps, MediVault aligns incentives: <strong>Patients</strong> get safe, doctor-verified records with pre-chat AI triage. <strong>Doctors</strong> earn fair telemedicine fees for quick, structured reviews without administrative paperwork. And <strong>Health Systems</strong> reduce readmissions by maintaining a longitudinal patient timeline across hospitals.
        </p>
      </div>
    </div>
  );
};

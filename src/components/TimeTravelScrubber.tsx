import React, { useState, useEffect } from 'react';
import { History, Play, Pause, RotateCcw, Calendar, ChevronRight } from 'lucide-react';
import { soundFX } from '../utils/audioEffects';

interface TimeTravelScrubberProps {
  currentDateIndex: number;
  onDateChange: (index: number) => void;
}

export const timeMilestones = [
  { label: '15 Jan 2026', date: '2026-01-15', event: 'Fortis Annual Executive Health Screen (Fasting Glucose 110 mg/dL)' },
  { label: '02 Mar 2026', date: '2026-03-02', event: 'Manipal Hospital: Dr. Mehta initiates Telmisartan 40mg for BP' },
  { label: '10 Apr 2026', date: '2026-04-10', event: 'Max Healthcare: Glucose elevates to 122 mg/dL (Pre-diabetic)' },
  { label: '20 Aug 2026', date: '2026-08-20', event: 'Apollo Labs: Glucose crosses ADA threshold (138 mg/dL >= 126 mg/dL)' },
  { label: '21 Aug 2026', date: '2026-08-21', event: 'Dr. Sen initiates Metformin 500mg BID oral glycemic therapy' },
  { label: 'Present', date: '2026-09-11', event: 'All 7 multi-hospital records consolidated with longitudinal AI synthesis' },
];

export const TimeTravelScrubber: React.FC<TimeTravelScrubberProps> = ({
  currentDateIndex,
  onDateChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        const next = (currentDateIndex + 1) % timeMilestones.length;
        onDateChange(next);
        soundFX.playTick();
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentDateIndex, onDateChange]);

  const activeMilestone = timeMilestones[currentDateIndex] || timeMilestones[timeMilestones.length - 1];

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid #E2E8F4',
        borderRadius: '18px',
        padding: '16px 20px',
        marginBottom: '24px',
        boxShadow: '0 8px 28px -6px rgba(22, 34, 68, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #7B73F6 0%, #4F46E5 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <History size={17} />
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Longitudinal Health Time-Travel Scrubber</span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                }}
              >
                Interactive Chronology
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Scrub or play through patient clinical milestones to observe biomarker and medication progression
            </div>
          </div>
        </div>

        {/* Play / Reset Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => {
              setIsPlaying(!isPlaying);
              soundFX.playChime();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isPlaying ? '#EF4444' : '#1E2238',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause Auto-Play' : 'Simulate Timeline'}</span>
          </button>

          <button
            onClick={() => {
              onDateChange(timeMilestones.length - 1);
              soundFX.playChime();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '9999px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
            title="Reset to present day"
          >
            <RotateCcw size={12} />
            <span>Latest</span>
          </button>
        </div>
      </div>

      {/* Scrubber Track */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ position: 'relative', height: '36px', display: 'flex', alignItems: 'center' }}>
          {/* Base rail */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              right: '12px',
              height: '5px',
              backgroundColor: '#E2E8F0',
              borderRadius: '3px',
            }}
          />

          {/* Active filled rail */}
          <div
            style={{
              position: 'absolute',
              left: '12px',
              width: `${(currentDateIndex / (timeMilestones.length - 1)) * 95}%`,
              height: '5px',
              background: 'linear-gradient(90deg, #F5A623 0%, #7B73F6 100%)',
              borderRadius: '3px',
              transition: 'width 0.25s ease',
            }}
          />

          {/* Milestone nodes */}
          <div style={{ position: 'absolute', left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 12px' }}>
            {timeMilestones.map((milestone, idx) => {
              const isActive = idx === currentDateIndex;
              const isPast = idx <= currentDateIndex;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    onDateChange(idx);
                    soundFX.playTick();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transform: isActive ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.2s ease',
                  }}
                  title={milestone.event}
                >
                  <div
                    style={{
                      width: isActive ? '18px' : '14px',
                      height: isActive ? '18px' : '14px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? '#7B73F6' : isPast ? '#F5A623' : '#FFFFFF',
                      border: isActive ? '3px solid #FFFFFF' : '2px solid #CBD5E1',
                      boxShadow: isActive ? '0 0 0 3px #7B73F6, 0 2px 6px rgba(0,0,0,0.15)' : 'none',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#1E2238' : '#64748B',
                      marginTop: '6px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {milestone.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Milestone Live Context Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 14px',
          borderRadius: '10px',
          backgroundColor: currentDateIndex >= 3 ? '#FEF2F2' : '#F8FAFF',
          border: currentDateIndex >= 3 ? '1px solid #FECACA' : '1px solid #E2E8F8',
          fontSize: '12.5px',
          color: currentDateIndex >= 3 ? '#991B1B' : '#334155',
        }}
      >
        <Calendar size={15} style={{ flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <strong>Patient Timeline State ({activeMilestone.label}):</strong>
          <span>{activeMilestone.event}</span>
        </div>
        <ChevronRight size={14} style={{ marginLeft: 'auto', flexShrink: 0 }} />
      </div>
    </div>
  );
};

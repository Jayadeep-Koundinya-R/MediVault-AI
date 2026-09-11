import React, { useState } from 'react';
import {
  UserCheck,
  MessageSquare,
  Sparkles,
  Star,
  Clock,
  Send,
  Share2,
  Calendar,
  FileDown,
  CheckCircle2,
  UserPlus,
  X,
  Stethoscope,
} from 'lucide-react';
import { Doctor, Consultation, ChatMessage, TimelineItem } from '../types';
import { initialDoctors, initialConsultations, initialMessages } from '../data/mockDoctorData';
import { currentUser } from '../data/mockHealthData';
import { soundFX } from '../utils/audioEffects';
import { showToast } from '../components/Toast';
import confetti from 'canvas-confetti';

interface DoctorConsultationsPageProps {
  onSelectRecord?: (item: TimelineItem) => void;
}

export const DoctorConsultationsPage: React.FC<DoctorConsultationsPageProps> = () => {
  const [activeTab, setActiveTab] = useState<'active_chat' | 'doctors_directory' | 'past_reviews'>('active_chat');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(initialDoctors[0]);
  const [consultation, setConsultation] = useState<Consultation>(initialConsultations[0]);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState(true);

  // Pre-chat Triage State
  const [triageSymptom, setTriageSymptom] = useState('Increased thirst and mild fatigue');
  const [triageDuration, setTriageDuration] = useState('Past 2 to 3 weeks');
  const [triageMeds, setTriageMeds] = useState('No regular diabetes medication currently');

  // Follow-up Date negotiation
  const [followUpDate, setFollowUpDate] = useState('2026-09-24');
  const [doctorRating, setDoctorRating] = useState(5);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    soundFX.playChime();
    const newMsg: ChatMessage = {
      messageId: `msg_${Date.now()}`,
      consultationId: consultation.consultationId,
      sender: 'patient',
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulated doctor response after 1.5s
    setTimeout(() => {
      soundFX.playChime();
      const docReply: ChatMessage = {
        messageId: `msg_${Date.now() + 1}`,
        consultationId: consultation.consultationId,
        sender: 'doctor',
        text: 'I have recorded your note in your clinical profile. We will track your fasting glucose response at our scheduled checkup on September 24th.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, docReply]);
      showToast('info', 'Doctor Reply Received', `${selectedDoctor.name} replied to your message`);
    }, 1500);
  };

  const handleStartConsultationFromDirectory = (doc: Doctor) => {
    setSelectedDoctor(doc);
    setIsTriageModalOpen(true);
  };

  const handleCompleteTriageAndOpenChat = () => {
    setIsTriageModalOpen(false);
    setActiveTab('active_chat');
    soundFX.playChime();
    showToast('success', 'Triage Submitted', `Opening live consultation with ${selectedDoctor.name}`);

    // Update consultation with selected doctor
    setConsultation((prev) => ({
      ...prev,
      doctorId: selectedDoctor.doctorId,
      doctorName: selectedDoctor.name,
      triageResponses: [
        { question: 'Symptoms noted?', answer: triageSymptom },
        { question: 'Duration?', answer: triageDuration },
        { question: 'Current Medications?', answer: triageMeds },
      ],
    }));
  };

  const handleEndConsultation = () => {
    soundFX.playChime();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    setIsRatingModalOpen(true);
    setConsultation((prev) => ({
      ...prev,
      status: 'completed',
      recommendedFollowUpDate: followUpDate,
      completedAt: new Date().toISOString(),
    }));
    showToast('success', 'Consultation Saved', 'Record added permanently to your health timeline');
  };

  return (
    <div className="page-content">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 className="page-title">Doctor Consultation & Verification</h2>
            <span
              style={{
                padding: '3px 9px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 700,
                background: '#ECFDF5',
                color: '#059669',
              }}
            >
              Human-in-the-Loop Verified
            </span>
          </div>
          <p className="page-subtitle">
            AI flagged summaries are reviewed by certified physicians before reaching you as clinical advice
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn-secondary"
            onClick={() => {
              soundFX.playClick();
              setIsInviteModalOpen(true);
            }}
          >
            <UserPlus size={15} style={{ display: 'inline', marginRight: '6px', color: '#4F46E5' }} />
            <span>Invite My Family Doctor</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => {
              soundFX.playClick();
              setActiveTab('doctors_directory');
            }}
          >
            <Stethoscope size={15} style={{ display: 'inline', marginRight: '6px' }} />
            <span>Find Partner Specialist</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '10px',
        }}
      >
        <button
          onClick={() => setActiveTab('active_chat')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'active_chat' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'active_chat' ? '#4F46E5' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <MessageSquare size={15} />
          <span>Active Consultation Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors_directory')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'doctors_directory' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'doctors_directory' ? '#4F46E5' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <UserCheck size={15} />
          <span>Available Partner Doctors ({initialDoctors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('past_reviews')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            backgroundColor: activeTab === 'past_reviews' ? '#EEF2FF' : 'transparent',
            color: activeTab === 'past_reviews' ? '#4F46E5' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <Clock size={15} />
          <span>Past Consultations & Notes (3)</span>
        </button>
      </div>

      {/* VIEW 1: ACTIVE CONSULTATION CHAT */}
      {activeTab === 'active_chat' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isSummaryPanelOpen ? '1fr 340px' : '1fr',
            gap: '20px',
            alignItems: 'start',
          }}
        >
          {/* Left Chat Window */}
          <div
            className="ui-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '620px',
              padding: 0,
              overflow: 'hidden',
            }}
          >
            {/* Chat Top Banner */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#FAFBFD',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={selectedDoctor.avatarUrl}
                  alt={selectedDoctor.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B' }}>
                      {selectedDoctor.name}
                    </span>
                    <span className="status-pill normal" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      Verified MD
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {selectedDoctor.specialty} · {selectedDoctor.hospital.split(',')[0]}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsSummaryPanelOpen(!isSummaryPanelOpen)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {isSummaryPanelOpen ? 'Hide Records Panel' : 'View Patient Records'}
                </button>

                <button
                  onClick={handleEndConsultation}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Complete & Save
                </button>
              </div>
            </div>

            {/* Chat Messages Area */}
            <div
              style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                background: '#F8FAFC',
              }}
            >
              {messages.map((msg) => {
                const isPatient = msg.sender === 'patient';
                const isSystem = msg.sender === 'system';

                if (isSystem) {
                  return (
                    <div
                      key={msg.messageId}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: '#EEF2FF',
                        border: '1px solid #C7D2FE',
                        fontSize: '12px',
                        color: '#4338CA',
                        textAlign: 'center',
                        maxWidth: '85%',
                        margin: '0 auto',
                      }}
                    >
                      <Sparkles size={13} style={{ display: 'inline', marginRight: '6px' }} />
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.messageId}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isPatient ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '12px 16px',
                        borderRadius: isPatient ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        backgroundColor: isPatient ? '#4F46E5' : '#FFFFFF',
                        color: isPatient ? '#FFFFFF' : '#1E293B',
                        fontSize: '13.5px',
                        lineHeight: 1.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        border: isPatient ? 'none' : '1px solid #E2E8F0',
                      }}
                    >
                      {msg.text}
                    </div>
                    <div
                      style={{
                        fontSize: '10.5px',
                        color: '#94A3B8',
                        marginTop: '4px',
                        padding: '0 4px',
                      }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Negotiation & Follow-up Scheduler Bar */}
            <div
              style={{
                padding: '10px 20px',
                backgroundColor: '#EFF6FF',
                borderTop: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontWeight: 600 }}>
                <Calendar size={14} />
                <span>Agreed Follow-Up Review Date:</span>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => {
                    setFollowUpDate(e.target.value);
                    showToast('info', 'Follow-up Scheduled', `Reminder set for ${e.target.value}`);
                  }}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #93C5FD',
                    fontSize: '12px',
                  }}
                />
              </div>

              <span style={{ fontSize: '11px', color: '#60A5FA' }}>
                Auto-syncs to patient notifications
              </span>
            </div>

            {/* Input Bar with Quick Prompts */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #E2E8F0',
                background: '#FFFFFF',
                display: 'flex',
                gap: '10px',
              }}
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask doctor a question or discuss lifestyle alternatives..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '0 18px',
                  borderRadius: '10px',
                  backgroundColor: '#4F46E5',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                <Send size={15} />
                <span>Send</span>
              </button>
            </form>
          </div>

          {/* Right Context Panel (Attached AI Summary & Scanned Records) */}
          {isSummaryPanelOpen && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Doctor Review Badge */}
              <div
                className="ui-card"
                style={{
                  padding: '16px',
                  background: '#FAFBFD',
                  border: '1px solid #E2E8F8',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                  In-Context Attached Records
                </div>
                <div style={{ fontSize: '12.5px', color: '#1E293B', lineHeight: 1.5 }}>
                  {consultation.flaggedSummary}
                </div>
              </div>

              {/* Pre-Chat Triage Answers */}
              <div className="ui-card" style={{ padding: '16px' }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#6366F1',
                    textTransform: 'uppercase',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={13} />
                  <span>Pre-Chat AI Triage Responses</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  {consultation.triageResponses.map((t, idx) => (
                    <div key={idx} style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '8px' }}>
                      <div style={{ fontWeight: 700, color: '#475569' }}>{t.question}</div>
                      <div style={{ color: '#1E293B', marginTop: '2px' }}>{t.answer}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Clinical Assessment Note */}
              <div className="ui-card" style={{ padding: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Physician Care Plan & Note
                </div>
                <div style={{ fontSize: '12.5px', color: '#065F46', background: '#ECFDF5', padding: '10px', borderRadius: '8px', lineHeight: 1.5 }}>
                  {consultation.doctorClinicalNote || 'Dr. Ananya Sen confirmed Metformin 500mg BID with meals. Follow 45 min brisk walking.'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: DOCTORS DIRECTORY (Partner Specialists & Own Family Doctor) */}
      {activeTab === 'doctors_directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {initialDoctors.map((doc) => (
            <div key={doc.doctorId} className="ui-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                      {doc.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        backgroundColor: doc.isPartner ? '#EEF2FF' : '#FEF3C7',
                        color: doc.isPartner ? '#4F46E5' : '#D97706',
                      }}
                    >
                      {doc.isPartner ? 'Partner Specialist' : 'Family Doctor'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#4F46E5', fontWeight: 600, marginTop: '2px' }}>
                    {doc.specialty}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748B' }}>{doc.hospital}</div>
                </div>
              </div>

              <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5, margin: '14px 0', flex: 1 }}>
                {doc.bio}
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 0 0 0',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', fontWeight: 700 }}>
                    <Star size={14} color="#F59E0B" fill="#F59E0B" />
                    <span>{doc.rating}</span>
                    <span style={{ color: '#94A3B8', fontWeight: 400 }}>({doc.reviewCount} reviews)</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', marginTop: '2px' }}>
                    ₹{doc.consultationFee} <span style={{ fontSize: '11px', fontWeight: 400, color: '#64748B' }}>/ review</span>
                  </div>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => handleStartConsultationFromDirectory(doc)}
                  style={{ height: '36px', fontSize: '12.5px' }}
                >
                  Start Consultation
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: PAST REVIEWS & COMPLETED CARE PLANS */}
      {activeTab === 'past_reviews' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {initialConsultations.map((c) => (
            <div key={c.consultationId} className="ui-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#1E293B' }}>
                      Review with {c.doctorName}
                    </span>
                    <span
                      className={`status-pill ${c.urgency === 'high' ? 'flag-high' : c.urgency === 'moderate' ? 'flag-moderate' : 'normal'}`}
                    >
                      {c.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                    Patient: {c.patientName} · Consulted on{' '}
                    {new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={() => {
                    soundFX.playChime();
                    window.print();
                  }}
                  style={{ height: '36px', fontSize: '12px' }}
                >
                  <FileDown size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Export Consultation PDF
                </button>
              </div>

              <div style={{ background: '#F8FAFC', padding: '12px 16px', borderRadius: '10px', marginTop: '14px', fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                <strong>Clinical Findings & Plan:</strong> {c.flaggedSummary}
                {c.doctorClinicalNote && (
                  <div style={{ marginTop: '6px', color: '#065F46' }}>
                    <strong>Doctor Assessment:</strong> {c.doctorClinicalNote}
                  </div>
                )}
              </div>

              {c.recommendedFollowUpDate && (
                <div style={{ marginTop: '10px', fontSize: '12px', color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} />
                  <span>Scheduled Next Checkup: {c.recommendedFollowUpDate}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PRE-CHAT AI TRIAGE MODAL */}
      {isTriageModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsTriageModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#6366F1" />
                <span className="modal-title">Pre-Chat AI Clinical Triage</span>
              </div>
              <button className="btn-close-modal" onClick={() => setIsTriageModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '12.5px', color: '#64748B', lineHeight: 1.5 }}>
                To make your consultation with <strong>{selectedDoctor.name}</strong> as efficient and actionable as possible, please answer 3 quick questions.
              </p>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  1. What symptoms are you currently experiencing?
                </label>
                <input
                  type="text"
                  value={triageSymptom}
                  onChange={(e) => setTriageSymptom(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', marginTop: '6px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  2. For how long have you noticed these changes?
                </label>
                <input
                  type="text"
                  value={triageDuration}
                  onChange={(e) => setTriageDuration(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', marginTop: '6px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  3. Are you currently taking any prescription medications?
                </label>
                <input
                  type="text"
                  value={triageMeds}
                  onChange={(e) => setTriageMeds(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', marginTop: '6px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsTriageModalOpen(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCompleteTriageAndOpenChat}>
                Confirm & Open Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVITE FAMILY DOCTOR MODAL */}
      {isInviteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsInviteModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="#4F46E5" />
                <span className="modal-title">Invite Your Family Doctor</span>
              </div>
              <button className="btn-close-modal" onClick={() => setIsInviteModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                Many patients trust their existing family doctor over strangers. Share this private invite link with your doctor so they can review your consolidated records directly on MediVault-AI.
              </p>

              <div style={{ background: '#F8FAFC', padding: '14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>YOUR PRIVATE DOCTOR INVITE LINK</div>
                <div style={{ fontFamily: 'monospace', fontSize: '12.5px', color: '#4F46E5', wordBreak: 'break-all', marginTop: '4px' }}>
                  https://medivault.ai/doctor-invite/{currentUser.userId}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://medivault.ai/doctor-invite/${currentUser.userId}`);
                    showToast('success', 'Link Copied', 'Share with your doctor via WhatsApp or Email');
                  }}
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Share2 size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Copy Invite Link
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setIsInviteModalOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {isRatingModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsRatingModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: '460px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ECFDF5',
                  color: '#10B981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                Consultation Completed!
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                Your clinical chat has been saved permanently into your health timeline. How was your experience with {selectedDoctor.name}?
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', margin: '20px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setDoctorRating(star)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    <Star
                      size={28}
                      color="#F59E0B"
                      fill={star <= doctorRating ? '#F59E0B' : 'transparent'}
                    />
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  soundFX.playChime();
                  setIsRatingModalOpen(false);
                  showToast('success', 'Rating Submitted', 'Thank you for building community trust.');
                }}
                style={{ width: '100%', height: '42px', justifyContent: 'center' }}
              >
                Submit Rating & Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

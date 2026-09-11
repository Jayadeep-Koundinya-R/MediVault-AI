import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User as UserIcon, ExternalLink, ChevronRight } from 'lucide-react';
import { soundFX } from '../utils/audioEffects';
import { TimelineItem } from '../types';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecord: (item: TimelineItem) => void;
  timelineItems: TimelineItem[];
}

type Message = {
  sender: 'ai' | 'user';
  text: string;
  citations?: { docId: string; title: string; date: string }[];
};

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({
  isOpen,
  onClose,
  onOpenRecord,
  timelineItems,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'Hello Rahul! I am your MediVault AI Clinical Copilot. I have synthesized your 7 records across Apollo Hospitals, Max Healthcare, and Fortis. Ask me anything about your lab trends, medications, or clinical risk flags.',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    'Why was Metformin initiated on Aug 21?',
    'Compare my Jan and Aug Fasting Glucose',
    'What clinical criteria triggered the Risk Flag?',
    'When is my next vaccine due?',
  ];

  const handleSend = (queryText: string) => {
    if (!queryText.trim()) return;

    soundFX.playChime();
    const userMsg: Message = { sender: 'user', text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiReply: Message;
      const lower = queryText.toLowerCase();

      if (lower.includes('metformin') || lower.includes('initiated')) {
        aiReply = {
          sender: 'ai',
          text: 'Dr. Ananya Sen initiated Metformin Hydrochloride 500mg (BID) and Glimepiride 1mg following your 20-Aug-2026 Apollo metabolic panel. Your Fasting Blood Glucose measured 138 mg/dL and HbA1c reached 7.1%, which both meet the clinical threshold for Type 2 Diabetes management.',
          citations: [
            { docId: 'doc_apollo_rx_0821', title: 'Metformin Rx (Dr. Sen)', date: '21-Aug-2026' },
            { docId: 'doc_apollo_lab_0820', title: 'Apollo Metabolic Panel', date: '20-Aug-2026' },
          ],
        };
      } else if (lower.includes('compare') || lower.includes('glucose')) {
        aiReply = {
          sender: 'ai',
          text: 'Your Fasting Blood Glucose shows a progressive upward climb across 7 months:\n• 15-Jan-2026 (Fortis): 110 mg/dL (Elevated)\n• 10-Apr-2026 (Max Healthcare): 122 mg/dL (Impaired Fasting Glucose)\n• 20-Aug-2026 (Apollo): 138 mg/dL (Crossed >= 126 mg/dL threshold).\nOverall escalation is +25.4% (+28 mg/dL).',
          citations: [
            { docId: 'doc_fortis_lab_0115', title: 'Fortis Health Screen', date: '15-Jan-2026' },
            { docId: 'doc_apollo_lab_0820', title: 'Apollo Labs Panel', date: '20-Aug-2026' },
          ],
        };
      } else if (lower.includes('flag') || lower.includes('criteria') || lower.includes('risk')) {
        aiReply = {
          sender: 'ai',
          text: 'The High-Severity Risk Flag is based on the published American Diabetes Association (ADA) / WHO clinical standard: Fasting Blood Glucose >= 126 mg/dL on repeated testing indicates diabetes mellitus. Your value was 138 mg/dL. This is an explainable, deterministic rule, not an opaque black-box estimate.',
          citations: [
            { docId: 'doc_apollo_lab_0820', title: 'ADA Glucose Flag', date: '20-Aug-2026' },
          ],
        };
      } else {
        aiReply = {
          sender: 'ai',
          text: 'Your consolidated record shows your COVID-19 Covaxin Booster is complete (administered at Manipal Hospital). Your annual Influenza Quadrivalent vaccine renewal is recommended by 18-Sep-2026. Kidney filtration (Creatinine 0.95 mg/dL) remains in the optimal healthy range.',
          citations: [
            { docId: 'doc_flu_vaccine_0918', title: 'Influenza Immunization', date: '18-Sep-2025' },
          ],
        };
      }

      setIsTyping(false);
      setMessages((prev) => [...prev, aiReply]);
      soundFX.playChime();
    }, 900);
  };

  const handleCitationClick = (docId: string) => {
    const record = timelineItems.find((t) => t.documentId === docId);
    if (record) {
      onOpenRecord(record);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        maxWidth: '90vw',
        background: '#FFFFFF',
        boxShadow: '-10px 0 40px rgba(15, 23, 42, 0.15)',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: '1px solid #E2E8F0',
        animation: 'slideLeft 0.25s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #1E2238 0%, #2A3052 100%)',
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7B73F6 0%, #4F46E5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={19} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>MediVault AI Copilot</div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>OCR Records Grounded Assistant</div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start',
              flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: msg.sender === 'ai' ? '#EEF2FF' : '#1E2238',
                color: msg.sender === 'ai' ? '#4F46E5' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {msg.sender === 'ai' ? <Bot size={16} /> : <UserIcon size={14} />}
            </div>

            <div
              style={{
                maxWidth: '82%',
                backgroundColor: msg.sender === 'ai' ? '#F8FAFC' : '#1E2238',
                color: msg.sender === 'ai' ? '#1E293B' : '#FFFFFF',
                padding: '12px 14px',
                borderRadius: msg.sender === 'ai' ? '14px 14px 14px 2px' : '14px 14px 2px 14px',
                fontSize: '13px',
                lineHeight: 1.5,
                border: msg.sender === 'ai' ? '1px solid #E2E8F0' : 'none',
                whiteSpace: 'pre-line',
              }}
            >
              {msg.text}

              {/* Citations badges */}
              {msg.citations && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                    Cited OCR Documents:
                  </span>
                  {msg.citations.map((c, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => handleCitationClick(c.docId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#4F46E5',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span>{c.title} ({c.date})</span>
                      <ExternalLink size={11} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#64748B', fontSize: '12px' }}>
            <Sparkles size={14} color="#7B73F6" style={{ animation: 'spin 2s linear infinite' }} />
            <span>Consulting clinical guidelines and OCR documents...</span>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: '6px', overflowX: 'auto', flexShrink: 0 }}>
        {samplePrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            style={{
              whiteSpace: 'nowrap',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              fontSize: '11.5px',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>{p}</span>
            <ChevronRight size={12} />
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div style={{ padding: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ask a question about your health records..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(inputQuery);
          }}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '9999px',
            border: '1px solid #CBD5E1',
            fontSize: '13px',
            outline: 'none',
          }}
        />
        <button
          onClick={() => handleSend(inputQuery)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1E2238',
            color: '#FFFFFF',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

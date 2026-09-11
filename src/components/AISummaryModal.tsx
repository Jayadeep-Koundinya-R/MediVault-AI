import React, { useState } from 'react';
import {
  X,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Heart,
  Globe2,
  Printer,
  User,
} from 'lucide-react';
import { AISummary, RiskFlag } from '../types';
import { currentUser } from '../data/mockHealthData';
import { soundFX } from '../utils/audioEffects';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AISummary;
  riskFlags: RiskFlag[];
  hasRecords?: boolean;
  onOpenUpload?: () => void;
}

type SupportedLanguage = 'en' | 'hi' | 'te';

interface LocalizedContent {
  title: string;
  subtitle: string;
  overviewHeading: string;
  overviewText: string;
  trendsHeading: string;
  trendNotes: string[];
  disclaimer: string;
}

const LOCALIZED_SUMMARIES: Record<SupportedLanguage, LocalizedContent> = {
  en: {
    title: 'AI Consolidated Clinical Health Summary',
    subtitle: 'Multi-hospital longitudinal synthesis · Verified DPDP Act compliance',
    overviewHeading: 'Consolidated Record Overview',
    overviewText:
      'Longitudinal analysis of health records across Apollo Hospitals, Fortis Clinical Laboratories, and Max Healthcare indicates a progressive escalation in metabolic markers over an 11-month period. Fasting blood glucose increased from 104 mg/dL to 138 mg/dL, accompanied by an elevation in HbA1c from 5.9% to 7.1%, which meets ADA criteria for newly diagnosed Type 2 Diabetes Mellitus. Lipid screening reveals borderline hypertriglyceridemia (165 mg/dL), while renal function (Serum Creatinine 0.95 mg/dL) remains stable.',
    trendsHeading: 'Identified Longitudinal Biomarker Trends',
    trendNotes: [
      'Fasting Blood Glucose: Steadily elevated (+32.7% trajectory from 104 mg/dL to 138 mg/dL across Fortis, Max, and Apollo reports).',
      'HbA1c Glycemic Control: Escalated from pre-diabetic baseline (5.9%) to overt clinical threshold (7.1%).',
      'Renal Filtration Markers: Serum creatinine remained within optimal physiological limits (0.92 to 0.95 mg/dL).',
      'Lipid Profile: Borderline elevated triglycerides (165 mg/dL) warranting dietary review alongside metformin therapy.',
    ],
    disclaimer:
      'Clinician Consultation Notice: This AI synthesis reflects consolidated data extracted from patient-provided hospital documents. Flags cite established ADA/WHO medical guidelines but do not replace certified medical consultation or diagnosis.',
  },
  hi: {
    title: 'एआई समेकित नैदानिक स्वास्थ्य सारांश (Clinical Summary)',
    subtitle: 'विभिन्न अस्पतालों का बहु-मासिक विश्लेषण · DPDP अधिनियम 2023 के तहत सुरक्षित',
    overviewHeading: 'समेकित स्वास्थ्य रिकॉर्ड अवलोकन',
    overviewText:
      'अपोलो हॉस्पिटल्स, फोर्टिस लैब्स और मैक्स हेल्थकेयर के मेडिकल रिकॉर्ड्स के विश्लेषण से पता चलता है कि पिछले 11 महीनों में रक्त शर्करा (Fasting Blood Glucose) 104 mg/dL से बढ़कर 138 mg/dL हो गई है, और HbA1c 5.9% से बढ़कर 7.1% पर पहुंच गया है। यह ADA दिशानिर्देशों के तहत टाइप 2 डायबिटीज मेलिटस की पुष्टि करता है। सीरम क्रिएटिनिन (0.95 mg/dL) सामान्य है, जबकि ट्राइग्लिसराइड्स (165 mg/dL) हल्के बढ़े हुए हैं।',
    trendsHeading: 'पहचाने गए बायोमार्कर रुझान (Biomarker Trends)',
    trendNotes: [
      'फास्टिंग ब्लड ग्लूकोज: फोर्टिस, मैक्स और अपोलो की रिपोर्टों में 104 से बढ़कर 138 mg/dL (+32.7% की निरंतर वृद्धि)।',
      'HbA1c स्तर: प्री-डायबिटिक रेंज (5.9%) से बढ़कर नैदानिक स्तर (7.1%) पर पहुंच गया है।',
      'गुर्दे की कार्यक्षमता (Renal Health): सीरम क्रिएटिनिन (0.95 mg/dL) पूरी तरह से सामान्य सीमा में है।',
      'लिपिड प्रोफाइल: ट्राइग्लिसराइड्स (165 mg/dL) सामान्य से थोड़े अधिक हैं, जिसके लिए मेटफॉर्मिन के साथ आहार नियंत्रण आवश्यक है।',
    ],
    disclaimer:
      'चिकित्सकीय परामर्श सूचना: यह एआई सारांश विभिन्न अस्पतालों से प्राप्त दस्तावेजों के डेटा पर आधारित है। यह किसी डॉक्टर के प्रत्यक्ष परामर्श या निदान का विकल्प नहीं है।',
  },
  te: {
    title: 'AI ఏకీకృత క్లినికల్ ఆరోగ్య సారాంశం',
    subtitle: 'బహుళ ఆసుపత్రుల రికార్డుల విశ్లేషణ · DPDP చట్టం ద్వారా ధృవీకరించబడింది',
    overviewHeading: 'సమగ్ర ఆరోగ్య రికార్డుల సమీక్ష',
    overviewText:
      'అపోలో హాస్పిటల్స్, ఫోర్టిస్ మరియు మ్యాక్స్ హెల్త్‌కేర్ ల్యాబ్ రికార్డుల ఆధారంగా, గత 11 నెలల్లో రక్తంలో గ్లూకోజ్ (Fasting Blood Glucose) 104 mg/dL నుండి 138 mg/dL కు పెరిగింది. HbA1c 5.9% నుండి 7.1% కు చేరింది. ఇది ADA నిబంధనల ప్రకారం టైప్ 2 డయాబెటిస్ ప్రారంభాన్ని సూచిస్తుంది. కిడ్నీ పనితీరు (క్రియాటినిన్ 0.95 mg/dL) సాధారణంగా ఉంది, ట్రైగ్లిజరైడ్స్ (165 mg/dL) కొద్దిగా పెరిగాయి.',
    trendsHeading: 'గుర్తించబడిన ఆరోగ్య మార్పులు (Trends)',
    trendNotes: [
      'ఫాస్టింగ్ బ్లడ్ షుగర్: ఫోర్టిస్, మ్యాక్స్ మరియు అపోలో నివేదికలలో 104 నుండి 138 mg/dL కు నిరంతరం పెరిగింది (+32.7%).',
      'HbA1c నియంత్రణ: ప్రి-డయాబెటిక్ పరిధి (5.9%) నుండి క్లినికల్ థ్రెషోల్డ్ (7.1%) కు చేరింది.',
      'కిడ్నీ పరీక్షలు: సీరమ్ క్రియాటినిన్ (0.95 mg/dL) సాధారణ పరిమితిలోనే కొనసాగుతోంది.',
      'లిపిడ్ ప్రొఫైల్: ట్రైగ్లిజరైడ్స్ (165 mg/dL) స్వల్పంగా పెరిగాయి, మెట్‌ఫార్మిన్ చికిత్సతో పాటు ఆహార మార్పులు అవసరం.',
    ],
    disclaimer:
      'వైద్యుని సంప్రదింపు నోటీసు: ఈ AI సారాంశం రోగి అందించిన ఆసుపత్రి నివేదికల ఆధారంగా రూపొందించబడింది. ఇది వైద్యుల నేరుగా ఇచ్చే సలహాకు ప్రత్యామ్నాయం కాదు.',
  },
};

export const AISummaryModal: React.FC<AISummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
  riskFlags,
  hasRecords = true,
  onOpenUpload,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('en');

  if (!isOpen) return null;

  const content = LOCALIZED_SUMMARIES[selectedLanguage];

  const handlePrint = () => {
    soundFX.playChime();
    window.print();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-card clinical-summary-print-container"
        style={{ maxWidth: '820px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #7B73F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <div className="modal-title">{content.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {content.subtitle} · Generated {new Date(summary.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Regional Language Switcher (PRD Stretch Feature #1) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F1F5F9',
                padding: '3px',
                borderRadius: '8px',
                gap: '2px',
              }}
            >
              <Globe2 size={13} color="#64748B" style={{ marginLeft: '4px', marginRight: '2px' }} />
              {(
                [
                  { id: 'en', label: 'EN' },
                  { id: 'hi', label: 'हिन्दी' },
                  { id: 'te', label: 'తెలుగు' },
                ] as const
              ).map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    soundFX.playClick();
                    setSelectedLanguage(lang.id);
                  }}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: selectedLanguage === lang.id ? '#FFFFFF' : 'transparent',
                    color: selectedLanguage === lang.id ? '#4F46E5' : '#64748B',
                    boxShadow: selectedLanguage === lang.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <button className="btn-close-modal" onClick={onClose} aria-label="Close dialog">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!hasRecords ? (
            <div style={{ padding: '48px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.12)', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={28} />
              </div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>
                No Health Records Found
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', maxWidth: '440px', lineHeight: 1.5, margin: 0 }}>
                MediVault AI requires at least one digitized prescription, lab report, or vaccination card to synthesize clinical trends, identify therapeutic overlaps, and evaluate threshold risk flags.
              </p>
              {onOpenUpload && (
                <button
                  className="btn-primary"
                  onClick={() => {
                    onClose();
                    onOpenUpload();
                  }}
                  style={{ marginTop: '6px', padding: '9px 20px', fontSize: '13px' }}
                >
                  Upload First Health Document
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Patient Clinical Header Banner (Visible in Print View as well) */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  backgroundColor: '#FAFBFD',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={16} color="#4F46E5" />
              <div>
                <span style={{ fontWeight: 800, color: '#1E293B', fontSize: '13.5px' }}>
                  {currentUser.name}
                </span>
                <span style={{ color: '#64748B', fontSize: '12px', marginLeft: '6px' }}>
                  (UHID: {currentUser.userId}) · DOB: {currentUser.dateOfBirth}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#475569' }}>
              <span>
                <strong>Hospitals:</strong> Apollo, Fortis, Max
              </span>
              <span style={{ color: '#10B981', fontWeight: 600 }}>DPDP Verified</span>
            </div>
          </div>

          {/* Main Plain-Language Synthesis Card */}
          <div
            style={{
              padding: '20px',
              borderRadius: '14px',
              backgroundColor: '#F8FAFF',
              border: '1px solid #E2E8F8',
              lineHeight: 1.6,
              fontSize: '13.5px',
              color: '#1E293B',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#4338CA',
                fontWeight: 700,
                marginBottom: '10px',
                fontSize: '13px',
              }}
            >
              <Heart size={16} />
              <span>{content.overviewHeading}</span>
            </div>
            {content.overviewText}
          </div>

          {/* Longitudinal Biomarker Trends */}
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <TrendingUp size={16} color="#DC2626" />
              <span>{content.trendsHeading}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {content.trendNotes.map((note, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: index === 0 ? '#FEF2F2' : '#FFFFFF',
                    border: index === 0 ? '1px solid #FECACA' : '1px solid #E5EAF3',
                    fontSize: '13px',
                    color: index === 0 ? '#991B1B' : 'var(--text-primary)',
                  }}
                >
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: index === 0 ? '#DC2626' : '#6366F1',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {index + 1}
                  </span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Risk Flags Cited */}
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <AlertTriangle size={16} color="#D97706" />
              <span>Active Reference Range Risk Flags ({riskFlags.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {riskFlags.map((flag) => (
                <div
                  key={flag.flagId}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: flag.severity === 'high' ? '#FEF2F2' : '#FFFBEB',
                    border: flag.severity === 'high' ? '1px solid #FECACA' : '1px solid #FDE68A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: flag.severity === 'high' ? '#B91C1C' : '#92400E',
                      }}
                    >
                      {flag.thresholdDescription}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }}>
                      Citing published clinical guideline: {flag.ruleTriggered.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      backgroundColor: flag.severity === 'high' ? '#EF4444' : '#F59E0B',
                      color: '#FFFFFF',
                    }}
                  >
                    {flag.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              fontSize: '12px',
              color: '#1E40AF',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={20} color="#2563EB" style={{ flexShrink: 0 }} />
            <div>{content.disclaimer}</div>
          </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handlePrint} title="Print or save as PDF for doctor consultation">
            <Printer size={15} style={{ display: 'inline', marginRight: '6px' }} />
            Export Doctor Visit PDF
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

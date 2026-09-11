import React from 'react';
import {
  LayoutDashboard,
  Activity,
  FileText,
  Pill,
  ShieldCheck,
  Sparkles,
  Syringe,
  Settings,
  HelpCircle,
  Stethoscope,
  UserCheck,
  CreditCard,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenConsent: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenConsent }) => {
  const navItems = [
    { id: 'timeline', label: 'Timeline Dashboard', icon: LayoutDashboard },
    { id: 'trends', label: 'Biomarker Trends', icon: Activity },
    { id: 'labs', label: 'Lab Reports', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
    { id: 'consultations', label: 'Doctor Consultations', icon: Stethoscope },
    { id: 'doctor-portal', label: 'Doctor Review Portal', icon: UserCheck },
    { id: 'pricing', label: 'Plans & Billing', icon: CreditCard },
    { id: 'summary', label: 'AI Health Summary', icon: Sparkles },
  ];

  return (
    <aside className="app-sidebar" aria-label="Main Navigation">
      {/* Brand Emblem - Health cross matching Dribbble snowflake mark */}
      <div 
        className="sidebar-logo" 
        title="MediVault-AI"
        onClick={() => setActiveTab('timeline')}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="3" x2="12" y2="21"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <circle cx="12" cy="12" r="3" fill="#F5A623" stroke="none"></circle>
        </svg>
      </div>

      {/* Nav List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
              title={item.label}
              aria-label={item.label}
            >
              <div className="nav-item-icon-wrapper">
                <Icon size={20} />
              </div>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-bottom">
        <button
          className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
          title="Settings"
          aria-label="Settings"
        >
          <div className="nav-item-icon-wrapper">
            <Settings size={20} />
          </div>
        </button>

        <button
          className="nav-item"
          onClick={onOpenConsent}
          title="DPDP Act Privacy & Consent"
          aria-label="DPDP Act Privacy & Consent"
        >
          <div className="nav-item-icon-wrapper">
            <ShieldCheck size={20} color="#34D399" />
          </div>
        </button>

        <button
          className="nav-item"
          onClick={() => alert('MediVault-AI v1.0 (Hackathon DVPS24 Build)\n\n• Multi-hospital OCR consolidation\n• Rule-based ADA/WHO risk flags\n• DPDP Act compliant consent\n• Longitudinal trend detection')}
          title="About & Help"
          aria-label="About & Help"
        >
          <div className="nav-item-icon-wrapper">
            <HelpCircle size={19} />
          </div>
        </button>
      </div>
    </aside>
  );
};

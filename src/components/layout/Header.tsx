import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Search, Bell, ShieldCheck, Plus, User as UserIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, filter, setFilter } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between shadow-clinical-sm">
      {/* Mobile Title / Desktop Search */}
      <div className="flex items-center space-x-4 flex-1">
        <div className="hidden md:flex items-center relative w-full max-w-md">
          <Search size={18} className="absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search lab tests, medicines, vaccines, doctors..."
            value={filter.searchQuery}
            onChange={(e) => {
              setFilter(prev => ({ ...prev, searchQuery: e.target.value }));
              if (window.location.pathname !== '/app/timeline') {
                navigate('/app/timeline');
              }
            }}
            className="w-full h-10 bg-slate-100/90 text-xs rounded-lg pl-10 pr-4 text-slate-900 placeholder:text-slate-500 border border-transparent hover:border-slate-300 focus:bg-white focus:border-brand-900 focus:outline-none transition-all"
          />
        </div>

        {/* Mobile Header Title */}
        <div className="flex md:hidden items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-brand-900 text-white flex items-center justify-center font-bold text-sm shadow-clinical-sm">
            HV
          </div>
          <span className="font-extrabold text-base tracking-tight text-brand-900">HealthVault</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Compliance Pill */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-trust-50 border border-trust-200 text-trust-700 text-[11px] font-semibold">
          <ShieldCheck size={14} className="text-trust-600" />
          <span>DPDP Act &amp; ABDM Compliant</span>
        </div>

        {/* Add Record CTA on Desktop */}
        <button
          onClick={() => navigate('/app/upload')}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-brand-900 text-white text-xs font-semibold hover:bg-brand-800 shadow-clinical-sm transition-all active:scale-95"
        >
          <Plus size={16} />
          <span>Add Record</span>
        </button>

        {/* Notification Bell */}
        <button 
          onClick={() => navigate('/app/summary')}
          className="relative p-2 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-lg transition-colors"
          title="Health Insights & Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

        {/* User Profile Avatar Link */}
        <button
          onClick={() => navigate('/app/profile')}
          className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
          title="Patient Profile"
        >
          <div className="w-8 h-8 rounded-full bg-brand-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-200">
            {user?.name ? user.name.charAt(0) : <UserIcon size={16} />}
          </div>
          <span className="hidden md:inline text-xs font-semibold text-slate-800">
            {user?.name ? user.name.split(' ')[0] : 'Patient'}
          </span>
        </button>
      </div>
    </header>
  );
};

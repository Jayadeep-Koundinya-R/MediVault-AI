import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Header } from './Header';
import { ToastContainer } from '../common/Toast';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { 
  Home, 
  Clock, 
  Sparkles, 
  User, 
  Plus, 
  FileText, 
  Activity, 
  ShieldAlert, 
  Settings, 
  LogOut,
  Shield,
  Syringe,
  Users,
  Stethoscope,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { user, logout, flags } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const unacknowledgedFlags = flags.filter(f => !f.acknowledged).length;

  const desktopNavLinks = [
    { to: '/app/home', label: 'Home', icon: <Home size={19} /> },
    { to: '/app/timeline', label: 'Timeline', icon: <Clock size={19} /> },
    { 
      to: '/app/summary', 
      label: 'Health Insights', 
      icon: <Sparkles size={19} />, 
      badge: unacknowledgedFlags > 0 ? unacknowledgedFlags : undefined 
    },
    { to: '/app/prescriptions', label: 'Prescriptions', icon: <FileText size={19} /> },
    { to: '/app/labs', label: 'Lab Reports', icon: <Activity size={19} /> },
    { to: '/app/vaccinations', label: 'Vaccinations', icon: <Syringe size={19} /> },
    { to: '/app/family', label: 'Family Health', icon: <Users size={19} /> },
    { to: '/app/doctors', label: 'Trusted Doctors', icon: <Stethoscope size={19} /> },
    { to: '/app/messages', label: 'Messages & Chat', icon: <MessageSquare size={19} /> }
  ];

  return (
    <div className="min-h-screen bg-clinical-canvas flex flex-col md:flex-row">
      {/* ===================================================================
          DESKTOP SIDEBAR
          =================================================================== */}
      <aside className="hidden md:flex w-64 flex-col justify-between bg-white border-r border-slate-200/90 p-5 shadow-clinical-sm fixed top-0 bottom-0 z-40 overflow-y-auto">
        <div>
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 px-2 mb-8 cursor-pointer" onClick={() => navigate('/app/home')}>
            <div className="w-10 h-10 rounded-xl bg-brand-900 text-white flex items-center justify-center shadow-clinical-sm">
              <Shield size={22} className="text-cyan-300" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-brand-900 leading-tight">MediVault</h1>
              <span className="text-[10px] text-slate-500 font-medium block">Digital Health Record</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {desktopNavLinks.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-900 text-white shadow-clinical-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-cyan-300' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isActive ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-800'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Cluster */}
        <div className="pt-4 border-t border-slate-100 space-y-1">
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'bg-slate-100 text-brand-900' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <User size={18} className="text-slate-400" />
            <span>Patient Profile</span>
          </NavLink>

          <NavLink
            to="/app/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive ? 'bg-slate-100 text-brand-900' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Settings size={18} className="text-slate-400" />
            <span>Settings &amp; Demo</span>
          </NavLink>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left"
          >
            <LogOut size={18} />
            <span>Log Out</span>
          </button>

          {/* User ABHA status pill */}
          <div className="p-2.5 mt-2 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px] text-slate-500">
            <span className="block font-medium text-slate-700 truncate">{user?.name}</span>
            <span className="text-[10px] font-mono text-slate-400">ABHA: {user?.abhaId || 'Linked'}</span>
          </div>
        </div>
      </aside>

      {/* ===================================================================
          MAIN VIEWPORT (Header + Content Outlet + Mobile Bottom Navigation)
          =================================================================== */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 pb-24 md:pb-12 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* ===================================================================
            MOBILE BOTTOM NAVIGATION DOCK WITH FLOATING '+' BUTTON
            =================================================================== */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 flex items-center justify-around z-40 shadow-clinical-lg">
          <NavLink
            to="/app/home"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Home size={19} />
            <span className="mt-0.5">Home</span>
          </NavLink>

          <NavLink
            to="/app/doctors"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Stethoscope size={19} />
            <span className="mt-0.5">Doctors</span>
          </NavLink>

          {/* Elevated Floating Upload Action Button */}
          <div className="relative -top-4">
            <button
              onClick={() => navigate('/app/upload')}
              className="w-11 h-11 rounded-full bg-brand-900 text-white flex items-center justify-center shadow-clinical-lg border-4 border-clinical-canvas hover:scale-105 active:scale-95 transition-all"
              title="Add New Health Record"
            >
              <Plus size={22} />
            </button>
          </div>

          <NavLink
            to="/app/family"
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-12 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <Users size={19} />
            <span className="mt-0.5">Family</span>
          </NavLink>

          <NavLink
            to="/app/messages"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-12 py-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-brand-900 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            <MessageSquare size={19} />
            <span className="mt-0.5">Chat</span>
          </NavLink>
        </nav>
      </div>

      {/* Global Toast System */}
      <ToastContainer />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          logout();
          navigate('/login');
        }}
        title="Log out of MediVault?"
        message="Are you sure you want to end your current session? You can sign back in anytime."
        confirmText="Log Out"
        isDestructive={true}
      />
    </div>
  );
};

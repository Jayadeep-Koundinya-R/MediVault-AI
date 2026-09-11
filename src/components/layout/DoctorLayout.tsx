import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { doctorService } from '../../services/doctorService';
import { DoctorProfile } from '../../types';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  User as UserIcon, 
  LogOut, 
  Stethoscope, 
  ShieldCheck, 
  Clock, 
  Bell,
  CheckCircle2
} from 'lucide-react';

export const DoctorLayout: React.FC = () => {
  const { user, logout, unreadNotificationsCount } = useApp();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchProfile = async () => {
    try {
      const p = await doctorService.getDoctorProfile();
      setProfile(p);
    } catch (e) {
      console.warn('Doctor profile load note:', e);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleDevVerify = async () => {
    setIsVerifying(true);
    try {
      await doctorService.verifyDoctor();
      await fetchProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerified = profile?.verificationStatus === 'verified';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-slate-900 text-slate-300 flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
        <div>
          {/* Logo & Clinical Brand */}
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-clinical-sm">
                <Stethoscope size={22} />
              </div>
              <div>
                <h1 className="font-display font-extrabold text-lg text-white leading-none">MediVault</h1>
                <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">Clinical Doctor Portal</span>
              </div>
            </div>

            {/* Doctor info snippet */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <p className="text-xs font-bold text-white truncate">
                {profile?.fullName || user?.name || 'Dr. Physician'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {profile?.specialization || 'General Medicine'} · {profile?.clinicName || 'Clinic'}
              </p>

              <div className="mt-2 flex items-center justify-between">
                {isVerified ? (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>Verified Doctor ✓</span>
                  </span>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-400 text-[10px] font-semibold">
                      <Clock size={11} className="text-amber-400" />
                      <span>Verification Pending</span>
                    </span>
                    <button
                      onClick={handleDevVerify}
                      disabled={isVerifying}
                      title="Simulate credential verification for hackathon evaluation"
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 underline font-bold"
                    >
                      {isVerifying ? '...' : 'Verify'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 text-sm font-medium">
            <NavLink
              to="/doctor/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-clinical-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/doctor/patients"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-clinical-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Users size={18} />
              <span>Patients</span>
            </NavLink>

            <NavLink
              to="/doctor/reports"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-clinical-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <FileText size={18} />
              <span>Reports &amp; Reviews</span>
            </NavLink>

            <NavLink
              to="/doctor/messages"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-clinical-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <MessageSquare size={18} />
                <span>Messages</span>
              </div>
            </NavLink>

            <NavLink
              to="/doctor/profile"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-cyan-600 text-white font-semibold shadow-clinical-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <UserIcon size={18} />
              <span>Doctor Profile</span>
            </NavLink>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center space-x-3 w-full px-3.5 py-2.5 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 text-sm font-semibold transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Mobile & Tablet */}
        <header className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 flex items-center justify-between md:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center">
              <Stethoscope size={18} className="text-white" />
            </div>
            <span className="font-extrabold text-sm text-white">MediVault Doctor</span>
          </div>

          <div className="flex items-center space-x-3">
            {isVerified ? (
              <span className="text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                Verified ✓
              </span>
            ) : (
              <span className="text-[10px] bg-amber-950 border border-amber-500/40 text-amber-400 font-bold px-2 py-0.5 rounded-full">
                Pending
              </span>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-slate-400 hover:text-white text-xs"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Verification Alert Banner if Pending */}
        {!isVerified && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock size={15} className="text-amber-600 shrink-0" />
              <span>
                <strong>Verification Pending:</strong> Your doctor account is awaiting administrative review. Connected patients can see your profile once verified.
              </span>
            </div>
            <button
              onClick={handleDevVerify}
              disabled={isVerifying}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0"
            >
              {isVerifying ? 'Verifying...' : 'One-Click Verify (Demo)'}
            </button>
          </div>
        )}

        {/* Outlet for Doctor Sub-Pages */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 grid grid-cols-5 text-center text-[10px] font-medium py-2 px-1">
          <NavLink
            to="/doctor/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`
            }
          >
            <LayoutDashboard size={18} />
            <span className="mt-1">Dashboard</span>
          </NavLink>

          <NavLink
            to="/doctor/patients"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`
            }
          >
            <Users size={18} />
            <span className="mt-1">Patients</span>
          </NavLink>

          <NavLink
            to="/doctor/reports"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`
            }
          >
            <FileText size={18} />
            <span className="mt-1">Reports</span>
          </NavLink>

          <NavLink
            to="/doctor/messages"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`
            }
          >
            <MessageSquare size={18} />
            <span className="mt-1">Messages</span>
          </NavLink>

          <NavLink
            to="/doctor/profile"
            className={({ isActive }) =>
              `flex flex-col items-center py-1 ${isActive ? 'text-cyan-400 font-bold' : 'text-slate-400'}`
            }
          >
            <UserIcon size={18} />
            <span className="mt-1">Profile</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notificationService';
import { NotificationItem } from '../../types';
import { 
  Search, 
  Bell, 
  ShieldCheck, 
  Plus, 
  User as UserIcon, 
  CheckCheck, 
  Sparkles, 
  MessageSquare, 
  Stethoscope, 
  Users, 
  Clock 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { user, filter, setFilter, unreadNotificationsCount, refreshNotifications } = useApp();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const handleToggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      setIsLoading(true);
      try {
        const res = await notificationService.getNotifications();
        setNotifications(res.notifications || []);
      } catch (err) {
        console.warn('Failed to load notifications:', err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (!notif.read) {
        await notificationService.markAsRead(notif.id);
        refreshNotifications();
      }
    } catch {
      // Best effort
    }
    setShowNotifications(false);

    // Route based on type
    if (notif.type === 'doctor_review') {
      navigate('/app/summary');
    } else if (notif.type === 'new_message') {
      navigate(user?.accountType === 'doctor' ? '/doctor/messages' : '/app/messages');
    } else if (notif.type === 'doctor_request' || notif.type === 'doctor_request_accepted' || notif.type === 'doctor_request_declined') {
      navigate(user?.accountType === 'doctor' ? '/doctor/patients' : '/app/doctors');
    } else if (notif.type === 'family_request' || notif.type === 'family_request_accepted') {
      navigate('/app/family');
    } else {
      navigate('/app/home');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAsRead(undefined, true);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshNotifications();
    } catch (err) {
      console.warn('Failed to mark all as read:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'doctor_review':
        return <Sparkles size={16} className="text-amber-500 shrink-0" />;
      case 'new_message':
        return <MessageSquare size={16} className="text-blue-500 shrink-0" />;
      case 'doctor_request':
      case 'doctor_request_accepted':
      case 'doctor_request_declined':
        return <Stethoscope size={16} className="text-teal-600 shrink-0" />;
      case 'family_request':
      case 'family_request_accepted':
        return <Users size={16} className="text-indigo-600 shrink-0" />;
      default:
        return <Clock size={16} className="text-slate-400 shrink-0" />;
    }
  };

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

        {/* Notification Bell & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleToggleNotifications}
            className="relative p-2 text-slate-500 hover:text-brand-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
            title="Notifications &amp; Activity"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Interactive Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-clinical-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                      {unreadNotificationsCount} new
                    </span>
                  )}
                </div>
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={handleMarkAllRead}
                    className="flex items-center space-x-1 text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    <CheckCheck size={14} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {isLoading ? (
                  <div className="py-8 text-center text-xs text-slate-400">Loading notifications...</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs font-semibold text-slate-600">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">We'll alert you of doctor reviews and messages here.</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                        !notif.read ? 'bg-sky-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs ${!notif.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0 ml-2"></span>
                          )}
                        </div>
                        {notif.body && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                            {notif.body}
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(notif.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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

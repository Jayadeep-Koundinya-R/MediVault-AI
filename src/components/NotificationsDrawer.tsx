import React, { useState } from 'react';
import {
  X,
  Bell,
  Calendar,
  AlertTriangle,
  Pill,
  Syringe,
  Clock,
  MessageSquare,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AppNotification, NotificationType } from '../types';
import { soundFX } from '../utils/audioEffects';
import { showToast } from '../components/Toast';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'reminders'>('all');

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'reminders') return n.type === 'medicine_reminder' || n.type === 'vaccine_due' || n.type === 'follow_up';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'follow_up':
        return <Calendar size={16} color="#4F46E5" />;
      case 'risk_flag':
        return <AlertTriangle size={16} color="#DC2626" />;
      case 'medicine_reminder':
        return <Pill size={16} color="#059669" />;
      case 'vaccine_due':
        return <Syringe size={16} color="#D97706" />;
      case 'inactivity':
        return <Clock size={16} color="#6366F1" />;
      case 'doctor_message':
        return <MessageSquare size={16} color="#7B73F6" />;
      default:
        return <Bell size={16} color="#4B5563" />;
    }
  };

  const getNotificationBg = (type: NotificationType) => {
    switch (type) {
      case 'follow_up':
        return '#EEF2FF';
      case 'risk_flag':
        return '#FEE2E2';
      case 'medicine_reminder':
        return '#ECFDF5';
      case 'vaccine_due':
        return '#FEF3C7';
      case 'inactivity':
        return '#F1F5F9';
      case 'doctor_message':
        return '#F5F3FF';
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s ease',
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EEF2FF',
                color: '#4F46E5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B' }}>
                Care Notifications
              </div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                {unreadCount > 0 ? `${unreadCount} unread checkup & medicine alerts` : 'All alerts up to date'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Filter Pills & Mark All Read */}
        <div
          style={{
            padding: '12px 24px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FAFBFD',
          }}
        >
          <div style={{ display: 'flex', gap: '6px' }}>
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'unread', label: `Unread (${unreadCount})` },
                { id: 'reminders', label: 'Reminders' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: activeFilter === tab.id ? '#4F46E5' : 'transparent',
                  color: activeFilter === tab.id ? '#FFFFFF' : '#64748B',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => {
                soundFX.playClick();
                onMarkAllAsRead();
                showToast('info', 'All Marked Read');
              }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#4F46E5',
                cursor: 'pointer',
              }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredNotifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94A3B8' }}>
              <CheckCircle2 size={40} color="#CBD5E1" style={{ margin: '0 auto 10px' }} />
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>No Notifications</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>You are completely caught up with health reminders.</div>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.notificationId}
                onClick={() => {
                  soundFX.playClick();
                  onSelectNotification(notif);
                  onClose();
                }}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: notif.read ? '#FFFFFF' : '#F8FAFC',
                  border: notif.read ? '1px solid #E2E8F0' : '1.5px solid #4F46E5',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  transition: 'all 0.15s ease',
                  boxShadow: notif.read ? 'none' : '0 2px 8px rgba(79, 70, 229, 0.08)',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    backgroundColor: getNotificationBg(notif.type),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getNotificationIcon(notif.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>
                      {notif.title}
                    </div>
                    {!notif.read && (
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#4F46E5',
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px', lineHeight: 1.4 }}>
                    {notif.body}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: '8px',
                      fontSize: '11px',
                      color: '#94A3B8',
                    }}
                  >
                    <span>
                      {new Date(notif.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </span>
                    <span style={{ color: '#4F46E5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px' }}>
                      View Details <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer Notice */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#FAFBFD',
            fontSize: '11.5px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={14} color="#7B73F6" />
          <span>Reminders dynamically generated from validated doctor care plans.</span>
        </div>
      </div>
    </div>
  );
};

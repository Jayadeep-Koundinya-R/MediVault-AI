import { NotificationItem } from '../types';
import { authService } from './authService';

export const notificationService = {
  async getNotifications(): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/notifications', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch notifications');
    }
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  },

  async markAsRead(notificationId?: string, markAllRead?: boolean): Promise<void> {
    const token = await authService.getSessionToken();
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ notificationId, markAllRead }),
    }).catch((e) => console.warn('Mark notification read note:', e));
  },
};

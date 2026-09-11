import { Conversation, Message } from '../types';
import { authService } from './authService';
import { supabase } from '../lib/supabase/client';

export const chatService = {
  async getConversations(): Promise<Conversation[]> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/conversations', {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch conversations');
    }
    return data.conversations || [];
  },

  async getOrCreateConversation(params: { doctorId?: string; patientId?: string }): Promise<Conversation> {
    const token = await authService.getSessionToken();
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to start conversation');
    }
    return data.conversation;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch messages');
    }
    return data.messages || [];
  },

  async sendMessage(params: { conversationId: string; messageText: string; sharedSummaryId?: string }): Promise<Message> {
    const token = await authService.getSessionToken();
    const res = await fetch(`/api/conversations/${params.conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messageText: params.messageText,
        sharedSummaryId: params.sharedSummaryId,
      }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send message');
    }
    return data.message;
  },

  async markAsRead(conversationId: string): Promise<void> {
    const token = await authService.getSessionToken();
    await fetch(`/api/conversations/${conversationId}/read`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }).catch((e) => console.warn('Mark read note:', e));
  },

  /**
   * Realtime message subscription with resilient fallback polling
   */
  subscribeToMessages(conversationId: string, onNewMessage: (msg: Message) => void): () => void {
    let channel: any = null;
    let pollTimer: any = null;
    let lastKnownMessageId: string | null = null;

    try {
      channel = supabase
        .channel(`chat_${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          (payload) => {
            const raw = payload.new;
            if (raw && raw.id !== lastKnownMessageId) {
              lastKnownMessageId = raw.id;
              onNewMessage({
                id: raw.id,
                conversationId: raw.conversation_id,
                senderId: raw.sender_id,
                messageText: raw.message_text,
                sharedSummaryId: raw.shared_summary_id,
                readAt: raw.read_at,
                createdAt: raw.created_at,
              });
            }
          }
        )
        .subscribe();
    } catch (e) {
      console.warn('Realtime subscription fallback note:', e);
    }

    // Secondary resilient polling every 3.5 seconds
    pollTimer = setInterval(async () => {
      try {
        const msgs = await this.getMessages(conversationId);
        if (msgs.length > 0) {
          const latest = msgs[msgs.length - 1];
          if (lastKnownMessageId && latest.id !== lastKnownMessageId) {
            lastKnownMessageId = latest.id;
            onNewMessage(latest);
          } else if (!lastKnownMessageId) {
            lastKnownMessageId = latest.id;
          }
        }
      } catch {
        // Silently ignore transient fetch errors
      }
    }, 3500);

    return () => {
      if (channel) {
        supabase.removeChannel(channel).catch(() => {});
      }
      if (pollTimer) {
        clearInterval(pollTimer);
      }
    };
  },
};

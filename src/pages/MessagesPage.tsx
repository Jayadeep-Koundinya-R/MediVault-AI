import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chatService';
import { Conversation, Message } from '../types';
import { 
  MessageSquare, 
  Send, 
  Stethoscope, 
  CheckCircle2, 
  FileText, 
  ShieldAlert, 
  Check, 
  CheckCheck,
  Share2,
  Sparkles
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user, summary, addToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    (location.state as any)?.conversationId || null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSharingSummary, setIsSharingSummary] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const convs = await chatService.getConversations();
      setConversations(convs);
      if (!activeConvId && convs.length > 0) {
        setActiveConvId(convs[0].id);
      }
    } catch (e) {
      console.warn('Load conversations note:', e);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const msgs = await chatService.getMessages(convId);
      setMessages(msgs);
      await chatService.markAsRead(convId);
      setTimeout(scrollToBottom, 100);
    } catch (e) {
      console.warn('Load messages note:', e);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
      const unsubscribe = chatService.subscribeToMessages(activeConvId, (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 100);
      });
      return () => unsubscribe();
    }
  }, [activeConvId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const sent = await chatService.sendMessage({
        conversationId: activeConvId,
        messageText: text,
      });
      setMessages((prev) => [...prev, sent]);
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      addToast(err?.message || 'Failed to send message', 'error');
      setInputText(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleShareLatestSummary = async () => {
    if (!activeConvId || !summary?.id) {
      addToast('No AI health summary available to share.', 'warning');
      return;
    }

    setIsSharingSummary(true);
    try {
      const sent = await chatService.sendMessage({
        conversationId: activeConvId,
        messageText: 'I have shared my latest AI Health Summary for your clinical review.',
        sharedSummaryId: summary.id,
      });
      setMessages((prev) => [...prev, sent]);
      addToast('Latest health summary shared with doctor');
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      addToast(err?.message || 'Failed to share summary', 'error');
    } finally {
      setIsSharingSummary(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col sm:flex-row bg-white rounded-3xl border border-slate-200/90 shadow-clinical overflow-hidden">
      {/* Left Sidebar: Doctors/Conversations */}
      <div className={`w-full sm:w-80 border-r border-slate-200 flex flex-col ${activeConvId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <h2 className="font-display font-extrabold text-base text-slate-900">
            Messages
          </h2>
          <span className="text-[11px] text-slate-500">
            Chat with your trusted doctors
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-400">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs font-semibold">No active conversations yet.</p>
              <button
                onClick={() => navigate('/app/doctors')}
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-cyan-600 text-white font-bold text-[11px] hover:bg-cyan-700 transition-colors"
              >
                Go to Trusted Doctors
              </button>
            </div>
          ) : (
            conversations.map((conv) => {
              const isSelected = conv.id === activeConvId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-4 transition-colors flex items-start space-x-3 ${
                    isSelected ? 'bg-cyan-50/80 border-l-4 border-cyan-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center shrink-0">
                    <Stethoscope size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate">
                        {conv.partnerName}
                      </h4>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-cyan-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-cyan-700 font-medium truncate">
                      {conv.partnerRole || 'Physician'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {conv.lastMessage?.messageText || 'Start conversation...'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat */}
      <div className={`flex-1 flex flex-col bg-slate-50/40 ${!activeConvId ? 'hidden sm:flex' : 'flex'}`}>
        {activeConv ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveConvId(null)}
                  className="sm:hidden text-xs text-slate-500 font-bold hover:text-slate-900"
                >
                  ← Back
                </button>
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-800 font-bold flex items-center justify-center">
                  <Stethoscope size={18} />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <h3 className="font-bold text-sm text-slate-900">
                      {activeConv.partnerName}
                    </h3>
                    <CheckCircle2 size={13} className="text-emerald-600" />
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {activeConv.partnerRole} · {activeConv.partnerClinic || 'Verified Physician'}
                  </span>
                </div>
              </div>

              {/* Share Latest Summary Action (Prompt Section 44) */}
              <button
                onClick={handleShareLatestSummary}
                disabled={isSharingSummary}
                className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-900 hover:bg-brand-100 text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-clinical-sm"
              >
                <Sparkles size={13} className="text-cyan-600" />
                <span>Share Latest Summary</span>
              </button>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <MessageSquare size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-semibold">Start your conversation with {activeConv.partnerName}.</p>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs">
                    You can discuss the health records you've shared through MediVault.
                  </p>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.senderId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      {/* Attached Health Summary Card */}
                      {m.sharedSummary && (
                        <div className="mb-1.5 max-w-sm rounded-2xl bg-white border border-brand-200 p-3.5 shadow-clinical-sm text-xs">
                          <div className="flex items-center space-x-1.5 font-bold text-brand-900 mb-1">
                            <FileText size={14} className="text-cyan-700" />
                            <span>Health Summary</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-2">
                            {m.sharedSummary.summaryText}
                          </p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-1.5">
                            <span>{m.sharedSummary.flagCount} flagged results</span>
                            <button
                              onClick={() => navigate('/app/summary')}
                              className="font-bold text-cyan-700 hover:underline"
                            >
                              View Summary →
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Text Bubble */}
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-brand-900 text-white rounded-br-none shadow-clinical-sm'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-none shadow-clinical-sm'
                        }`}
                      >
                        <p>{m.messageText}</p>
                        <div className={`text-[9px] mt-1 flex items-center justify-end space-x-1 ${
                          isUser ? 'text-slate-400' : 'text-slate-400'
                        }`}>
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isUser && (
                            <span>
                              {m.readAt ? <CheckCheck size={11} className="text-cyan-300" /> : <Check size={11} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Medical Chat Disclaimer (Prompt Section 43) */}
            <div className="px-4 py-1.5 bg-amber-50/90 border-t border-amber-200/70 text-[10px] text-amber-900 text-center flex items-center justify-center space-x-1.5">
              <ShieldAlert size={12} className="text-amber-700 shrink-0" />
              <span>
                MediVault chat is not an emergency service. For urgent medical concerns, contact appropriate emergency services.
              </span>
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message to your doctor..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <button
                type="submit"
                disabled={isSending || !inputText.trim()}
                className="p-2.5 rounded-xl bg-brand-900 hover:bg-brand-800 disabled:opacity-40 text-white transition-colors shrink-0 shadow-clinical-sm"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
            <MessageSquare size={36} className="opacity-20 mb-2" />
            <p className="text-xs font-semibold">Select a doctor to start or continue a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

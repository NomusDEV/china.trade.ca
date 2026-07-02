import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { usePresence, usePresenceList, getPresenceStatus } from '@/lib/usePresence';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, Bell, Check, CheckCheck } from 'lucide-react';

export default function ClientMessages() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
  const { setTyping } = usePresence();
  const presences = usePresenceList();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.Message.filter({ thread_user_id: user.id }, 'created_date');
      setMessages(msgs);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    if (user) loadMessages();
  }, [user]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;
    let unsubscribe = () => {};
    try {
      unsubscribe = base44.entities.Message.subscribe(() => { loadMessages(); });
    } catch (e) {}
    return () => unsubscribe();
  }, [user]);

  // Mark admin messages as read
  useEffect(() => {
    if (!messages.length) return;
    const unread = messages.filter(m => m.sender_role === 'admin' && !m.read);
    if (unread.length === 0) return;
    unread.forEach(async (msg) => {
      await base44.entities.Message.update(msg.id, { read: true });
    });
    loadMessages();
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    setTyping(user.id, false);
    try {
      await base44.entities.Message.create({
        thread_user_id: user.id,
        sender_id: user.id,
        sender_role: 'user',
        sender_name: user.full_name || user.email,
        sender_avatar: user.avatar || '',
        text: text.trim(),
        read: false,
      });
      setText('');
      loadMessages();
    } catch (e) {}
    setSending(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if (e.target.value.trim()) {
      setTyping(user.id, true);
    } else {
      setTyping(user.id, false);
    }
  };

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages.length]);

  const unreadCount = messages.filter(m => m.sender_role === 'admin' && !m.read).length;

  const adminPresence = presences.find(p => p.user_role === 'admin');
  const adminStatus = adminPresence ? getPresenceStatus(adminPresence.last_seen) : null;
  const adminTyping = adminPresence?.is_typing && adminPresence?.typing_thread_id === user?.id;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  const TypingDots = () => (
    <span className="flex gap-0.5 items-center">
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </span>
  );

  return (
    <div className={`p-6 rounded-2xl bg-white dark:bg-[#111111] border-2 transition-all ${
      unreadCount > 0
        ? 'border-[#E61D25] shadow-lg shadow-[#E61D25]/10 animate-[flash-red_2s_ease-in-out_infinite]'
        : 'border-black/5 dark:border-white/5'
    }`}>
      {/* Header with admin online status */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-black/5 dark:border-white/5">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[#C5A059]" />
          </div>
          {adminStatus?.online && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-[#111111]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {lang === 'ru' ? 'Поддержка' : 'Дастгирӣ'}
          </h3>
          {adminTyping ? (
            <p className="text-xs text-[#E61D25] flex items-center gap-1">
              {lang === 'ru' ? 'печатает' : 'менависад'} <TypingDots />
            </p>
          ) : adminStatus ? (
            <p className="text-xs flex items-center gap-1.5">
              {adminStatus.online ? (
                <><span className="w-2 h-2 bg-green-500 rounded-full" /><span className="text-green-500">{lang === 'ru' ? 'в сети' : 'онлайн'}</span></>
              ) : (
                <span className="text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                  {lang === 'ru' ? 'был в сети ' : 'онлайн буд: '}{adminStatus.text}
                </span>
              )}
            </p>
          ) : null}
        </div>
        {unreadCount > 0 && (
          <span className="min-w-[20px] h-5 px-1.5 bg-[#E61D25] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-96 overflow-y-auto mb-4 pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
            <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
              {lang === 'ru' ? 'Нет сообщений. Напишите нам, если у вас есть вопросы!' : 'Паём нест. Агар савол дошта бошед, ба мо нависед!'}
            </p>
          </div>
        ) : messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              msg.sender_role === 'user'
                ? 'bg-[#E61D25] text-white rounded-br-sm'
                : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A] dark:text-[#F9F9F9] rounded-bl-sm'
            }`}>
              <p className="text-sm leading-relaxed">{msg.text}</p>
              <div className="flex items-center gap-1 justify-end mt-0.5">
                <p className={`text-[10px] ${msg.sender_role === 'user' ? 'text-white/60' : 'text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30'}`}>
                  {new Date(msg.created_date).toLocaleString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
                {msg.sender_role === 'user' && (
                  msg.read
                    ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                    : <Check className="w-3.5 h-3.5 text-white/60" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder={lang === 'ru' ? 'Написать сообщение администратору...' : 'Ба администратор паём нависед...'}
          className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
        />
        <button type="submit" disabled={sending || !text.trim()} className="px-4 py-3 bg-[#E61D25] text-white rounded-xl text-sm disabled:opacity-50 flex items-center justify-center">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  );
}
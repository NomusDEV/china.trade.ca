import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Send, Loader2, MessageSquare, Bell } from 'lucide-react';

export default function ClientMessages() {
  const { lang, t } = useLanguage();
  const { user } = useAuth();
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

  // Mark admin messages as read
  useEffect(() => {
    if (!messages.length) return;
    const unread = messages.filter(m => m.sender_role === 'admin' && !m.read);
    unread.forEach(async (msg) => {
      await base44.entities.Message.update(msg.id, { read: true });
    });
    if (unread.length > 0) loadMessages();
  }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
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

  useEffect(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [messages.length]);

  const unreadCount = messages.filter(m => m.sender_role === 'admin' && !m.read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center relative">
          <MessageSquare className="w-5 h-5 text-[#C5A059]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-[#E61D25] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
          {lang === 'ru' ? 'Сообщения и уведомления' : 'Паёмҳо ва огоҳиномаҳо'}
        </h3>
      </div>

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
              <p className={`text-[10px] mt-1 ${msg.sender_role === 'user' ? 'text-white/60' : 'text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30'}`}>
                {new Date(msg.created_date).toLocaleString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={send} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
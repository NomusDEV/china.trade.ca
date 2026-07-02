import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Loader2, Inbox, Search, ArrowLeft } from 'lucide-react';

export default function MessageCenter() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [msgs, usrs] = await Promise.all([
        base44.entities.Message.list('-created_date'),
        base44.entities.User.list('-created_date'),
      ]);
      setMessages(msgs);
      setUsers(usrs);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Group messages by thread_user_id
  const threads = {};
  messages.forEach(m => {
    const tid = m.thread_user_id;
    if (!threads[tid]) {
      const user = users.find(u => u.id === tid);
      threads[tid] = {
        user_id: tid,
        user,
        messages: [],
        lastMessage: null,
        unread: 0,
      };
    }
    threads[tid].messages.push(m);
    if (!threads[tid].lastMessage || new Date(m.created_date) > new Date(threads[tid].lastMessage.created_date)) {
      threads[tid].lastMessage = m;
    }
    if (m.sender_role === 'user' && !m.read) threads[tid].unread++;
  });

  const threadList = Object.values(threads)
    .sort((a, b) => new Date(b.lastMessage?.created_date || 0) - new Date(a.lastMessage?.created_date || 0))
    .filter(t => {
      if (!search) return true;
      return t.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
             t.user?.email?.toLowerCase().includes(search.toLowerCase());
    });

  const totalUnread = Object.values(threads).reduce((s, t) => s + t.unread, 0);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedThread) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        thread_user_id: selectedThread.user_id,
        sender_id: 'admin',
        sender_role: 'admin',
        sender_name: lang === 'ru' ? 'Администратор' : 'Администратор',
        text: replyText.trim(),
        read: false,
      });
      setReplyText('');
      loadData();
    } catch (e) {}
    setSending(false);
  };

  const markThreadRead = async (thread) => {
    const unread = thread.messages.filter(m => m.sender_role === 'user' && !m.read);
    for (const msg of unread) {
      await base44.entities.Message.update(msg.id, { read: true });
    }
    if (unread.length > 0) loadData();
  };

  useEffect(() => {
    if (selectedThread) {
      markThreadRead(selectedThread);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [selectedThread?.user_id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  if (threadList.length === 0) {
    return (
      <div className="text-center py-16 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
        <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">{lang === 'ru' ? 'Нет сообщений' : 'Паём нест'}</p>
      </div>
    );
  }

  // Mobile: show either list or thread
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[600px]">
      {/* Thread list */}
      <div className={`lg:col-span-1 ${selectedThread ? 'hidden lg:block' : 'block'} space-y-2 overflow-y-auto pr-1`}>
        <div className="flex items-center gap-2 mb-3 px-1">
          <MessageSquare className="w-5 h-5 text-[#C5A059]" />
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{lang === 'ru' ? 'Диалоги' : 'Гуфтугӯҳо'}</h3>
          {totalUnread > 0 && <span className="ml-auto px-2 py-0.5 bg-[#E61D25] text-white text-[10px] font-bold rounded-full">{totalUnread}</span>}
        </div>
        {threadList.map((thread) => (
          <button
            key={thread.user_id}
            onClick={() => setSelectedThread(thread)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
              selectedThread?.user_id === thread.user_id
                ? 'bg-[#E61D25]/5 border-[#E61D25]/20'
                : 'bg-white dark:bg-[#111111] border-black/5 dark:border-white/5 hover:border-[#C5A059]/30'
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {thread.user?.avatar ? <img src={thread.user.avatar} alt="" className="w-full h-full object-cover" /> : (thread.user?.full_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{thread.user?.full_name || thread.user?.email || '—'}</p>
                {thread.unread > 0 && <span className="w-2 h-2 rounded-full bg-[#E61D25] flex-shrink-0" />}
              </div>
              <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 truncate">{thread.lastMessage?.text}</p>
              <p className="text-[10px] text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">
                {new Date(thread.lastMessage?.created_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Active thread */}
      <div className={`lg:col-span-2 ${selectedThread ? 'flex' : 'hidden lg:flex'} flex-col rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 overflow-hidden`}>
        {selectedThread ? (
          <>
            <div className="flex items-center gap-3 p-4 border-b border-black/5 dark:border-white/5">
              <button onClick={() => setSelectedThread(null)} className="lg:hidden p-1 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {selectedThread.user?.avatar ? <img src={selectedThread.user.avatar} alt="" className="w-full h-full object-cover" /> : (selectedThread.user?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{selectedThread.user?.full_name || selectedThread.user?.email}</p>
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 truncate">{selectedThread.user?.email}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedThread.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    msg.sender_role === 'admin'
                      ? 'bg-[#E61D25] text-white rounded-br-sm'
                      : 'bg-black/5 dark:bg-white/5 text-[#0A0A0A] dark:text-[#F9F9F9] rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender_role === 'admin' ? 'text-white/60' : 'text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30'}`}>
                      {new Date(msg.created_date).toLocaleString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendReply} className="flex gap-2 p-4 border-t border-black/5 dark:border-white/5">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={lang === 'ru' ? 'Ответить...' : 'Ҷавоб додан...'}
                className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
              />
              <button type="submit" disabled={sending || !replyText.trim()} className="px-4 py-3 bg-[#E61D25] text-white rounded-xl text-sm disabled:opacity-50 flex items-center justify-center">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">{lang === 'ru' ? 'Выберите диалог' : 'Гуфтугӯро интихоб кунед'}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
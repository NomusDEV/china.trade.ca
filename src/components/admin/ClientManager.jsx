import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Mail, Phone, MapPin, ShoppingBag, DollarSign, Calendar, ArrowLeft, Send, MessageSquare, CheckCircle, Loader2, Crown } from 'lucide-react';
import AdminFilters, { inDateRange, textMatch } from '@/components/admin/AdminFilters';

export default function ClientManager() {
  const { lang } = useLanguage();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fSub, setFSub] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [u, o, m] = await Promise.all([
        base44.entities.User.list('-created_date'),
        base44.entities.Order.list('-created_date'),
        base44.entities.Message.list('-created_date'),
      ]);
      setUsers(u);
      setOrders(o);
      setMessages(m);
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const getUserOrders = (userId) => orders.filter(o => o.created_by_id === userId);
  const getUserMessages = (userId) => messages.filter(m => m.thread_user_id === userId);
  const getUserUnreadCount = (userId) => messages.filter(m => m.thread_user_id === userId && m.sender_role === 'user' && !m.read).length;

  const clients = users.filter((u) => u.role !== 'admin');
  const filteredUsers = clients.filter((u) =>
    textMatch(`${u.full_name || ''} ${u.email || ''} ${u.phone || ''}`, search) &&
    (!fSub || (fSub === 'yes' ? !!u.subscription_active : !u.subscription_active)) &&
    inDateRange(u.created_date, from, to),
  );

  const totalClients = users.filter(u => u.role !== 'admin').length;
  const newThisWeek = users.filter(u => {
    if (u.role === 'admin') return false;
    const created = new Date(u.created_date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  if (selectedUser) {
    return (
      <ClientDetail
        user={selectedUser}
        orders={getUserOrders(selectedUser.id)}
        messages={getUserMessages(selectedUser.id)}
        onBack={() => setSelectedUser(null)}
        onMessagesUpdate={loadData}
        lang={lang}
      />
    );
  }

  const stats = [
    { label: lang === 'ru' ? 'Всего клиентов' : 'Ҳамагӣ муштариён', value: totalClients, icon: User, color: 'from-[#E61D25] to-[#E61D25]/70' },
    { label: lang === 'ru' ? 'Новых за неделю' : 'Нав дар як ҳафта', value: newThisWeek, icon: Calendar, color: 'from-[#C5A059] to-[#C5A059]/70' },
    { label: lang === 'ru' ? 'С заказами' : 'Бо фармоиш', value: users.filter(u => u.role !== 'admin' && getUserOrders(u.id).length > 0).length, icon: ShoppingBag, color: 'from-green-500 to-green-500/70' },
    { label: lang === 'ru' ? 'Непрочитанных' : 'Хонида нашуда', value: messages.filter(m => m.sender_role === 'user' && !m.read).length, icon: MessageSquare, color: 'from-blue-500 to-blue-500/70' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{s.value}</p>
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{s.label}</p>
            </div>
          );
        })}
      </div>

      <AdminFilters
        search={search}
        onSearch={setSearch}
        placeholder={lang === 'ru' ? 'Поиск по имени, email, телефону...' : 'Ҷустуҷӯ бо ном, email, телефон...'}
        filters={[
          {
            key: 'subscription',
            label: lang === 'ru' ? 'Все клиенты' : 'Ҳама муштариён',
            value: fSub,
            onChange: setFSub,
            options: [
              { value: 'yes', label: lang === 'ru' ? 'С подпиской' : 'Бо обуна' },
              { value: 'no', label: lang === 'ru' ? 'Без подписки' : 'Бе обуна' },
            ],
          },
        ]}
        dateFrom={from}
        dateTo={to}
        onDateFrom={setFrom}
        onDateTo={setTo}
        count={filteredUsers.length}
        total={clients.length}
      />

      {/* User list */}
      <div className="space-y-2 max-h-[calc(100vh-440px)] min-h-[240px] overflow-y-auto pr-1">
        {filteredUsers.map((u) => {
          const userOrders = getUserOrders(u.id);
          const totalSpent = userOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
          const unread = getUserUnreadCount(u.id);
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-md bg-white dark:bg-[#111111] border border-[#E4E1DA] dark:border-white/10 hover:border-[#C5A059]/50 cursor-pointer transition-colors"
              onClick={() => setSelectedUser(u)}
            >
              <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold flex-shrink-0">
                {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (u.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{u.full_name || u.email}</p>
                  {u.phone_verified && <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />}
                  {u.subscription_active && (
                    <span className="px-1.5 py-0.5 rounded bg-[#C5A059]/15 text-[#C5A059] text-[9px] font-bold flex-shrink-0">
                      {lang === 'ru' ? 'ПОДПИСКА' : 'ОБУНА'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 truncate">{u.email} · {u.phone || (lang === 'ru' ? 'нет телефона' : 'телефон нест')}</p>
                <p className="text-[10px] text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 mt-0.5">
                  {lang === 'ru' ? 'Регистрация:' : 'Бақайдгирӣ:'} {new Date(u.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Заказов' : 'Фармоиш'}</p>
                  <p className="text-sm font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{userOrders.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Потратил' : 'Харҷ кард'}</p>
                  <p className="text-sm font-bold text-[#E61D25]">${totalSpent.toFixed(2)}</p>
                </div>
                {unread > 0 && (
                  <span className="min-w-[20px] h-5 px-1.5 bg-[#E61D25] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{lang === 'ru' ? 'Клиенты не найдены' : 'Муштариён ёфт нашуданд'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientDetail({ user, orders, messages, onBack, onMessagesUpdate, lang }) {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [subscribed, setSubscribed] = useState(!!user.subscription_active);
  const [activatedAt, setActivatedAt] = useState(user.subscription_activated_at || '');
  const [savingSub, setSavingSub] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleSubscription = async () => {
    setSavingSub(true);
    try {
      const next = !subscribed;
      const stamp = next ? new Date().toISOString() : '';
      await base44.entities.User.update(user.id, {
        subscription_active: next,
        subscription_activated_at: stamp,
      });
      setSubscribed(next);
      setActivatedAt(stamp);
    } catch (e) {}
    setSavingSub(false);
  };

  const totalSpent = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total || 0), 0);
  const totalUnits = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.items?.reduce((si, i) => si + (i.quantity || 0), 0) || 0), 0);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await base44.entities.Message.create({
        thread_user_id: user.id,
        sender_id: 'admin',
        sender_role: 'admin',
        sender_name: lang === 'ru' ? 'Администратор' : 'Администратор',
        text: replyText.trim(),
        read: false,
      });
      setReplyText('');
      onMessagesUpdate();
    } catch (e) {}
    setSending(false);
  };

  const markAsRead = async () => {
    const unread = messages.filter(m => m.sender_role === 'user' && !m.read);
    for (const msg of unread) {
      await base44.entities.Message.update(msg.id, { read: true });
    }
    if (unread.length > 0) onMessagesUpdate();
  };

  useEffect(() => {
    markAsRead();
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, [user.id]);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:text-[#E61D25] transition-colors">
        <ArrowLeft className="w-4 h-4" /> {lang === 'ru' ? 'Назад к клиентам' : 'Бозгашт ба муштариён'}
      </button>

      {/* Profile header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
            {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user.full_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{user.full_name || user.email}</h3>
              {user.phone_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{user.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
            <Phone className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Телефон' : 'Телефон'}</p>
              <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{user.phone || '—'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
            <MapPin className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Адрес' : 'Суроға'}</p>
              <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{user.address || '—'}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="text-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
            <p className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{orders.length}</p>
            <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Заказов' : 'Фармоиш'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
            <p className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{totalUnits}</p>
            <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Товаров' : 'Молҳо'}</p>
          </div>
          <div className="text-center p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
            <p className="text-xl font-bold text-[#E61D25]">${totalSpent.toFixed(0)}</p>
            <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Потратил' : 'Харҷ'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 p-4 rounded-xl border border-[#C5A059]/20 bg-[#C5A059]/5">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">
                {lang === 'ru' ? 'Подписка на контакты заводов' : 'Обуна ба тамосҳои заводҳо'}
              </p>
              <p className="text-[10px] text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45">
                {subscribed
                  ? (lang === 'ru' ? 'Активна — клиент видит закрытые контакты' : 'Фаъол — муштарӣ тамосҳои пӯшидаро мебинад')
                  : (lang === 'ru' ? 'Не активна' : 'Ғайрифаъол')}
              </p>
              {subscribed && activatedAt && (
                <p className="text-[10px] text-[#C5A059] mt-0.5">
                  {lang === 'ru' ? 'Активирована' : 'Фаъол шуд'}:{' '}
                  {new Date(activatedAt).toLocaleString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={toggleSubscription}
            disabled={savingSub}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              subscribed
                ? 'bg-black/5 dark:bg-white/10 text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-black/10'
                : 'bg-[#C5A059] text-white hover:bg-[#C5A059]/90'
            }`}
          >
            {savingSub
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : (subscribed
                ? (lang === 'ru' ? 'Отключить' : 'Хомӯш кардан')
                : (lang === 'ru' ? 'Активировать' : 'Фаъол кардан'))}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
        <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#C5A059]" /> {lang === 'ru' ? 'Сообщения' : 'Паёмҳо'}
        </h3>
        <div className="space-y-3 max-h-80 overflow-y-auto mb-4 pr-1">
          {messages.length === 0 ? (
            <p className="text-center py-8 text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Нет сообщений' : 'Паём нест'}</p>
          ) : messages.map((msg) => (
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
        <form onSubmit={sendReply} className="flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={lang === 'ru' ? 'Написать сообщение клиенту...' : 'Ба муштарӣ паём нависед...'}
            className="flex-1 px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
          />
          <button type="submit" disabled={sending || !replyText.trim()} className="px-4 py-3 bg-[#E61D25] text-white rounded-xl text-sm disabled:opacity-50 flex items-center justify-center">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>

      {/* Orders */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
        <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#C5A059]" /> {lang === 'ru' ? 'Заказы клиента' : 'Фармоишҳои муштарӣ'}
        </h3>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{lang === 'ru' ? 'Заказов нет' : 'Фармоиш нест'}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">#{order.id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{new Date(order.created_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[10px] font-medium ${
                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-600' :
                    order.status === 'confirmed' ? 'bg-blue-500/10 text-blue-600' :
                    order.status === 'shipped' ? 'bg-purple-500/10 text-purple-600' :
                    order.status === 'delivered' ? 'bg-green-500/10 text-green-600' :
                    'bg-red-500/10 text-red-500'
                  }`}>{order.status}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {order.items?.slice(0, 3).map((item, i) => (
                    <span key={i} className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 truncate max-w-[120px]">
                      {lang === 'tj' && item.name_tj ? item.name_tj : item.name_ru} ×{item.quantity}
                    </span>
                  ))}
                  {order.items?.length > 3 && <span className="text-xs text-[#0A0A0A]/40">+{order.items.length - 3}</span>}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{order.items?.length || 0} {lang === 'ru' ? 'товаров' : 'мол'}</span>
                  <span className="text-lg font-bold text-[#E61D25]">${order.total?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
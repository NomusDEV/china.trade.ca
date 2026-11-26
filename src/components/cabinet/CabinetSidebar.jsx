import React, { useState } from 'react';
import { User, ShoppingBag, MessageSquare, LogOut, CheckCircle } from 'lucide-react';

export default function CabinetSidebar({ user, lang, t, activeTab, setActiveTab, unreadCount, ordersCount, roleBadge, onLogout }) {
  const [confirmLogout, setConfirmLogout] = useState(false);

  const tabs = [
    { key: 'profile', label: t('cabinet.profile'), Icon: User },
    { key: 'orders', label: t('cabinet.orderHistory'), Icon: ShoppingBag, badge: ordersCount },
    { key: 'messages', label: lang === 'ru' ? 'Сообщения' : 'Паёмҳо', Icon: MessageSquare, badge: unreadCount, alert: unreadCount > 0 },
  ];

  return (
    <div className="lg:sticky lg:top-24 space-y-4">
      {/* User card */}
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
        <div className="h-20 bg-gradient-to-br from-[#E61D25] to-[#C5A059]" />
        <div className="px-5 pb-5 -mt-9">
          <div className="w-16 h-16 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-[#111111] bg-[#F0F0F0] dark:bg-[#1A1A1A] flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20" />
            )}
          </div>
          <p className="mt-3 font-semibold text-sm text-[#0A0A0A] dark:text-[#F9F9F9] truncate">
            {user?.full_name || '—'}
          </p>
          <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 truncate">{user?.email || '—'}</p>
          <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded ${roleBadge.color}`}>
            {roleBadge.text}
          </span>
          {user?.phone_verified && (
            <p className="text-[10px] text-green-500 mt-2 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> {t('cabinet.phoneVerified')}
            </p>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-2 flex lg:flex-col gap-1 overflow-x-auto">
        {tabs.map(({ key, label, Icon, badge, alert }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === key
                ? 'bg-[#E61D25] text-white shadow-md shadow-[#E61D25]/20'
                : 'text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{label}</span>
            {badge > 0 && (
              <span className={`ml-auto min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full flex items-center justify-center ${
                alert ? 'bg-[#E61D25] text-white' : activeTab === key ? 'bg-white/25 text-white' : 'bg-black/10 dark:bg-white/10 text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50'
              }`}>
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      {confirmLogout ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <p className="text-xs font-medium text-center text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">
            {lang === 'ru' ? 'Выйти из аккаунта?' : 'Аз аккаунт бароед?'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onLogout}
              className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-500/90 transition-colors"
            >
              {lang === 'ru' ? 'Да, выйти' : 'Бале, бароед'}
            </button>
            <button
              onClick={() => setConfirmLogout(false)}
              className="flex-1 py-2 rounded-lg border border-black/10 dark:border-white/10 text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
            >
              {lang === 'ru' ? 'Отмена' : 'Бекор'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmLogout(true)}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-500/20 text-red-500 text-sm font-semibold hover:bg-red-500/5 transition-colors"
        >
          <LogOut className="w-4 h-4" /> {t('cabinet.logout')}
        </button>
      )}
    </div>
  );
}
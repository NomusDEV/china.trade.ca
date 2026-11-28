import React from 'react';
import { Crown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n.jsx';

export default function SubscriptionBadge({ className = '' }) {
  const { user } = useAuth();
  const { lang } = useLanguage();
  if (!user?.subscription_active) return null;
  return (
    <div className={className}>
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[11px] font-semibold">
        <Crown className="w-3.5 h-3.5" />
        {lang === 'ru' ? 'Подписка активна' : 'Обуна фаъол аст'}
      </span>
    </div>
  );
}
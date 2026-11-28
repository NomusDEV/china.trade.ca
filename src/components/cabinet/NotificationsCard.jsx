import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n.jsx';
import { Bell, Heart, MessageSquare, Loader2, ArrowRight } from 'lucide-react';

export default function NotificationsCard() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    base44.entities.Notification
      .filter({ recipient_id: user.id }, { sort: '-created_date', limit: 20 })
      .then((page) => {
        const list = page?.items || [];
        setItems(list);
        setUnread(list.filter((n) => !n.read).map((n) => n.id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    base44.entities.Notification
      .updateMany({ recipient_id: user.id, read: false }, { $set: { read: true } })
      .catch(() => {});
  }, [user?.id]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6 flex justify-center">
        <Loader2 className="w-5 h-5 text-[#C5A059] animate-spin" />
      </div>
    );
  }

  const linkFor = (n) => (n.item_type === 'factory' ? `/shop/factory/${n.item_id}` : `/product/${n.item_id}`);

  const titleFor = (n) => {
    const actor = n.actor_name || (lang === 'ru' ? 'Пользователь' : 'Корбар');
    if (n.type === 'like') {
      return lang === 'ru' ? `${actor} оценил ваш отзыв` : `${actor} ба шарҳи шумо баҳо дод`;
    }
    return lang === 'ru' ? `${actor} ответил на ваш отзыв` : `${actor} ба шарҳи шумо ҷавоб дод`;
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
          <Bell className="w-5 h-5 text-[#C5A059]" />
        </div>
        <div>
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {lang === 'ru' ? 'Уведомления' : 'Огоҳиномаҳо'}
          </h3>
          <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            {lang === 'ru' ? 'Лайки и ответы на ваши отзывы' : 'Лайкҳо ва ҷавобҳо ба шарҳҳои шумо'}
          </p>
        </div>
        {unread.length > 0 && (
          <span className="ml-auto min-w-[22px] h-[22px] px-1.5 rounded-full bg-[#E61D25] text-white text-[11px] font-bold flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 text-center py-6">
          {lang === 'ru' ? 'Пока нет уведомлений' : 'Ҳоло огоҳинома нест'}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const isUnread = unread.includes(n.id);
            const Icon = n.type === 'like' ? Heart : MessageSquare;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  isUnread
                    ? 'bg-[#C5A059]/5 border-[#C5A059]/25'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent'
                }`}
              >
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#E61D25] to-[#C5A059] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {n.actor_avatar
                    ? <img src={n.actor_avatar} alt="" className="w-full h-full object-cover" />
                    : (n.actor_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#0A0A0A] dark:text-[#F9F9F9] leading-snug">
                    <Icon className={`w-3.5 h-3.5 inline mr-1 ${n.type === 'like' ? 'text-[#E61D25]' : 'text-[#C5A059]'}`} />
                    {titleFor(n)}
                  </p>
                  {n.text && (
                    <p className="text-xs text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45 truncate mt-0.5">«{n.text}»</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">
                      {new Date(n.created_date).toLocaleString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
                        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    <Link to={linkFor(n)} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E61D25] hover:underline">
                      {lang === 'ru' ? 'Ответить' : 'Ҷавоб додан'} <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
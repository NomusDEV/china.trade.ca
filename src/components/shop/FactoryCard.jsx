import React from 'react';
import { Phone, Send, Globe, MapPin, MessageSquare } from 'lucide-react';
import { getTypeLabel, getTypeIcon } from '@/lib/productTypes';

const telegramHref = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, '')}`;
};

const whatsappHref = (value) => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
};

export default function FactoryCard({ factory, lang }) {
  const name = lang === 'tj' && factory.name_tj ? factory.name_tj : factory.name_ru;
  const description = lang === 'tj' && factory.description_tj ? factory.description_tj : factory.description_ru;
  const TypeIcon = getTypeIcon(factory.type);
  const location = [factory.city, factory.country].filter(Boolean).join(', ');
  const tg = telegramHref(factory.telegram);
  const wa = whatsappHref(factory.whatsapp);

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-5 hover:shadow-xl hover:shadow-black/5 transition-all">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center flex-shrink-0">
          <TypeIcon className="w-5 h-5 text-[#C5A059]" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-sm text-[#0A0A0A] dark:text-[#F9F9F9] leading-snug">{name}</h3>
          <p className="text-[10px] text-[#C5A059] font-medium uppercase tracking-wide mt-0.5">
            {getTypeLabel(factory.type, lang)}
          </p>
        </div>
      </div>

      {description && (
        <p className="text-xs text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 leading-relaxed line-clamp-3 mb-3">{description}</p>
      )}

      {location && (
        <p className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45 mb-4">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {location}
        </p>
      )}

      <div className="mt-auto flex flex-wrap gap-2">
        {factory.phone && (
          <a href={`tel:${factory.phone}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-[#E61D25] hover:text-white transition-colors">
            <Phone className="w-3.5 h-3.5" /> {factory.phone}
          </a>
        )}
        {tg && (
          <a href={tg} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-[#E61D25] hover:text-white transition-colors">
            <Send className="w-3.5 h-3.5" /> Telegram
          </a>
        )}
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-[#E61D25] hover:text-white transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
        {factory.wechat && (
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">
            <MessageSquare className="w-3.5 h-3.5" /> WeChat: {factory.wechat}
          </span>
        )}
        {factory.website && (
          <a href={factory.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-[#E61D25] hover:text-white transition-colors">
            <Globe className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Сайт' : 'Сайт'}
          </a>
        )}
      </div>
    </div>
  );
}
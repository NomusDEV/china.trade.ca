import React from 'react';
import { Phone, Send, Globe, MapPin, MessageSquare, Lock, Check } from 'lucide-react';
import { getTypeLabel, getTypeIcon } from '@/lib/productTypes';
import { telegramHref, whatsappHref } from '@/lib/factoryLinks';

export default function FactoryCard({ factory, lang, selected, onToggle, onOpen, locked }) {
  const name = lang === 'tj' && factory.name_tj ? factory.name_tj : factory.name_ru;
  const description = lang === 'tj' && factory.description_tj ? factory.description_tj : factory.description_ru;
  const TypeIcon = getTypeIcon(factory.type);
  const location = [factory.city, factory.country].filter(Boolean).join(', ');
  const tg = telegramHref(factory.telegram);
  const wa = whatsappHref(factory.whatsapp);

  return (
    <div className={`relative flex flex-col h-full rounded-2xl bg-white dark:bg-[#111111] border p-5 transition-all ${
      selected
        ? 'border-[#C5A059] shadow-lg shadow-[#C5A059]/10'
        : 'border-black/5 dark:border-white/5 hover:shadow-xl hover:shadow-black/5'
    }`}>
      <button
        type="button"
        onClick={() => onToggle(factory.id)}
        aria-label="select"
        className={`absolute top-4 right-4 z-10 w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
          selected
            ? 'bg-[#C5A059] border-[#C5A059] text-white'
            : 'border-black/15 dark:border-white/15 text-transparent hover:border-[#C5A059] bg-white/80 dark:bg-[#111111]/80'
        }`}
      >
        <Check className="w-4 h-4" />
      </button>

      <button type="button" onClick={() => onOpen(factory)} className="text-left group">
        {factory.image ? (
          <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-black/5 dark:bg-white/5">
            <img src={factory.image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center mb-3">
            <TypeIcon className="w-5 h-5 text-[#C5A059]" />
          </div>
        )}

        <div className="pr-8">
          <h3 className="font-semibold text-sm text-[#0A0A0A] dark:text-[#F9F9F9] leading-snug group-hover:text-[#C5A059] transition-colors">{name}</h3>
          <p className="text-[10px] text-[#C5A059] font-medium uppercase tracking-wide mt-0.5">
            {getTypeLabel(factory.type, lang)}
          </p>
        </div>

        {description && (
          <p className="text-xs text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 leading-relaxed line-clamp-3 mt-2 mb-2">{description}</p>
        )}

        {location && (
          <p className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> {location}
          </p>
        )}

        <span className="inline-block mt-2 text-[11px] font-semibold text-[#E61D25] group-hover:underline">
          {lang === 'ru' ? 'Подробнее →' : 'Муфассал →'}
        </span>
      </button>

      <div className="mt-auto pt-3">
        {locked ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20">
            <Lock className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
            <span className="text-xs font-medium text-[#C5A059]">
              {lang === 'ru' ? 'Контакты по подписке' : 'Тамосҳо бо обуна'}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
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
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Send, Globe, MapPin, MessageSquare, Lock, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getTypeLabel, getTypeIcon } from '@/lib/productTypes';
import { telegramHref, whatsappHref } from '@/lib/factoryLinks';

function ContactRow({ Icon, label, value, href }) {
  const content = (
    <>
      <Icon className="w-4 h-4 flex-shrink-0 text-[#C5A059]" />
      <span className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 w-20 flex-shrink-0">{label}</span>
      <span className="text-sm text-[#0A0A0A]/75 dark:text-[#F9F9F9]/75 truncate">{value}</span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer" className="flex items-center gap-2 py-2 hover:text-[#E61D25] transition-colors">
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-2 py-2">{content}</div>
  );
}

export default function FactoryDetail({ factory, open, onClose, lang, locked, selected, onToggle }) {
  if (!factory) return null;

  const name = lang === 'tj' && factory.name_tj ? factory.name_tj : factory.name_ru;
  const description = lang === 'tj' && factory.description_tj ? factory.description_tj : factory.description_ru;
  const TypeIcon = getTypeIcon(factory.type);
  const location = [factory.city, factory.country].filter(Boolean).join(', ');
  const hasContacts = factory.phone || factory.telegram || factory.whatsapp || factory.wechat || factory.website;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white dark:bg-[#111111] border-black/5 dark:border-white/5">
        {factory.image ? (
          <div className="w-full h-48 bg-black/5 dark:bg-white/5">
            <img src={factory.image} alt={name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full h-28 bg-gradient-to-br from-[#C5A059]/20 to-[#E61D25]/10 flex items-center justify-center">
            <TypeIcon className="w-10 h-10 text-[#C5A059]" />
          </div>
        )}

        <div className="p-6">
          <DialogTitle className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-1">
            {name}
          </DialogTitle>

          <p className="text-[11px] text-[#C5A059] font-semibold uppercase tracking-wide mb-3">
            {getTypeLabel(factory.type, lang)}
          </p>

          {location && (
            <p className="flex items-center gap-2 text-sm text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 mb-4">
              <MapPin className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
              {location}
            </p>
          )}

          {description && (
            <div className="mb-5">
              <p className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-1.5">
                {lang === 'ru' ? 'О заводе' : 'Дар бораи завод'}
              </p>
              <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 leading-relaxed whitespace-pre-wrap">
                {description}
              </p>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-1.5">
              {lang === 'ru' ? 'Контакты' : 'Тамосҳо'}
            </p>
            {locked ? (
              <div className="rounded-xl bg-[#C5A059]/10 border border-[#C5A059]/20 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-[#C5A059] mb-2">
                  <Lock className="w-4 h-4" /> {lang === 'ru' ? 'Контакты доступны по подписке' : 'Тамосҳо бо обуна дастрасанд'}
                </p>
                <Link to="/contacts" className="text-xs font-semibold text-[#E61D25] hover:underline">
                  {lang === 'ru' ? 'Подключить подписку →' : 'Пайваст кардани обуна →'}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {factory.phone && <ContactRow Icon={Phone} label={lang === 'ru' ? 'Телефон' : 'Телефон'} value={factory.phone} href={`tel:${factory.phone}`} />}
                {factory.telegram && <ContactRow Icon={Send} label="Telegram" value={factory.telegram} href={telegramHref(factory.telegram)} />}
                {factory.whatsapp && <ContactRow Icon={MessageSquare} label="WhatsApp" value={factory.whatsapp} href={whatsappHref(factory.whatsapp)} />}
                {factory.wechat && <ContactRow Icon={MessageSquare} label="WeChat" value={factory.wechat} />}
                {factory.website && <ContactRow Icon={Globe} label={lang === 'ru' ? 'Сайт' : 'Сайт'} value={factory.website} href={factory.website} />}
                {!hasContacts && (
                  <p className="text-xs text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 py-2">
                    {lang === 'ru' ? 'Контакты не указаны' : 'Тамосҳо нишон дода нашудаанд'}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <button
              onClick={() => onToggle(factory.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                selected
                  ? 'bg-[#C5A059] text-white'
                  : 'bg-[#E61D25] text-white hover:bg-[#E61D25]/90'
              }`}
            >
              <Check className="w-4 h-4" />
              {selected
                ? (lang === 'ru' ? 'В подборке' : 'Дар интихоб')
                : (lang === 'ru' ? 'Выбрать завод' : 'Заводро интихоб кардан')}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium border border-black/10 dark:border-white/10 text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
            >
              {lang === 'ru' ? 'Закрыть' : 'Пӯшидан'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
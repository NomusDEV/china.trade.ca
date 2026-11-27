import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  Phone, Send, Globe, MapPin, MessageSquare, Lock, Factory as FactoryIcon,
  Calendar, Users, Package, Award, Clock, Truck, Boxes,
} from 'lucide-react';
import { getTypeLabel, getTypeIcon } from '@/lib/productTypes';
import { telegramHref, whatsappHref } from '@/lib/factoryLinks';
import BackButton from '@/components/layout/BackButton';
import ContactIcon from '@/components/ContactIcon';
import FactoryComments from '@/components/shop/FactoryComments';
import MediaGallery from '@/components/media/MediaGallery';

function ContactRow({ type, label, value, href }) {
  const content = (
    <>
      <ContactIcon type={type} size="sm" />
      <span className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-[#0A0A0A]/75 dark:text-[#F9F9F9]/75 break-all">{value}</span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer" className="flex items-center gap-3 py-2.5 hover:text-[#E61D25] transition-colors">
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-3 py-2.5">{content}</div>
  );
}

export default function FactoryPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Factory.get(id)
      .then(setFactory)
      .catch(() => setFactory(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (loading || factory) return undefined;
    const meta = document.createElement('meta');
    meta.name = 'prerender-status-code';
    meta.content = '404';
    document.head.appendChild(meta);
    return () => document.head.removeChild(meta);
  }, [loading, factory]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A] pt-20">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  if (!factory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A] pt-20">
        <FactoryIcon className="w-16 h-16 text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 mb-4" />
        <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-4">
          {lang === 'ru' ? 'Завод не найден' : 'Завод ёфт нашуд'}
        </p>
        <Link to="/shop" className="text-[#E61D25] text-sm font-medium">
          {lang === 'ru' ? 'Вернуться в магазин' : 'Бозгашт ба мағоза'}
        </Link>
      </div>
    );
  }

  const name = lang === 'tj' && factory.name_tj ? factory.name_tj : factory.name_ru;
  const description = lang === 'tj' && factory.description_tj ? factory.description_tj : factory.description_ru;
  const TypeIcon = getTypeIcon(factory.type);
  const location = [factory.city, factory.country].filter(Boolean).join(', ');
  const locked = !!factory.requires_subscription && user?.role !== 'admin' && !user?.subscription_active;
  const hasContacts = factory.phone || factory.telegram || factory.whatsapp || factory.wechat || factory.website;

  const specs = [
    { Icon: MapPin, label: lang === 'ru' ? 'Адрес' : 'Суроға', value: factory.address },
    { Icon: Calendar, label: lang === 'ru' ? 'Год основания' : 'Соли таъсис', value: factory.founded_year },
    { Icon: Users, label: lang === 'ru' ? 'Сотрудники' : 'Кормандон', value: factory.employees },
    { Icon: Package, label: lang === 'ru' ? 'Ассортимент' : 'Ассортимент', value: lang === 'tj' && factory.main_products_tj ? factory.main_products_tj : factory.main_products_ru },
    { Icon: Boxes, label: lang === 'ru' ? 'Производство' : 'Истеҳсолот', value: lang === 'tj' && factory.capacity_tj ? factory.capacity_tj : factory.capacity_ru },
    { Icon: Package, label: lang === 'ru' ? 'Мин. партия' : 'Партияи ҳадди ақал', value: factory.min_order },
    { Icon: Award, label: lang === 'ru' ? 'Сертификаты' : 'Сертификатҳо', value: factory.certifications },
    { Icon: Clock, label: lang === 'ru' ? 'Время работы' : 'Вақти корӣ', value: factory.working_hours },
    { Icon: Truck, label: lang === 'ru' ? 'Условия доставки' : 'Шартҳои расонидан', value: lang === 'tj' && factory.delivery_terms_tj ? factory.delivery_terms_tj : factory.delivery_terms_ru },
  ].filter((s) => s.value);

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/shop" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Photo */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <MediaGallery
              images={factory.images?.length ? factory.images : (factory.image ? [factory.image] : [])}
              videos={factory.videos || []}
              alt={name}
              aspect="aspect-[4/3]"
              fallbackIcon={TypeIcon}
            />
          </motion.div>

          {/* Main info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-xs text-[#C5A059] font-semibold tracking-widest uppercase">
              {getTypeLabel(factory.type, lang)}
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mt-2 mb-2">{name}</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-4">
              <span>
                {lang === 'ru' ? 'Добавлен' : 'Илова шуд'}:{' '}
                {new Date(factory.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
              </span>
              {factory.updated_date && (
                <span>
                  {lang === 'ru' ? 'Обновлён' : 'Нав карда шуд'}:{' '}
                  {new Date(factory.updated_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
                </span>
              )}
            </p>

            {location && (
              <p className="flex items-center gap-2 text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-6">
                <MapPin className="w-4 h-4 text-[#C5A059]" /> {location}
              </p>
            )}

            {description && (
              <p className="text-sm text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65 leading-relaxed whitespace-pre-wrap mb-8">
                {description}
              </p>
            )}

            <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-5">
              <p className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-2">
                {lang === 'ru' ? 'Контакты' : 'Тамосҳо'}
              </p>
              {locked ? (
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-[#C5A059] mb-2">
                    <Lock className="w-4 h-4" /> {lang === 'ru' ? 'Контакты доступны по подписке' : 'Тамосҳо бо обуна дастрасанд'}
                  </p>
                  <Link to="/contacts" className="text-sm font-semibold text-[#E61D25] hover:underline">
                    {lang === 'ru' ? 'Подключить подписку →' : 'Пайваст кардани обуна →'}
                  </Link>
                </div>
              ) : hasContacts ? (
                <div className="divide-y divide-black/5 dark:divide-white/5">
                  {factory.phone && <ContactRow type="phone" label={lang === 'ru' ? 'Телефон' : 'Телефон'} value={factory.phone} href={`tel:${factory.phone}`} />}
                  {factory.telegram && <ContactRow type="telegram" label="Telegram" value={factory.telegram} href={telegramHref(factory.telegram)} />}
                  {factory.whatsapp && <ContactRow type="whatsapp" label="WhatsApp" value={factory.whatsapp} href={whatsappHref(factory.whatsapp)} />}
                  {factory.wechat && <ContactRow type="wechat" label="WeChat" value={factory.wechat} />}
                  {factory.website && <ContactRow type="website" label={lang === 'ru' ? 'Сайт' : 'Сайт'} value={factory.website} href={factory.website} />}
                </div>
              ) : (
                <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                  {lang === 'ru' ? 'Контакты не указаны' : 'Тамосҳо нишон дода нашудаанд'}
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Details */}
        {specs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-4">
              {lang === 'ru' ? 'Информация о заводе' : 'Маълумот дар бораи завод'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {specs.map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-0.5">{label}</p>
                    <p className="text-sm text-[#0A0A0A]/75 dark:text-[#F9F9F9]/75 whitespace-pre-wrap break-words">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link to="/shop" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E61D25] text-white text-sm font-semibold hover:bg-[#E61D25]/90 transition-colors">
            {lang === 'ru' ? 'Вернуться в магазин' : 'Бозгашт ба мағоза'}
          </Link>
          <Link to="/catalog" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-black/10 dark:border-white/10 text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:border-[#C5A059] transition-colors">
            {lang === 'ru' ? 'Найти товары' : 'Ёфтани молҳо'}
          </Link>
        </div>

        <FactoryComments factoryId={factory.id} />
      </div>
    </div>
  );
}
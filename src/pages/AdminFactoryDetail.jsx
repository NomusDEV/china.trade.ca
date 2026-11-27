import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Pencil, Trash2, Factory as FactoryIcon, MapPin, Phone, Send, Globe,
  Calendar, Users, Package, Award, Clock, Truck, Boxes, ExternalLink, BadgeCheck,
} from 'lucide-react';
import { getTypeLabel } from '@/lib/productTypes';
import FactoryForm from '@/components/admin/FactoryForm';
import MediaGallery from '@/components/media/MediaGallery';

export default function AdminFactoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isNew = id === 'new';
  const [factory, setFactory] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [editing, setEditing] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isNew) return;
    base44.entities.Factory.get(id)
      .then(setFactory)
      .catch(() => setFactory(null))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const remove = async () => {
    await base44.entities.Factory.delete(id);
    navigate('/admin');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isNew && !factory) {
    return (
      <div className="text-center py-20">
        <FactoryIcon className="w-14 h-14 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
        <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-4">
          {lang === 'ru' ? 'Завод не найден' : 'Завод ёфт нашуд'}
        </p>
        <Link to="/admin" className="text-sm font-semibold text-[#E61D25]">
          {lang === 'ru' ? 'Вернуться к заводам' : 'Бозгашт ба заводҳо'}
        </Link>
      </div>
    );
  }

  const name = factory ? (lang === 'tj' && factory.name_tj ? factory.name_tj : factory.name_ru) : '';

  const specs = factory ? [
    { Icon: MapPin, label: lang === 'ru' ? 'Адрес' : 'Суроға', value: factory.address },
    { Icon: MapPin, label: lang === 'ru' ? 'Город' : 'Шаҳр', value: [factory.city, factory.country].filter(Boolean).join(', ') },
    { Icon: Calendar, label: lang === 'ru' ? 'Год основания' : 'Соли таъсис', value: factory.founded_year },
    { Icon: Users, label: lang === 'ru' ? 'Сотрудники' : 'Кормандон', value: factory.employees },
    { Icon: Package, label: lang === 'ru' ? 'Ассортимент' : 'Ассортимент', value: lang === 'tj' && factory.main_products_tj ? factory.main_products_tj : factory.main_products_ru },
    { Icon: Boxes, label: lang === 'ru' ? 'Производство' : 'Истеҳсолот', value: lang === 'tj' && factory.capacity_tj ? factory.capacity_tj : factory.capacity_ru },
    { Icon: Package, label: lang === 'ru' ? 'Мин. партия' : 'Партияи ҳадди ақал', value: factory.min_order },
    { Icon: Award, label: lang === 'ru' ? 'Сертификаты' : 'Сертификатҳо', value: factory.certifications },
    { Icon: Clock, label: lang === 'ru' ? 'Время работы' : 'Вақти корӣ', value: factory.working_hours },
    { Icon: Truck, label: lang === 'ru' ? 'Условия доставки' : 'Шартҳои расонидан', value: lang === 'tj' && factory.delivery_terms_tj ? factory.delivery_terms_tj : factory.delivery_terms_ru },
  ].filter((s) => s.value) : [];

  const contacts = factory ? [
    { Icon: Phone, value: factory.phone },
    { Icon: Send, value: factory.telegram },
    { Icon: Phone, value: factory.whatsapp },
    { Icon: Phone, value: factory.wechat },
    { Icon: Globe, value: factory.website },
  ].filter((c) => c.value) : [];

  return (
    <div>
      <button
        onClick={() => navigate('/admin')}
        className="inline-flex items-center gap-2 text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#E61D25] transition-colors mb-5"
      >
        <ArrowLeft className="w-4 h-4" /> {lang === 'ru' ? 'Все заводы' : 'Ҳамаи заводҳо'}
      </button>

      {editing ? (
        <div>
          {!isNew && (
            <button
              onClick={() => setEditing(false)}
              className="inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded border border-[#E4E1DA] dark:border-white/10 text-[12px] font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Предпросмотр' : 'Пешнамоиш'}
            </button>
          )}
          <FactoryForm
            factory={factory}
            onSaved={(saved) => {
              if (isNew && saved?.id) {
                navigate(`/admin/factory/${saved.id}`, { replace: true });
              } else {
                setFactory(saved);
                setEditing(false);
              }
            }}
            onCancel={() => (isNew ? navigate('/admin') : setEditing(false))}
          />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-[#C5A059] font-semibold tracking-widest uppercase mb-1">
                {getTypeLabel(factory.type, lang)}
              </p>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2 py-1 rounded text-[10px] font-medium ${factory.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {factory.status}
                </span>
                {factory.requires_subscription && (
                  <span className="px-2 py-1 rounded text-[10px] font-medium bg-[#C5A059]/10 text-[#C5A059]">
                    {lang === 'ru' ? 'Только по подписке' : 'Танҳо бо обуна'}
                  </span>
                )}
                <span className="text-[11px] text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35">
                  {lang === 'ru' ? 'Добавлен' : 'Илова шуд'}: {new Date(factory.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C5A059] text-white text-xs font-semibold hover:bg-[#C5A059]/90 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Редактировать' : 'Таҳрир'}
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-500/90 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Удалить' : 'Нест кардан'}
              </button>
              <Link
                to={`/shop/factory/${factory.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-black/10 dark:border-white/10 text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {lang === 'ru' ? 'На сайте' : 'Дар сайт'}
              </Link>
            </div>
          </div>

          {confirmDelete && (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-red-500/30 bg-red-500/5 mb-5">
              <span className="text-sm text-red-500 font-medium">
                {lang === 'ru' ? `Удалить завод «${factory.name_ru}»?` : `Заводи «${factory.name_ru}» нест карда шавад?`}
              </span>
              <button onClick={remove} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold">
                {lang === 'ru' ? 'Да, удалить' : 'Бале, нест кунед'}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                {lang === 'ru' ? 'Отмена' : 'Бекор'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <MediaGallery
              images={factory.images?.length ? factory.images : (factory.image ? [factory.image] : [])}
              videos={factory.videos || []}
              alt={name}
              aspect="aspect-[4/3]"
              fallbackIcon={FactoryIcon}
            />
            <div>
              {(factory.description_ru || factory.description_tj) && (
                <p className="text-sm text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65 leading-relaxed whitespace-pre-wrap mb-5">
                  {lang === 'tj' && factory.description_tj ? factory.description_tj : factory.description_ru}
                </p>
              )}
              <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-5">
                <p className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-2">
                  {lang === 'ru' ? 'Контакты' : 'Тамосҳо'}
                </p>
                {contacts.length > 0 ? (
                  <div className="divide-y divide-black/5 dark:divide-white/5">
                    {contacts.map(({ Icon, value }, i) => (
                      <div key={i} className="flex items-center gap-3 py-2.5 text-sm text-[#0A0A0A]/75 dark:text-[#F9F9F9]/75">
                        <Icon className="w-4 h-4 text-[#C5A059]" /> <span className="break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                    {lang === 'ru' ? 'Контакты не указаны' : 'Тамосҳо нишон дода нашудаанд'}
                  </p>
                )}
              </div>
              {factory.requires_subscription && (
                <p className="flex items-center gap-1.5 text-[11px] text-[#C5A059] mt-3">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {lang === 'ru' ? 'Контакты скрыты от клиентов без подписки' : 'Тамосҳо аз муштариёни бе обуна пинҳонанд'}
                </p>
              )}
            </div>
          </div>

          {specs.length > 0 && (
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
          )}
        </motion.div>
      )}
    </div>
  );
}
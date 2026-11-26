import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Factory, Search, Package, ClipboardCheck, Truck, ArrowRight, Store, Lock, X, Phone, Send, Globe, MessageSquare, MapPin } from 'lucide-react';
import { PRODUCT_TYPES, getTypeLabel } from '@/lib/productTypes';
import { telegramHref, whatsappHref } from '@/lib/factoryLinks';
import FactoryCard from '@/components/shop/FactoryCard';
import FactoryDetail from '@/components/shop/FactoryDetail';

function ContactLine({ Icon, label, value, href }) {
  const content = (
    <>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 text-[#C5A059]" />
      <span className="text-[10px] uppercase tracking-wide text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 w-16 flex-shrink-0">{label}</span>
      <span className="text-xs text-[#0A0A0A]/75 dark:text-[#F9F9F9]/75 truncate">{value}</span>
    </>
  );
  return href ? (
    <a href={href} target={href.startsWith('tel:') ? undefined : '_blank'} rel="noopener noreferrer" className="flex items-center gap-2 py-1 hover:text-[#E61D25] transition-colors">
      {content}
    </a>
  ) : (
    <div className="flex items-center gap-2 py-1">{content}</div>
  );
}

export default function Shop() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [detail, setDetail] = useState(null);
  const directoryRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    base44.entities.Factory.filter({ status: 'active' }, '-created_date')
      .then(setFactories)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getName = (f) => (lang === 'tj' && f.name_tj ? f.name_tj : f.name_ru);
  const getDesc = (f) => (lang === 'tj' && f.description_tj ? f.description_tj : f.description_ru);
  const isLocked = (f) => !!f.requires_subscription && user?.role !== 'admin' && !user?.subscription_active;

  const cities = [...new Set(factories.map((f) => f.city).filter(Boolean))].sort((a, b) => a.localeCompare(b));

  const filtered = factories.filter((f) => {
    const matchesType = !selectedType || f.type === selectedType;
    const matchesCity = !selectedCity || f.city === selectedCity;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || `${getName(f)} ${getDesc(f) || ''} ${f.city || ''} ${f.country || ''}`.toLowerCase().includes(q);
    return matchesType && matchesCity && matchesSearch;
  });

  const typeCounts = factories.reduce((acc, f) => {
    const key = f.type || 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const toggleFactory = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectedFactories = factories.filter((f) => selectedIds.includes(f.id));

  const services = [
    {
      key: 'factories',
      Icon: Factory,
      title_ru: 'Контакты заводов и фабрик',
      title_tj: 'Тамосҳои заводҳо ва фабрикаҳо',
      desc_ru: 'Выберите несколько заводов и сразу получите их контакты.',
      desc_tj: 'Якчанд заводро интихоб кунед ва фавран тамосҳои онҳоро гиред.',
      action: () => directoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
      badge_ru: `${factories.length} заводов`,
      badge_tj: `${factories.length} завод`,
    },
    {
      key: 'sourcing',
      Icon: Package,
      title_ru: 'Подбор товара под заказ',
      title_tj: 'Интихоби мол ба фармоиш',
      desc_ru: 'Найдём нужный товар на китайских площадках и договоримся о цене.',
      desc_tj: 'Моли лозимиро дар майдонҳои Хитой меёбем ва дар бораи нарх мувофиқа мекунем.',
      to: '/contacts',
    },
    {
      key: 'check',
      Icon: ClipboardCheck,
      title_ru: 'Проверка поставщика',
      title_tj: 'Санҷиши таъминкунанда',
      desc_ru: 'Проверим завод, документы и репутацию перед оплатой.',
      desc_tj: 'Завод, ҳуҷҷатҳо ва обрӯро пеш аз пардохт месанҷем.',
      to: '/contacts',
    },
    {
      key: 'logistics',
      Icon: Truck,
      title_ru: 'Логистика и доставка',
      title_tj: 'Логистика ва расонидан',
      desc_ru: 'Сборные грузы и контейнеры из Китая в Центральную Азию.',
      desc_tj: 'Борҳои ҷамъӣ ва контейнерҳо аз Хитой ба Осиёи Марказӣ.',
      to: '/services',
    },
  ];

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">
              {lang === 'ru' ? 'Магазин' : 'Мағоза'}
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">
            {lang === 'ru' ? 'Магазин услуг и поставщиков' : 'Мағозаи хизматрасонӣ ва таъминкунандагон'}
          </h1>
          <p className="text-sm text-[#0A0A0A]/55 dark:text-[#F9F9F9]/55 max-w-2xl">
            {lang === 'ru'
              ? 'Готовые услуги для закупок из Китая: прямые контакты заводов, подбор товара, проверка поставщиков и логистика.'
              : 'Хизматрасониҳои омода барои харид аз Хитой: тамосҳои мустақими заводҳо, интихоби мол, санҷиши таъминкунанда ва логистика.'}
          </p>
        </motion.div>

        {/* Services */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {services.map((service, i) => {
            const Icon = service.Icon;
            const title = lang === 'tj' ? service.title_tj : service.title_ru;
            const desc = lang === 'tj' ? service.desc_tj : service.desc_ru;
            const badge = lang === 'tj' ? service.badge_tj : service.badge_ru;
            const inner = (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 group-hover:text-[#E61D25] group-hover:translate-x-0.5 transition-all" />
                </div>
                <h3 className="font-semibold text-sm text-[#0A0A0A] dark:text-[#F9F9F9] mb-1.5">{title}</h3>
                <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 leading-relaxed">{desc}</p>
                {badge && (
                  <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded bg-[#E61D25]/10 text-[#E61D25]">{badge}</span>
                )}
              </>
            );
            const className = 'group block h-full rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-5 hover:border-[#C5A059]/40 hover:shadow-xl hover:shadow-black/5 transition-all text-left';
            return (
              <motion.div key={service.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                {service.to ? (
                  <Link to={service.to} className={className}>{inner}</Link>
                ) : (
                  <button onClick={service.action} className={className}>{inner}</button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Factory directory */}
        <div ref={directoryRef} className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center">
              <Factory className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
                {lang === 'ru' ? 'Заводы и фабрики' : 'Заводҳо ва фабрикаҳо'}
              </h2>
              <p className="text-xs text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45">
                {lang === 'ru' ? 'Отметьте заводы — контакты появятся справа' : 'Заводҳоро қайд кунед — тамосҳо дар тарафи рост пайдо мешаванд'}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ru' ? 'Поиск завода, товара или города' : 'Ҷустуҷӯи завод, мол ё шаҳр'}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] transition-colors text-sm"
            />
          </div>

          {/* Type chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
            <button
              onClick={() => setSelectedType('')}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !selectedType
                  ? 'bg-[#E61D25] text-white'
                  : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 hover:border-[#C5A059]'
              }`}
            >
              {lang === 'ru' ? 'Все направления' : 'Ҳамаи самтҳо'}
            </button>
            {PRODUCT_TYPES.filter((tp) => typeCounts[tp.value]).map((tp) => (
              <button
                key={tp.value}
                onClick={() => setSelectedType(tp.value)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedType === tp.value
                    ? 'bg-[#E61D25] text-white'
                    : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 hover:border-[#C5A059]'
                }`}
              >
                {getTypeLabel(tp.value, lang)} · {typeCounts[tp.value]}
              </button>
            ))}
          </div>

          {/* City filter */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <MapPin className="w-4 h-4 text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="">
                {lang === 'ru' ? 'Все города' : 'Ҳамаи шаҳрҳо'}
              </option>
              {cities.map((city) => (
                <option key={city} className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value={city}>
                  {city}
                </option>
              ))}
            </select>
            {(selectedCity || selectedType || searchQuery) && (
              <button
                onClick={() => { setSelectedCity(''); setSelectedType(''); setSearchQuery(''); }}
                className="text-xs text-[#E61D25] font-medium px-2 py-1 hover:underline"
              >
                {lang === 'ru' ? 'Сбросить фильтры' : 'Тоза кардани филтрҳо'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* Grid */}
            <div>
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
                  <Store className="w-12 h-12 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
                  <p className="text-sm text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45 mb-4">
                    {factories.length === 0
                      ? (lang === 'ru' ? 'Список заводов скоро появится' : 'Рӯйхати заводҳо ба зудӣ пайдо мешавад')
                      : (lang === 'ru' ? 'Ничего не найдено' : 'Чизе ёфт нашуд')}
                  </p>
                  <Link to="/contacts" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E61D25] text-white text-sm font-semibold rounded-xl">
                    {lang === 'ru' ? 'Запросить контакты' : 'Тамосҳоро дархост кардан'}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((factory, i) => (
                    <motion.div key={factory.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <FactoryCard
                        factory={factory}
                        lang={lang}
                        selected={selectedIds.includes(factory.id)}
                        onToggle={toggleFactory}
                        onOpen={setDetail}
                        locked={isLocked(factory)}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected contacts panel */}
            <aside ref={panelRef} className="scroll-mt-24 lg:sticky lg:top-24 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
                  {lang === 'ru' ? 'Выбранные заводы' : 'Заводҳои интихобшуда'} ({selectedFactories.length})
                </h3>
                {selectedFactories.length > 0 && (
                  <button onClick={() => setSelectedIds([])} className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25]">
                    {lang === 'ru' ? 'Очистить' : 'Тоза кардан'}
                  </button>
                )}
              </div>

              {selectedFactories.length === 0 ? (
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 leading-relaxed">
                  {lang === 'ru'
                    ? 'Отметьте галочкой один или несколько заводов — их контакты появятся здесь.'
                    : 'Як ё якчанд заводро қайд кунед — тамосҳои онҳо дар ин ҷо пайдо мешаванд.'}
                </p>
              ) : (
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {selectedFactories.map((factory) => (
                    <div key={factory.id} className="rounded-xl border border-black/5 dark:border-white/5 p-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{getName(factory)}</p>
                          <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 truncate">
                            {getTypeLabel(factory.type, lang)}
                            {factory.city ? ` · ${factory.city}` : ''}
                          </p>
                        </div>
                        <button onClick={() => toggleFactory(factory.id)} className="p-1 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 hover:text-[#E61D25]">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {isLocked(factory) ? (
                        <div className="rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/20 p-2.5">
                          <p className="flex items-center gap-1.5 text-[11px] font-medium text-[#C5A059] mb-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            {lang === 'ru' ? 'Контакты доступны по подписке' : 'Тамосҳо бо обуна дастрасанд'}
                          </p>
                          <Link to="/contacts" className="text-[11px] font-semibold text-[#E61D25] hover:underline">
                            {lang === 'ru' ? 'Подключить подписку →' : 'Пайваст кардани обуна →'}
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-black/5 dark:divide-white/5">
                          {factory.phone && <ContactLine Icon={Phone} label={lang === 'ru' ? 'Телефон' : 'Телефон'} value={factory.phone} href={`tel:${factory.phone}`} />}
                          {factory.telegram && <ContactLine Icon={Send} label="Telegram" value={factory.telegram} href={telegramHref(factory.telegram)} />}
                          {factory.whatsapp && <ContactLine Icon={MessageSquare} label="WhatsApp" value={factory.whatsapp} href={whatsappHref(factory.whatsapp)} />}
                          {factory.wechat && <ContactLine Icon={MessageSquare} label="WeChat" value={factory.wechat} />}
                          {factory.website && <ContactLine Icon={Globe} label={lang === 'ru' ? 'Сайт' : 'Сайт'} value={factory.website} href={factory.website} />}
                          {!factory.phone && !factory.telegram && !factory.whatsapp && !factory.wechat && !factory.website && (
                            <p className="text-[11px] text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 py-1">
                              {lang === 'ru' ? 'Контакты не указаны' : 'Тамосҳо нишон дода нашудаанд'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile floating bar */}
      {selectedFactories.length > 0 && (
        <button
          onClick={() => panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          className="lg:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-full bg-[#E61D25] text-white text-sm font-semibold shadow-xl shadow-black/20"
        >
          {lang === 'ru'
            ? `${selectedFactories.length} выбрано · Показать контакты`
            : `${selectedFactories.length} интихоб · Нишон додани тамосҳо`}
        </button>
      )}

      <FactoryDetail
        factory={detail}
        open={!!detail}
        onClose={() => setDetail(null)}
        lang={lang}
        locked={detail ? isLocked(detail) : false}
        selected={detail ? selectedIds.includes(detail.id) : false}
        onToggle={toggleFactory}
      />
    </div>
  );
}
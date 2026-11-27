import React from 'react';
import { Package, ShoppingCart, Inbox, TrendingUp, DollarSign, Boxes, BarChart3, Box } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

const CARD = 'border border-[#E4E1DA] dark:border-white/10 rounded-md p-5 flex flex-col gap-2.5 bg-white dark:bg-[#111111] transition-colors duration-200 hover:bg-[#FBFAF8] dark:hover:bg-white/[0.04]';
const PANEL = 'border border-[#E4E1DA] dark:border-white/10 rounded-md p-[22px] flex flex-col gap-3.5 bg-white dark:bg-[#111111]';
const LAB = 'text-[10.5px] tracking-[.2em] uppercase font-semibold leading-[1.4] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60';
const ROW = 'flex flex-col gap-1.5 py-1 transition-colors duration-200 hover:bg-[#F3F2EF] dark:hover:bg-white/[0.04]';
const EMPTY = 'text-[13px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 text-center py-[26px] leading-[1.4]';
const MINI_BTN = 'text-[12px] px-3 py-[7px] rounded border border-[#0A0A0A]/15 dark:border-white/15 bg-white dark:bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] transition-colors duration-200 hover:bg-[#F3F2EF] hover:border-[#0A0A0A]/35 active:bg-[#E9E7E2]';

export default function MyListingsDashboard({ products, orders, inquiries, categories, factories = [], onOpenProducts }) {
  const { lang, t } = useLanguage();

  const activeProducts = products.filter((p) => p.status === 'active');
  const totalCatalogValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const avgPrice = products.length > 0 ? totalCatalogValue / products.length : 0;

  const byCategory = {};
  products.forEach((p) => {
    const cat = p.category || '—';
    if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
    byCategory[cat].count += 1;
    byCategory[cat].value += p.price || 0;
  });
  const categoryList = Object.entries(byCategory).sort((a, b) => b[1].value - a[1].value);
  const maxCategoryValue = Math.max(...categoryList.map(([, v]) => v.value), 1);

  const totalOrders = orders.length;
  const ordersByStatus = {
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };
  const paidOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalUnitsOrdered = paidOrders.reduce(
    (sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0),
    0,
  );
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const recentOrders = orders.slice(0, 5);

  const fmt = (n) => `¥${(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;

  const cards = [
    { label: t('listings.totalProducts'), value: products.length, sub: `${activeProducts.length} ${lang === 'ru' ? 'активных' : 'фаъол'}`, Icon: Box },
    { label: t('listings.catalogValue'), value: fmt(totalCatalogValue), sub: lang === 'ru' ? 'сумма всех товаров' : 'маблағи ҳама молҳо', Icon: DollarSign },
    { label: t('listings.totalOrders'), value: totalOrders, sub: `${ordersByStatus.pending} ${lang === 'ru' ? 'в ожидании' : 'дар интизор'}`, Icon: ShoppingCart },
    { label: t('listings.revenue'), value: fmt(totalRevenue), sub: lang === 'ru' ? 'выручка' : 'даромад', Icon: TrendingUp },
    { label: t('listings.avgPrice'), value: fmt(avgPrice), sub: lang === 'ru' ? 'средняя цена' : 'нархи миёна', Icon: BarChart3 },
    { label: t('listings.unitsOrdered'), value: totalUnitsOrdered, sub: lang === 'ru' ? 'ед. заказано' : 'дона фармоиш', Icon: Boxes },
  ];

  const statusRows = [
    { key: 'pending', label: t('cabinet.pending') },
    { key: 'confirmed', label: t('cabinet.confirmed') },
    { key: 'shipped', label: t('cabinet.shipped') },
    { key: 'delivered', label: t('cabinet.delivered') },
    { key: 'cancelled', label: t('cabinet.cancelled') },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, sub, Icon }, i) => (
          <div key={label} className={`${CARD} admin-rise admin-d${Math.min(3 + Math.floor(i / 2), 6)}`}>
            <div className="w-9 h-9 rounded border border-[#E4E1DA] dark:border-white/10 bg-[#F3F2EF] dark:bg-white/5 flex items-center justify-center text-[#C5A059]">
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.7} />
            </div>
            <div className="text-[28px] font-bold tracking-[-0.02em] leading-[1.1] tabular-nums text-[#0A0A0A] dark:text-[#F9F9F9]">{value}</div>
            <div className={LAB}>{label}</div>
            <div className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 leading-[1.4]">{sub}</div>
          </div>
        ))}
      </section>

      {/* Status + categories */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${PANEL} admin-rise admin-d5`}>
          <div className={LAB}>{t('listings.ordersByStatus')}</div>
          {statusRows.map((row) => {
            const count = ordersByStatus[row.key] || 0;
            const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            return (
              <div key={row.key} className={ROW}>
                <div className="flex items-center justify-between gap-2.5 text-[13px] text-[#0A0A0A] dark:text-[#F9F9F9]">
                  <span>{row.label}</span>
                  <b className="tabular-nums">{count}</b>
                </div>
                <div className="h-[3px] rounded-sm bg-[#EDEBE6] dark:bg-white/10">
                  <div className="h-[3px] rounded-sm bg-[#C5A059]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={`${PANEL} admin-rise admin-d6`}>
          <div className={LAB}>{t('listings.byCategory')}</div>
          {categoryList.length === 0 ? (
            <div className={EMPTY}>{lang === 'ru' ? 'Нет данных' : 'Маълумот нест'}</div>
          ) : (
            categoryList.slice(0, 6).map(([cat, data]) => (
              <div key={cat} className={ROW}>
                <div className="flex items-center justify-between gap-2.5 text-[13px] text-[#0A0A0A] dark:text-[#F9F9F9]">
                  <span className="truncate">{cat}</span>
                  <b className="tabular-nums whitespace-nowrap">{data.count} {lang === 'ru' ? 'шт.' : 'дона'} · {fmt(data.value)}</b>
                </div>
                <div className="h-[3px] rounded-sm bg-[#EDEBE6] dark:bg-white/10">
                  <div className="h-[3px] rounded-sm bg-[#C5A059]" style={{ width: `${(data.value / maxCategoryValue) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent orders + inquiries */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
        <div className={`${PANEL} admin-rise admin-d6`}>
          <div className={LAB}>{t('listings.recentOrders')}</div>
          {recentOrders.length === 0 ? (
            <div className={EMPTY}>{t('cabinet.noOrders')}</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between gap-2.5 text-[13px] py-1 transition-colors duration-200 hover:bg-[#F3F2EF] dark:hover:bg-white/[0.04]">
                <span className="truncate text-[#0A0A0A] dark:text-[#F9F9F9]">
                  {order.customer_name}
                  <span className="text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                    {' '}· {order.items?.length || 0} {t('cabinet.items')} · {new Date(order.created_date).toLocaleDateString('ru-RU')}
                  </span>
                </span>
                <b className="tabular-nums whitespace-nowrap text-[#0A0A0A] dark:text-[#F9F9F9]">{fmt(order.total)}</b>
              </div>
            ))
          )}
        </div>

        <div className={`${PANEL} admin-rise admin-d6`}>
          <div className={LAB}>{t('listings.inquiries')}</div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded border border-[#E4E1DA] dark:border-white/10 bg-[#F3F2EF] dark:bg-white/5 flex items-center justify-center text-[#C5A059]">
              <Inbox className="w-[26px] h-[26px]" strokeWidth={1.7} />
            </div>
            <div>
              <div className="text-[28px] font-bold tracking-[-0.02em] leading-[1.1] tabular-nums text-[#0A0A0A] dark:text-[#F9F9F9]">{newInquiries}</div>
              <div className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                {lang === 'ru' ? 'новых заявок' : 'дархостҳои нав'}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2.5 text-[13px] pt-3 border-t border-[#E4E1DA] dark:border-white/10">
            <span className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{lang === 'ru' ? 'Всего заявок' : 'Ҳамагӣ дархост'}</span>
            <b className="tabular-nums text-[#0A0A0A] dark:text-[#F9F9F9]">{inquiries.length}</b>
          </div>
        </div>
      </section>

      {/* Empty placeholders */}
      {(products.length === 0 || factories.length === 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.length === 0 && (
            <div className={`border border-dashed border-[#D8D4CB] dark:border-white/15 rounded-md px-4 py-7 text-center text-[13px] text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 bg-[#FBFAF8] dark:bg-white/[0.02] leading-[1.4] admin-rise admin-d6`}>
              {lang === 'ru' ? 'Нет товаров' : 'Мол нест'}
              <div className="flex gap-2 justify-center mt-3">
                <button type="button" onClick={onOpenProducts} className={MINI_BTN}>
                  {lang === 'ru' ? 'Редактировать разделы' : 'Таҳрири бахшҳо'}
                </button>
              </div>
            </div>
          )}
          {factories.length === 0 && (
            <div className={`border border-dashed border-[#D8D4CB] dark:border-white/15 rounded-md px-4 py-7 text-center text-[13px] text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 bg-[#FBFAF8] dark:bg-white/[0.02] leading-[1.4] admin-rise admin-d6`}>
              {lang === 'ru' ? 'Заводов пока нет' : 'Ҳоло заводҳо нест'}
              <div className="flex gap-2 justify-center mt-3">
                <a href="/admin/factory/new" className={MINI_BTN}>{lang === 'ru' ? 'Добавить завод' : 'Завод илова кардан'}</a>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
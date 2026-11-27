import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Inbox, TrendingUp, DollarSign, Boxes, BarChart3, Box } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

const LAB = 'text-[9.5px] tracking-[.22em] uppercase font-semibold leading-[1.4] text-[#8a8780]';
const CARD = 'bg-[#131518] border border-[#23262b] rounded-[2px] p-3 flex flex-col gap-[5px] transition-[background,box-shadow] duration-200 hover:bg-[#181b1f] hover:shadow-[inset_2px_0_0_#C5A059] admin-rise';
const PANEL = 'bg-[#131518] border border-[#23262b] rounded-[2px] p-3 flex flex-col gap-1 admin-rise';
const ROW = 'relative flex flex-col gap-[5px] py-1.5 px-2 border-t border-[#1c1f23] transition-[background,box-shadow] duration-200 hover:bg-[#181b1f] hover:shadow-[inset_2px_0_0_#C5A059]';
const RL = 'flex justify-between gap-2.5 text-[12px] text-[#E8E6E1]';
const EMPTY = 'text-center text-[12px] text-[#6f6d67] py-[18px] leading-[1.4]';
const MINI = 'text-[11px] px-[11px] py-1.5 rounded-[2px] border border-[#3a3e44] bg-[#131518] text-[#E8E6E1] cursor-pointer transition-colors duration-200 hover:bg-[#1b1e22] hover:border-[#C5A059] active:bg-[#23262b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C5A059]';

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
    { label: t('listings.totalProducts'), value: products.length, sub: `${activeProducts.length} ${lang === 'ru' ? 'активных' : 'фаъол'}`, Icon: Box, delay: '.26s' },
    { label: t('listings.catalogValue'), value: fmt(totalCatalogValue), sub: lang === 'ru' ? 'сумма всех товаров' : 'маблағи ҳама молҳо', Icon: DollarSign, delay: '.3s' },
    { label: t('listings.totalOrders'), value: totalOrders, sub: `${ordersByStatus.pending} ${lang === 'ru' ? 'в ожидании' : 'дар интизор'}`, Icon: ShoppingCart, delay: '.34s' },
    { label: t('listings.revenue'), value: fmt(totalRevenue), sub: lang === 'ru' ? 'выручка' : 'даромад', Icon: TrendingUp, delay: '.38s' },
    { label: t('listings.avgPrice'), value: fmt(avgPrice), sub: lang === 'ru' ? 'средняя цена' : 'нархи миёна', Icon: BarChart3, delay: '.42s' },
    { label: t('listings.unitsOrdered'), value: totalUnitsOrdered, sub: lang === 'ru' ? 'ед. заказано' : 'дона фармоиш', Icon: Boxes, delay: '.46s' },
  ];

  const statusRows = [
    { key: 'pending', label: t('cabinet.pending') },
    { key: 'confirmed', label: t('cabinet.confirmed') },
    { key: 'shipped', label: t('cabinet.shipped') },
    { key: 'delivered', label: t('cabinet.delivered') },
    { key: 'cancelled', label: t('cabinet.cancelled') },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {cards.map(({ label, value, sub, Icon, delay }) => (
          <div key={label} className={CARD} style={{ animationDelay: delay }}>
            <div className="w-7 h-7 border border-[#23262b] bg-[#0F1012] rounded-[2px] flex items-center justify-center text-[#C5A059]">
              <Icon className="w-[15px] h-[15px]" strokeWidth={1.6} />
            </div>
            <div className="admin-flick font-mono tabular-nums text-[21px] font-semibold leading-[1.1] text-[#E8E6E1]">{value}</div>
            <div className={LAB}>{label}</div>
            <div className="text-[11px] text-[#6f6d67] leading-[1.4]">{sub}</div>
          </div>
        ))}
      </section>

      {/* Status + categories */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className={PANEL} style={{ animationDelay: '.4s' }}>
          <div className={`${LAB} pb-1`}>{t('listings.ordersByStatus')}</div>
          {statusRows.map((row) => {
            const count = ordersByStatus[row.key] || 0;
            const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
            return (
              <div key={row.key} className={ROW}>
                <div className={RL}>
                  <span>{row.label}</span>
                  <b className="font-mono tabular-nums font-semibold text-[#C5A059] whitespace-nowrap">{count}</b>
                </div>
                <div className="h-[2px] bg-[#23262b]">
                  <i className="block h-[2px] bg-[#C5A059]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        <div className={PANEL} style={{ animationDelay: '.4s' }}>
          <div className={`${LAB} pb-1`}>{t('listings.byCategory')}</div>
          {categoryList.length === 0 ? (
            <div className={EMPTY}>{lang === 'ru' ? 'Нет данных' : 'Маълумот нест'}</div>
          ) : (
            categoryList.slice(0, 6).map(([cat, data]) => (
              <div key={cat} className={ROW}>
                <div className={RL}>
                  <span className="truncate">{cat}</span>
                  <b className="font-mono tabular-nums font-semibold text-[#C5A059] whitespace-nowrap">
                    {data.count} {lang === 'ru' ? 'шт.' : 'дона'} · {fmt(data.value)}
                  </b>
                </div>
                <div className="h-[2px] bg-[#23262b]">
                  <i className="block h-[2px] bg-[#C5A059]" style={{ width: `${(data.value / maxCategoryValue) * 100}%` }} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recent orders + inquiries */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2">
        <div className={PANEL} style={{ animationDelay: '.4s' }}>
          <div className={`${LAB} pb-1`}>{t('listings.recentOrders')}</div>
          {recentOrders.length === 0 ? (
            <div className={EMPTY}>{t('cabinet.noOrders')}</div>
          ) : (
            recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex justify-between gap-2.5 text-[12px] py-1.5 px-2 border-t border-[#1c1f23] transition-[background,box-shadow] duration-200 hover:bg-[#181b1f] hover:shadow-[inset_2px_0_0_#C5A059]"
              >
                <span className="truncate text-[#E8E6E1]">
                  {order.customer_name}
                  <span className="text-[#6f6d67]">
                    {' '}· {order.items?.length || 0} {t('cabinet.items')} · {new Date(order.created_date).toLocaleDateString('ru-RU')}
                  </span>
                </span>
                <b className="font-mono tabular-nums font-semibold text-[#C5A059] whitespace-nowrap">{fmt(order.total)}</b>
              </div>
            ))
          )}
        </div>

        <div className={PANEL} style={{ animationDelay: '.4s' }}>
          <div className={`${LAB} pb-1`}>{t('listings.inquiries')}</div>
          <div className="flex items-center gap-3 py-1.5">
            <div className="w-10 h-10 border border-[#23262b] bg-[#0F1012] rounded-[2px] flex items-center justify-center text-[#C5A059]">
              <Inbox className="w-[19px] h-[19px]" strokeWidth={1.6} />
            </div>
            <div>
              <div className="admin-flick font-mono tabular-nums text-[21px] font-semibold leading-[1.1] text-[#E8E6E1]">{newInquiries}</div>
              <div className="text-[11px] text-[#6f6d67] leading-[1.4]">
                {lang === 'ru' ? 'новых заявок' : 'дархостҳои нав'}
              </div>
            </div>
          </div>
          <div className="flex justify-between gap-2.5 text-[12px] py-1.5 px-2 mt-1.5 border-t border-[#1c1f23] transition-[background,box-shadow] duration-200 hover:bg-[#181b1f] hover:shadow-[inset_2px_0_0_#C5A059]">
            <span className="text-[11px] text-[#6f6d67]">{lang === 'ru' ? 'Всего заявок' : 'Ҳамагӣ дархост'}</span>
            <b className="font-mono tabular-nums font-semibold text-[#C5A059]">{inquiries.length}</b>
          </div>
        </div>
      </section>

      {/* Empty placeholders */}
      {(products.length === 0 || factories.length === 0) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {products.length === 0 && (
            <div
              className="border border-dashed border-[#2f3338] rounded-[2px] bg-[#0F1012] p-4 text-center text-[12px] text-[#8a8780] leading-[1.4] flex flex-col items-center gap-2.5 admin-rise"
              style={{ animationDelay: '.5s' }}
            >
              {lang === 'ru' ? 'Нет товаров' : 'Мол нест'}
              <button type="button" onClick={onOpenProducts} className={MINI}>
                {lang === 'ru' ? 'Редактировать разделы' : 'Таҳрири бахшҳо'}
              </button>
            </div>
          )}
          {factories.length === 0 && (
            <div
              className="border border-dashed border-[#2f3338] rounded-[2px] bg-[#0F1012] p-4 text-center text-[12px] text-[#8a8780] leading-[1.4] flex flex-col items-center gap-2.5 admin-rise"
              style={{ animationDelay: '.5s' }}
            >
              {lang === 'ru' ? 'Заводов пока нет' : 'Ҳоло заводҳо нест'}
              <Link to="/admin/factory/new" className={MINI}>
                {lang === 'ru' ? 'Добавить завод' : 'Завод илова кардан'}
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingCart, Inbox, TrendingUp, DollarSign, Boxes, Clock, CheckCircle2, Truck, XCircle, AlertCircle, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

export default function MyListingsDashboard({ products, orders, inquiries, categories }) {
  const { lang, t } = useLanguage();

  // Product stats
  const activeProducts = products.filter(p => p.status === 'active');
  const totalCatalogValue = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const avgPrice = products.length > 0 ? totalCatalogValue / products.length : 0;
  const totalMoqValue = products.reduce((sum, p) => sum + (p.price || 0) * (p.moq || 1), 0);

  // Products by category
  const byCategory = {};
  products.forEach(p => {
    const cat = p.category || '—';
    if (!byCategory[cat]) byCategory[cat] = { count: 0, value: 0 };
    byCategory[cat].count++;
    byCategory[cat].value += (p.price || 0);
  });
  const categoryList = Object.entries(byCategory).sort((a, b) => b[1].value - a[1].value);
  const maxCategoryValue = Math.max(...categoryList.map(([, v]) => v.value), 1);

  // Order stats
  const totalOrders = orders.length;
  const ordersByStatus = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / orders.filter(o => o.status !== 'cancelled').length : 0;
  const totalUnitsOrdered = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => 
    sum + (o.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0), 0);

  // Inquiry stats
  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  // Recent orders
  const recentOrders = [...orders].slice(0, 5);

  const fmt = (n) => `¥${(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`;

  const statCards = [
    {
      label: t('listings.totalProducts'),
      value: products.length,
      sub: `${activeProducts.length} ${lang === 'ru' ? 'активных' : 'фаъол'}`,
      icon: Package,
      gradient: 'from-[#E61D25] to-[#E61D25]/70',
    },
    {
      label: t('listings.catalogValue'),
      value: fmt(totalCatalogValue),
      sub: `${lang === 'ru' ? 'сумма всех товаров' : 'маблағи ҳама молҳо'}`,
      icon: DollarSign,
      gradient: 'from-[#C5A059] to-[#C5A059]/70',
    },
    {
      label: t('listings.totalOrders'),
      value: totalOrders,
      sub: `${ordersByStatus.pending} ${lang === 'ru' ? 'в ожидании' : 'дар интизор'}`,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-blue-500/70',
    },
    {
      label: t('listings.revenue'),
      value: fmt(totalRevenue),
      sub: `${lang === 'ru' ? 'выручка' : 'даромад'}`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-green-500/70',
    },
    {
      label: t('listings.avgPrice'),
      value: fmt(avgPrice),
      sub: `${lang === 'ru' ? 'средняя цена' : 'нархи миёна'}`,
      icon: BarChart3,
      gradient: 'from-purple-500 to-purple-500/70',
    },
    {
      label: t('listings.unitsOrdered'),
      value: totalUnitsOrdered,
      sub: `${lang === 'ru' ? 'ед. заказано' : 'дона фармоиш'}`,
      icon: Boxes,
      gradient: 'from-orange-500 to-orange-500/70',
    },
  ];

  const orderStatusItems = [
    { key: 'pending', label: t('cabinet.pending'), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { key: 'confirmed', label: t('cabinet.confirmed'), icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'shipped', label: t('cabinet.shipped'), icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { key: 'delivered', label: t('cabinet.delivered'), icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { key: 'cancelled', label: t('cabinet.cancelled'), icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{card.value}</p>
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mt-1">{card.label}</p>
              <p className="text-[10px] text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 mt-0.5">{card.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#E61D25]" /> {t('listings.ordersByStatus')}
          </h3>
          <div className="space-y-3">
            {orderStatusItems.map((item) => {
              const Icon = item.icon;
              const count = ordersByStatus[item.key] || 0;
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg ${item.bg} flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <span className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">{item.label}</span>
                    </div>
                    <span className="text-sm font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className={`h-full rounded-full ${item.bg.replace('/10', '/60')}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Products by category */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#C5A059]" /> {t('listings.byCategory')}
          </h3>
          {categoryList.length === 0 ? (
            <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 py-8 text-center">{lang === 'ru' ? 'Нет данных' : 'Маълумот нест'}</p>
          ) : (
            <div className="space-y-3">
              {categoryList.slice(0, 6).map(([cat, data]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{cat}</span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{data.count} {lang === 'ru' ? 'шт.' : 'дона'}</span>
                      <span className="text-sm font-bold text-[#C5A059]">{fmt(data.value)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#C5A059] to-[#E61D25]" style={{ width: `${(data.value / maxCategoryValue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders + inquiries summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E61D25]" /> {t('listings.recentOrders')}
          </h3>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 py-8 text-center">{t('cabinet.noOrders')}</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center gap-3 p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-[#E61D25]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{order.customer_name}</p>
                    <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                      {order.items?.length || 0} {t('cabinet.items')} · {new Date(order.created_date).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#E61D25] flex-shrink-0">{fmt(order.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inquiries */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-5 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#C5A059]" /> {t('listings.inquiries')}
          </h3>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{newInquiries}</p>
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{lang === 'ru' ? 'новых заявок' : 'дархостҳои нав'}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-black/5 dark:border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{lang === 'ru' ? 'Всего заявок' : 'Ҳамагӣ дархост'}</span>
              <span className="font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{inquiries.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
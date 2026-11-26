import React from 'react';
import { motion } from 'framer-motion';
import { Package, ShoppingBag, DollarSign, Clock, CheckCircle2 } from 'lucide-react';

export default function OrdersTab({ orders, loading, lang, t }) {
  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-600',
    confirmed: 'bg-blue-500/10 text-blue-600',
    shipped: 'bg-purple-500/10 text-purple-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-500',
  };

  const statusLabel = (status) => t(`cabinet.${status?.toLowerCase()}`) || status;

  const totalSpent = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const activeCount = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length;

  const stats = [
    { Icon: ShoppingBag, label: lang === 'ru' ? 'Всего заказов' : 'Ҳамагӣ фармоиш', value: orders.length },
    { Icon: Clock, label: lang === 'ru' ? 'В работе' : 'Дар кор', value: activeCount },
    { Icon: DollarSign, label: lang === 'ru' ? 'Сумма покупок' : 'Маблағи харид', value: `$${totalSpent.toFixed(2)}` },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map(({ Icon, label, value }) => (
          <div key={label} className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-4">
            <Icon className="w-4 h-4 text-[#C5A059] mb-2" />
            <p className="text-lg font-bold text-[#0A0A0A] dark:text-[#F9F9F9] leading-tight">{value}</p>
            <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Orders */}
      <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
          </div>
          <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.orderHistory')}</h3>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
            <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`p-4 rounded-xl border ${
                  order.status === 'cancelled'
                    ? 'bg-red-500/[0.07] border-red-500/40'
                    : order.status === 'confirmed'
                      ? 'bg-green-500/[0.07] border-green-500/40'
                      : order.status === 'pending'
                        ? 'bg-amber-500/[0.08] border-amber-500/40'
                        : 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5'
                }`}
              >
                <div className="flex items-start justify-between mb-2 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
                      {t('cabinet.orderId')} #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mt-0.5">
                      {new Date(order.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ${statusColors[order.status] || statusColors.pending}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>

                {order.items?.length > 0 && (
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {order.items.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                        {item.image && <img src={item.image} alt="" className="w-6 h-6 rounded object-cover" />}
                        <span className="truncate max-w-[120px]">{lang === 'tj' && item.name_tj ? item.name_tj : item.name_ru}</span>
                        <span className="text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">+{order.items.length - 4}</span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                  <span className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                    <Package className="w-3.5 h-3.5" /> {order.items?.length || 0} {t('cabinet.items')}
                  </span>
                  <span className="text-lg font-bold text-[#E61D25]">${(Number(order.total) || 0).toFixed(2)}</span>
                </div>

                {order.status === 'confirmed' && (
                  <div className="mt-3 pt-3 border-t border-green-500/25 flex items-center gap-1.5 text-xs font-semibold text-green-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'ru' ? 'Ваш заказ успешно подтверждён и одобрен' : 'Фармоиши шумо бомуваффақият тасдиқ шуд'}
                  </div>
                )}

                {order.status === 'cancelled' && (
                  <div className="mt-3 pt-3 border-t border-red-500/25">
                    <p className="text-xs font-semibold text-red-500">
                      {lang === 'ru' ? 'Извините, этот заказ был отменён' : 'Бубахшед, ин фармоиш бекор карда шуд'}
                    </p>
                    {order.cancel_reason && (
                      <p className="text-xs text-red-500/80 mt-1">
                        {lang === 'ru' ? 'Причина' : 'Сабаб'}: {order.cancel_reason}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
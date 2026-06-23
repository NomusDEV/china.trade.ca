import React from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Package, Phone, MapPin, Trash2 } from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-500/10 text-yellow-500', label: { ru: 'Ожидает', tj: 'Интизор' } },
  confirmed: { color: 'bg-blue-500/10 text-blue-500', label: { ru: 'Подтверждён', tj: 'Тасдиқшуда' } },
  shipped: { color: 'bg-purple-500/10 text-purple-500', label: { ru: 'Отправлен', tj: 'Фиристодашуда' } },
  delivered: { color: 'bg-green-500/10 text-green-500', label: { ru: 'Доставлен', tj: 'Расонидашуда' } },
  cancelled: { color: 'bg-red-500/10 text-red-500', label: { ru: 'Отменён', tj: 'Бекоршуда' } },
};

export default function OrderManager({ orders, onUpdate }) {
  const { lang } = useLanguage();

  const updateStatus = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    onUpdate();
  };

  const deleteOrder = async (id) => {
    await base44.entities.Order.delete(id);
    onUpdate();
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">{lang === 'ru' ? 'Нет заказов' : 'Фармоиш нест'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const status = statusConfig[order.status] || statusConfig.pending;
        return (
          <div
            key={order.id}
            className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-sm text-[#0A0A0A] dark:text-[#F9F9F9]">{order.customer_name}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                  <Phone className="w-3 h-3" /> {order.customer_phone}
                </div>
                {order.customer_address && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                    <MapPin className="w-3 h-3" /> {order.customer_address}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded text-[10px] font-medium ${status.color}`}>
                  {status.label[lang] || status.label.ru}
                </span>
                <button
                  onClick={() => deleteOrder(order.id)}
                  className="p-1.5 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4 pb-4 border-b border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F0F0] dark:bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                    {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <span className="flex-1 text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">
                    {lang === 'tj' && item.name_tj ? item.name_tj : item.name_ru}
                  </span>
                  <span className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                    {item.quantity} × ${item.price}
                  </span>
                  <span className="font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {order.notes && (
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-3 italic">"{order.notes}"</p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#E61D25]">${order.total?.toFixed(2)}</span>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-xs focus:outline-none focus:border-[#C5A059] cursor-pointer"
              >
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <option key={key} value={key} className="bg-white dark:bg-[#111111]">
                    {cfg.label[lang] || cfg.label.ru}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Package, Phone, MapPin, Trash2, AlertTriangle, Check } from 'lucide-react';

const statusConfig = {
  pending: { color: 'bg-yellow-500/10 text-yellow-500', label: { ru: 'Ожидает', tj: 'Интизор' } },
  confirmed: { color: 'bg-blue-500/10 text-blue-500', label: { ru: 'Подтверждён', tj: 'Тасдиқшуда' } },
  shipped: { color: 'bg-purple-500/10 text-purple-500', label: { ru: 'Отправлен', tj: 'Фиристодашуда' } },
  delivered: { color: 'bg-green-500/10 text-green-500', label: { ru: 'Доставлен', tj: 'Расонидашуда' } },
  cancelled: { color: 'bg-red-500/10 text-red-500', label: { ru: 'Отменён', tj: 'Бекоршуда' } },
};

const QUICK_REASONS = [
  { ru: 'Нет в наличии', tj: 'Дар анбор нест' },
  { ru: 'Клиент отказался', tj: 'Муштарӣ рад кард' },
  { ru: 'Ошибка в заказе', tj: 'Хато дар фармоиш' },
  { ru: 'Проблема с оплатой', tj: 'Мушкилӣ дар пардохт' },
  { ru: 'Другая причина', tj: 'Сабаби дигар' },
];

export default function OrderManager({ orders, onUpdate }) {
  const { lang } = useLanguage();
  const [cancelId, setCancelId] = useState(null);
  const [reasonIndex, setReasonIndex] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [confirming, setConfirming] = useState(false);

  const updateStatus = async (id, status) => {
    await base44.entities.Order.update(id, { status });
    onUpdate();
  };

  const deleteOrder = async (id) => {
    await base44.entities.Order.delete(id);
    onUpdate();
  };

  const openCancel = (id) => {
    setCancelId(id);
    setReasonIndex(null);
    setCustomReason('');
    setConfirming(false);
  };

  const closeCancel = () => {
    setCancelId(null);
    setReasonIndex(null);
    setCustomReason('');
    setConfirming(false);
  };

  const handleStatusChange = (order, value) => {
    if (value === 'cancelled') {
      openCancel(order.id);
      return;
    }
    updateStatus(order.id, value);
  };

  const finalReason = () => {
    if (reasonIndex === null) return '';
    if (reasonIndex === QUICK_REASONS.length - 1) return customReason.trim();
    return lang === 'tj' ? QUICK_REASONS[reasonIndex].tj : QUICK_REASONS[reasonIndex].ru;
  };

  const confirmCancel = async (order) => {
    await base44.entities.Order.update(order.id, {
      status: 'cancelled',
      cancel_reason: finalReason(),
    });
    closeCancel();
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
        const isCancelling = cancelId === order.id;
        const needsCustomReason = reasonIndex === QUICK_REASONS.length - 1;
        const canCancel = reasonIndex !== null && (!needsCustomReason || customReason.trim());

        return (
          <div
            key={order.id}
            className={`p-5 rounded-xl bg-white dark:bg-[#111111] border ${
              order.status === 'cancelled'
                ? 'border-red-500/30'
                : 'border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5'
            }`}
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

            {order.status === 'cancelled' && order.cancel_reason && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-500">
                  {lang === 'ru' ? 'Причина отмены' : 'Сабаби бекоркунӣ'}: {order.cancel_reason}
                </p>
              </div>
            )}

            {isCancelling ? (
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
                <p className="text-xs font-semibold text-red-500 mb-2">
                  {lang === 'ru' ? 'Почему вы отменяете этот заказ?' : 'Чаро ин фармоишро бекор мекунед?'}
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_REASONS.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReasonIndex(i)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        reasonIndex === i
                          ? 'bg-red-500 text-white'
                          : 'bg-white dark:bg-[#1A1A1A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-black/10 dark:border-white/10 hover:border-red-400'
                      }`}
                    >
                      {lang === 'tj' ? r.tj : r.ru}
                    </button>
                  ))}
                </div>

                {needsCustomReason && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder={lang === 'ru' ? 'Укажите причину' : 'Сабабро нависед'}
                    className="w-full px-3 py-2 mb-3 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#E61D25]"
                  />
                )}

                {confirming ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">
                      {lang === 'ru' ? 'Подтвердить отмену заказа?' : 'Бекоркуниро тасдиқ мекунед?'}
                    </span>
                    <button
                      type="button"
                      onClick={() => confirmCancel(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-500/90"
                    >
                      <Check className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Да, отменить' : 'Бале, бекор кунед'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirming(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
                    >
                      {lang === 'ru' ? 'Нет' : 'Не'}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirming(true)}
                      disabled={!canCancel}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-500/90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Отменить заказ' : 'Фармоишро бекор кардан'}
                    </button>
                    <button
                      type="button"
                      onClick={closeCancel}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
                    >
                      {lang === 'ru' ? 'Отмена' : 'Бекор'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-[#E61D25]">${order.total?.toFixed(2)}</span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-xs focus:outline-none focus:border-[#C5A059] cursor-pointer"
                >
                  {Object.entries(statusConfig).map(([key, cfg]) => (
                    <option key={key} value={key} className="bg-white dark:bg-[#111111]">
                      {cfg.label[lang] || cfg.label.ru}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
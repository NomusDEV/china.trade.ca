import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useCart } from '@/lib/CartContext.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, CheckCircle, Package, UserCheck } from 'lucide-react';

export default function Cart() {
  const { lang, t } = useLanguage();
  const { items, removeItem, updateQuantity, total, count, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: '', phone: '', address: '', notes: '' });
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm((prev) => ({
        ...prev,
        name: user.full_name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [isAuthenticated, user]);

  const getName = (item) => (lang === 'tj' && item.name_tj ? item.name_tj : item.name_ru);

  const handleQtyChange = (productId, value) => {
    const qty = parseInt(value) || 0;
    if (qty <= 0) {
      removeItem(productId);
      return;
    }
    updateQuantity(productId, qty);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setPlacing(true);
    // Save profile data if logged in
    if (isAuthenticated && user && (form.phone !== (user.phone || '') || form.address !== (user.address || ''))) {
      try {
        await base44.auth.updateMe({ phone: form.phone, address: form.address });
      } catch {}
    }
    await base44.entities.Order.create({
      items: items.map((i) => ({
        product_id: i.product_id,
        name_ru: i.name_ru,
        name_tj: i.name_tj,
        price: i.price,
        quantity: i.quantity,
        image: i.image || '',
      })),
      total,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_address: form.address,
      notes: form.notes,
      status: 'pending',
    });
    clearCart();
    setPlacing(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 mx-auto bg-green-500/10 rounded-full flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">{t('cart.success')}</h1>
          {isAuthenticated && (
            <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-6">
              {lang === 'ru' ? 'Заказ сохранён в вашем кабинете.' : 'Фармоиш дар кабинети шумо захира шуд.'}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm">
              {t('cart.continueShopping')}
            </Link>
            {isAuthenticated && (
              <Link to="/cabinet" className="inline-flex items-center gap-2 px-6 py-3 border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-[#F9F9F9] font-semibold rounded-xl text-sm">
                {t('cabinet.title')}
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <ShoppingCart className="w-16 h-16 mx-auto text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 mb-4" />
          <h1 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-2">{t('cart.empty')}</h1>
          <p className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-6">{t('cart.emptyDesc')}</p>
          <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:text-[#E61D25] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('cart.continueShopping')}
        </Link>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-8">{t('cart.title')}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {isAuthenticated && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 text-green-600 text-xs font-medium mb-2">
                <UserCheck className="w-4 h-4" /> {t('cart.autoFilled')}
              </div>
            )}
            {items.map((item) => (
              <div key={item.product_id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
                <div className="w-20 h-20 rounded-xl bg-[#F0F0F0] dark:bg-[#1A1A1A] flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-[#0A0A0A]/10 dark:text-[#F9F9F9]/10" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{getName(item)}</h3>
                  <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">${item.price} {t('product.units')}</p>
                  <p className="text-sm font-bold text-[#E61D25] mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleQtyChange(item.product_id, e.target.value)}
                    className="w-16 text-center text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] bg-transparent border border-black/10 dark:border-white/10 rounded-lg py-1.5 focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 rounded-lg border border-black/10 dark:border-white/10 flex items-center justify-center text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.product_id)}
                  className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Checkout form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCheckout} className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 lg:sticky lg:top-24">
              {/* Summary */}
              <div className="mb-6 pb-6 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{t('cart.totalItems')}</span>
                  <span className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{count}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">{t('cart.grandTotal')}</span>
                  <span className="text-3xl font-bold text-[#E61D25]">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  required
                  type="text"
                  placeholder={t('cart.customerName')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                />
                <input
                  required
                  type="tel"
                  placeholder={t('cart.customerPhone')}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                />
                <input
                  type="text"
                  placeholder={t('cart.customerAddress')}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                />
                <textarea
                  placeholder={t('cart.notes')}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={placing}
                className="w-full mt-4 py-4 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 transition-colors disabled:opacity-50"
              >
                {placing ? t('cart.placing') : t('cart.placeOrder')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
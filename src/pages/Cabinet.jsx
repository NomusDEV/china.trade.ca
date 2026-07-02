import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { User, ShoppingBag, LogOut, Save, Mail, Package, CheckCircle } from 'lucide-react';

export default function Cabinet() {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [profile, setProfile] = useState({ phone: '', address: '' });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      base44.entities.Order.filter({ created_by_id: user.id }, '-created_date')
        .then(setOrders)
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await base44.auth.updateMe({ phone: profile.phone, address: profile.address });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const statusColors = {
    pending: 'bg-amber-500/10 text-amber-600',
    confirmed: 'bg-blue-500/10 text-blue-600',
    shipped: 'bg-purple-500/10 text-purple-600',
    delivered: 'bg-green-500/10 text-green-600',
    cancelled: 'bg-red-500/10 text-red-500',
  };

  const statusLabel = (status) => {
    const key = status?.toLowerCase();
    return t(`cabinet.${key}`) || status;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center">
        <div className="max-w-md mx-auto px-4 text-center w-full">
          <User className="w-16 h-16 mx-auto text-[#E61D25]/30 mb-4" />
          <h1 className="text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-2">
            {lang === 'ru' ? 'Войдите в аккаунт' : 'Ба аккаунт ворид шавед'}
          </h1>
          <a href="/login" className="inline-block px-6 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm">
            {t('auth.login')}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {t('cabinet.title')}
          </h1>
          <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mt-1">
            {t('cabinet.welcome')}, {user?.full_name || ''}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#E61D25]" />
                </div>
                <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.profile')}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('cabinet.fullName')}</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <User className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                    <span className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 truncate">{user?.full_name || '—'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('cabinet.email')}</label>
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5">
                    <Mail className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                    <span className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 truncate">{user?.email || '—'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('cabinet.phone')}</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('cabinet.address')}</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    rows={3}
                    placeholder={lang === 'ru' ? 'Город, улица, дом' : 'Шаҳр, кӯча, хона'}
                    className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? t('cabinet.saving') : t('cabinet.saveProfile')}
                </button>

                {saved && (
                  <div className="flex items-center gap-2 text-sm text-green-500 font-medium">
                    <CheckCircle className="w-4 h-4" /> {t('cabinet.saved')}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={logout}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-500 font-semibold rounded-xl text-sm hover:bg-red-500/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> {t('cabinet.logout')}
                </button>
              </div>
            </form>
          </div>

          {/* Order History */}
          <div className="lg:col-span-2">
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.orderHistory')}</h3>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-[#0A0A0A]/15 dark:text-[#F9F9F9]/15 mb-3" />
                  <p className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.noOrders')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-xl bg-[#F9F9F9] dark:bg-[#0A0A0A] border border-black/5 dark:border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
                            {t('cabinet.orderId')} #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mt-0.5">
                            {new Date(order.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${statusColors[order.status] || statusColors.pending}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                          <Package className="w-3.5 h-3.5" />
                          {order.items?.length || 0} {t('cabinet.items')}
                        </div>
                        <span className="text-lg font-bold text-[#E61D25]">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
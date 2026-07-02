import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { User, ShoppingBag, LogOut, Save, Mail, Package, CheckCircle, Shield, Phone, MapPin, Camera } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import PhoneVerification from '@/components/PhoneVerification';
import { findCountryByIso } from '@/lib/countries';

export default function Cabinet() {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated, logout, checkUserAuth } = useAuth();
  const [profile, setProfile] = useState({ address: '', avatar: '' });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfile({
        address: user.address || '',
        avatar: user.avatar || '',
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
      await base44.auth.updateMe({ address: profile.address, avatar: profile.avatar });
      await checkUserAuth();
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
      <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A] flex items-center">
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

  const roleBadge = user?.role === 'admin'
    ? { text: t('cabinet.admin'), color: 'bg-[#C5A059]/15 text-[#C5A059]' }
    : { text: t('cabinet.client'), color: 'bg-[#E61D25]/10 text-[#E61D25]' };

  const country = user?.country_iso ? findCountryByIso(user.country_iso) : null;

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {t('cabinet.title')}
          </h1>
          <p className="text-sm text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mt-1">
            {t('cabinet.welcome')}, {user?.full_name || ''}
          </p>
        </motion.div>

        {/* Info left, Profile right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Orders & Account Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.accountInfo')}</h3>
                <span className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-md ${roleBadge.color}`}>{roleBadge.text}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                  <User className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.fullName')}</p>
                    <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{user?.full_name || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                  <Mail className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.email')}</p>
                    <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{user?.email || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                  <Phone className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.phone')}</p>
                    <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">
                      {country && <span>{country.flag} {country.dial} </span>}
                      {user?.phone || '—'}
                      {user?.phone_verified && <CheckCircle className="inline w-3 h-3 text-green-500 ml-1" />}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.03]">
                  <MapPin className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.address')}</p>
                    <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{user?.address || '—'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order History */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 mb-5">
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
                    <div key={order.id} className="p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
                      <div className="flex items-start justify-between mb-2">
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
                      {order.items?.length > 0 && (
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {order.items.slice(0, 4).map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                              {item.image && <img src={item.image} alt="" className="w-6 h-6 rounded object-cover" />}
                              <span className="truncate max-w-[120px]">{lang === 'tj' && item.name_tj ? item.name_tj : item.name_ru}</span>
                              <span className="text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30">×{item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 4 && <span className="text-xs text-[#0A0A0A]/40">+{order.items.length - 4}</span>}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
                        <span className="flex items-center gap-1.5 text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">
                          <Package className="w-3.5 h-3.5" /> {order.items?.length || 0} {t('cabinet.items')}
                        </span>
                        <span className="text-lg font-bold text-[#E61D25]">${order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Profile + Phone Verification + Logout */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#E61D25]" />
                </div>
                <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.profile')}</h3>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <AvatarUpload
                  currentAvatar={profile.avatar}
                  onUploaded={(url) => setProfile({ ...profile, avatar: url })}
                  lang={lang}
                />
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mt-2 flex items-center gap-1">
                  <Camera className="w-3 h-3" /> {t('cabinet.avatar')}
                </p>
              </div>

              {/* Address */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('cabinet.address')}</label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={2}
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
                <div className="flex items-center gap-2 text-sm text-green-500 font-medium mt-2">
                  <CheckCircle className="w-4 h-4" /> {t('cabinet.saved')}
                </div>
              )}
            </form>

            {/* Phone Verification */}
            <div className="mt-6 p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#C5A059]" />
                </div>
                <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.phoneVerification')}</h3>
              </div>
              {user?.phone_verified ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('cabinet.phoneVerified')}</p>
                    <p className="text-xs text-green-600/60 dark:text-green-400/60">
                      {country && <span>{country.flag} {country.dial} </span>}{user?.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <PhoneVerification user={user} lang={lang} t={t} onVerified={() => window.location.reload()} />
              )}
            </div>

            {/* Logout */}
            <div className="mt-6">
              <button
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 py-3 border border-red-500/20 text-red-500 font-semibold rounded-xl text-sm hover:bg-red-500/5 transition-colors"
              >
                <LogOut className="w-4 h-4" /> {t('cabinet.logout')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
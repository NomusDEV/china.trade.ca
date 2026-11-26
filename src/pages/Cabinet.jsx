import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useUnreadMessages } from '@/lib/useUnreadMessages';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import ClientMessages from '@/components/cabinet/ClientMessages';
import CabinetSidebar from '@/components/cabinet/CabinetSidebar';
import ProfileTab from '@/components/cabinet/ProfileTab';
import OrdersTab from '@/components/cabinet/OrdersTab';
import { findCountryByIso } from '@/lib/countries';
import BackButton from '@/components/layout/BackButton';

export default function Cabinet() {
  const { lang, t } = useLanguage();
  const { user, isAuthenticated, logout, checkUserAuth } = useAuth();
  const unreadCount = useUnreadMessages();
  const [profile, setProfile] = useState({ address: '', avatar: '' });
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cabinetTab, setCabinetTab] = useState('profile');

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
        <BackButton to="/" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 pt-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-10 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-[10px] font-semibold tracking-widest uppercase">
              {lang === 'ru' ? 'Личный кабинет' : 'Кабинети шахсӣ'}
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">
            {t('cabinet.welcome')}, {user?.full_name?.split(' ')[0] || ''}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CabinetSidebar
              user={user}
              lang={lang}
              t={t}
              activeTab={cabinetTab}
              setActiveTab={setCabinetTab}
              unreadCount={unreadCount}
              ordersCount={orders.length}
              roleBadge={roleBadge}
              onLogout={logout}
            />
          </div>

          <div className="lg:col-span-3">
            {cabinetTab === 'profile' && (
              <ProfileTab
                user={user}
                lang={lang}
                t={t}
                country={country}
                profile={profile}
                setProfile={setProfile}
                onSave={handleSave}
                saving={saving}
                saved={saved}
                roleBadge={roleBadge}
                onVerified={() => window.location.reload()}
              />
            )}
            {cabinetTab === 'orders' && (
              <OrdersTab orders={orders} loading={loading} lang={lang} t={t} />
            )}
            {cabinetTab === 'messages' && <ClientMessages />}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { User, Mail, Phone, MapPin, Camera, Save, CheckCircle, Shield, Trash2, Crown, BadgeCheck } from 'lucide-react';
import AvatarUpload from '@/components/AvatarUpload';
import PhoneVerification from '@/components/PhoneVerification';

export default function ProfileTab({ user, lang, t, country, profile, setProfile, onSave, saving, saved, roleBadge, onVerified }) {
  const { checkUserAuth } = useAuth();
  const [removingAvatar, setRemovingAvatar] = useState(false);

  const removeAvatar = async () => {
    setRemovingAvatar(true);
    try {
      await base44.auth.updateMe({ avatar: '' });
      setProfile({ ...profile, avatar: '' });
      try {
        await Promise.all([
          base44.entities.Comment.updateMany({ user_id: user.id }, { $set: { user_avatar: '' } }),
          base44.entities.Message.updateMany({ sender_id: user.id }, { $set: { sender_avatar: '' } }),
          base44.entities.Presence.updateMany({ user_id: user.id }, { $set: { user_avatar: '' } }),
        ]);
      } catch (e) {}
      await checkUserAuth();
    } finally {
      setRemovingAvatar(false);
    }
  };

  const infoRows = [
    { Icon: User, label: t('cabinet.fullName'), value: user?.full_name || '—' },
    { Icon: Mail, label: t('cabinet.email'), value: user?.email || '—' },
    {
      Icon: Phone,
      label: t('cabinet.phone'),
      value: (
        <span className="flex items-center gap-1 truncate">
          {country && <span>{country.flag} {country.dial}</span>}
          <span className="truncate">{user?.phone || '—'}</span>
          {user?.phone_verified && <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />}
        </span>
      ),
    },
    { Icon: MapPin, label: t('cabinet.address'), value: user?.address || '—' },
  ];

  return (
    <div className="space-y-5">
      {/* Edit profile */}
      <form onSubmit={onSave} className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center">
            <User className="w-5 h-5 text-[#E61D25]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.profile')}</h3>
            <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
              {lang === 'ru' ? 'Фото и адрес доставки' : 'Акс ва суроғаи расонидан'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-6 items-start">
          <div className="flex flex-col items-center">
            <AvatarUpload
              currentAvatar={profile.avatar}
              onUploaded={(url) => setProfile({ ...profile, avatar: url })}
              lang={lang}
            />
            <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mt-2 flex items-center gap-1">
              <Camera className="w-3 h-3" /> {t('cabinet.avatar')}
            </p>
            {profile.avatar && (
              <button
                type="button"
                onClick={removeAvatar}
                disabled={removingAvatar}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-red-500 hover:underline disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" />
                {lang === 'ru' ? 'Удалить фото' : 'Нест кардани сурат'}
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">
              {t('cabinet.address')}
            </label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={3}
              placeholder={lang === 'ru' ? 'Город, улица, дом' : 'Шаҳр, кӯча, хона'}
              className="w-full px-4 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors resize-none"
            />
            <div className="flex items-center gap-3 mt-4">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? t('cabinet.saving') : t('cabinet.saveProfile')}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-green-500 font-medium">
                  <CheckCircle className="w-4 h-4" /> {t('cabinet.saved')}
                </span>
              )}
            </div>
          </div>
        </div>
      </form>

      <div className={`rounded-2xl border p-6 ${user?.subscription_active ? 'bg-[#C5A059]/5 border-[#C5A059]/30' : 'bg-white dark:bg-[#111111] border-black/5 dark:border-white/5'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${user?.subscription_active ? 'bg-[#C5A059]/20' : 'bg-black/5 dark:bg-white/5'}`}>
            <Crown className={`w-5 h-5 ${user?.subscription_active ? 'text-[#C5A059]' : 'text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30'}`} />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
              {lang === 'ru' ? 'Подписка на контакты заводов' : 'Обуна ба тамосҳои заводҳо'}
            </h3>
            <p className={`text-xs font-medium mt-0.5 ${user?.subscription_active ? 'text-green-600' : 'text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45'}`}>
              {user?.subscription_active
                ? (lang === 'ru' ? 'Ваша подписка активирована' : 'Обунаи шумо фаъол аст')
                : (lang === 'ru' ? 'Подписка не активирована' : 'Обуна фаъол нест')}
            </p>
            {user?.subscription_active && user?.subscription_activated_at && (
              <p className="text-[11px] text-[#C5A059] mt-1">
                {lang === 'ru' ? 'Активирована' : 'Фаъол шуд'}:{' '}
                {new Date(user.subscription_activated_at).toLocaleString(lang === 'tj' ? 'tg-TJ' : 'ru-RU', {
                  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
          {user?.subscription_active && <BadgeCheck className="ml-auto w-6 h-6 text-green-500 flex-shrink-0" />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Account info */}
        <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.accountInfo')}</h3>
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded ${roleBadge.color}`}>{roleBadge.text}</span>
          </div>
          <div className="space-y-2">
            {infoRows.map(({ Icon, label, value }, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.02]">
                <Icon className="w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{label}</p>
                  <div className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 truncate">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phone verification */}
        <div className="rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/10 to-[#E61D25]/10 flex items-center justify-center">
              <Phone className="w-5 h-5 text-[#C5A059]" />
            </div>
            <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('cabinet.phoneVerification')}</h3>
          </div>
          {user?.phone_verified ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('cabinet.phoneVerified')}</p>
                <p className="text-xs text-green-600/60 dark:text-green-400/60 truncate">
                  {country && <span>{country.flag} {country.dial} </span>}{user?.phone}
                </p>
              </div>
            </div>
          ) : (
            <PhoneVerification user={user} lang={lang} t={t} onVerified={onVerified} />
          )}
        </div>
      </div>
    </div>
  );
}
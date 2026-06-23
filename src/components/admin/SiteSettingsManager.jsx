import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';
import { useLanguage } from '@/lib/i18n.jsx';
import { Save, Settings } from 'lucide-react';

export default function SiteSettingsManager() {
  const { lang } = useLanguage();
  const { settings, reload } = useSiteSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (settings.id) {
        await base44.entities.SiteSetting.update(settings.id, form);
      } else {
        const created = await base44.entities.SiteSetting.create(form);
        if (created?.id) form.id = created.id;
      }
      reload();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'company_name', label: { ru: 'Название компании', tj: 'Номи ширкат' } },
    { key: 'telegram', label: { ru: 'Telegram (имя пользователя или ссылка)', tj: 'Telegram (номи корбар ё пайванд)' } },
    { key: 'whatsapp', label: { ru: 'WhatsApp (номер или ссылка)', tj: 'WhatsApp (рақам ё пайванд)' } },
    { key: 'wechat', label: { ru: 'WeChat ID', tj: 'WeChat ID' } },
    { key: 'email', label: { ru: 'Email', tj: 'Email' } },
    { key: 'phone', label: { ru: 'Телефон', tj: 'Телефон' } },
    { key: 'address_ru', label: { ru: 'Адрес (на русском)', tj: 'Суроға (ба русӣ)' } },
    { key: 'address_tj', label: { ru: 'Адрес (на таджикском)', tj: 'Суроға (ба тоҷикӣ)' } },
  ];

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center">
          <Settings className="w-5 h-5 text-[#E61D25]" />
        </div>
        <h3 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
          {lang === 'ru' ? 'Контактные данные сайта' : 'Маълумоти тамаси сомона'}
        </h3>
      </div>

      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
            {f.label[lang] || f.label.ru}
          </label>
          <input
            type="text"
            value={form[f.key] || ''}
            onChange={(e) => handleChange(f.key, e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] transition-colors text-sm"
          />
        </div>
      ))}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? (lang === 'ru' ? 'Сохранение...' : 'Захира кардан...') : (lang === 'ru' ? 'Сохранить' : 'Захира кардан')}
        </button>
        {saved && (
          <span className="text-sm text-green-500 font-medium">
            {lang === 'ru' ? '✓ Сохранено' : '✓ Захира шуд'}
          </span>
        )}
      </div>
    </form>
  );
}
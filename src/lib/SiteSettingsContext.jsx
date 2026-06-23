import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const SiteSettingsContext = createContext();

export const DEFAULT_SETTINGS = {
  company_name: 'China.Trade.CA',
  telegram: 'chinatradeca',
  whatsapp: 'chinatradeca',
  wechat: 'chinatradeca',
  email: 'info@chinatrade.ca',
  phone: '',
  address_ru: '',
  address_tj: '',
};

function normalizeTelegram(val) {
  if (!val) return '#';
  if (val.startsWith('http')) return val;
  return `https://t.me/${val.replace('@', '')}`;
}

function normalizeWhatsapp(val) {
  if (!val) return '#';
  if (val.startsWith('http')) return val;
  return `https://wa.me/${val.replace(/[^0-9]/g, '')}`;
}

function normalizeEmail(val) {
  if (!val) return '#';
  if (val.startsWith('mailto:')) return val;
  return `mailto:${val}`;
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const all = await base44.entities.SiteSetting.list();
      if (all && all.length > 0) {
        setSettings({ ...DEFAULT_SETTINGS, ...all[0] });
      }
    } catch (e) {
      // fall back to defaults
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const value = {
    settings,
    loading,
    reload: load,
    // Normalized links ready for href
    telegramLink: normalizeTelegram(settings.telegram),
    whatsappLink: normalizeWhatsapp(settings.whatsapp),
    emailLink: normalizeEmail(settings.email),
  };

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
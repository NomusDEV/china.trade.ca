import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { MessageCircle, Mail, Send } from 'lucide-react';
import BackButton from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';

export default function Contacts() {
  const { t } = useLanguage();
  const { settings, telegramLink, whatsappLink, emailLink } = useSiteSettings();
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.message) return;
    setSending(true);
    try {
      await base44.entities.Inquiry.create(form);
      setSent(true);
      setForm({ name: '', phone: '', message: '' });
    } finally {
      setSending(false);
    }
  };

  const channels = [
    settings.telegram && { name: 'Telegram', href: telegramLink, icon: MessageCircle, label: settings.telegram },
    settings.whatsapp && { name: 'WhatsApp', href: whatsappLink, icon: MessageCircle, label: settings.whatsapp },
    settings.wechat && { name: 'WeChat', href: '#', icon: MessageCircle, label: settings.wechat },
    settings.email && { name: 'Email', href: emailLink, icon: Mail, label: settings.email },
  ].filter(Boolean);

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">Contact</span>
            <div className="h-px w-12 bg-[#C5A059]" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mb-4">{t('contact.title')}</h1>
          <p className="text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60">{t('contact.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Channels */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {channels.map((ch, i) => {
                const Icon = ch.icon;
                return (
                  <motion.a
                    key={ch.name}
                    href={ch.href}
                    target={ch.href.startsWith('http') ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-6 rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 bg-white dark:bg-[#111111] hover:border-[#C5A059]/30 hover:shadow-xl transition-all duration-500"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E61D25]/10 to-[#C5A059]/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#E61D25]" />
                    </div>
                    <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-1">{ch.name}</h3>
                    {ch.label && <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{ch.label}</p>}
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="p-8 rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 bg-white dark:bg-[#111111]">
              <h2 className="text-xl font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-6">{t('contact.form')}</h2>

              {sent ? (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">{t('contact.success')}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{t('contact.name')}</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t('contact.namePlaceholder')}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{t('contact.phone')}</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder={t('contact.phonePlaceholder')}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] transition-colors text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{t('contact.message')}</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={t('contact.messagePlaceholder')}
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] transition-colors text-sm resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full py-4 bg-gradient-to-r from-[#E61D25] to-[#E61D25]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E61D25]/30 transition-all"
                  >
                    {sending ? t('contact.sending') : t('contact.send')}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
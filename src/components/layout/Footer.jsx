import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n.jsx';
import { MessageCircle } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0A0A0A] text-[#F9F9F9] dark:bg-[#050505]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#E61D25] to-[#C5A059] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">CT</span>
              </div>
              <span className="font-bold text-lg">China.Trade.CA</span>
            </div>
            <p className="text-[#F9F9F9]/60 text-sm leading-relaxed mb-2">{t('footer.description')}</p>
            <p className="text-[#F9F9F9]/60 text-sm leading-relaxed">{t('footer.delivery')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-[#C5A059] mb-4 text-sm uppercase tracking-wider">{t('footer.quickLinks')}</h4>
            <div className="space-y-3">
              <Link to="/" className="block text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">{t('nav.home')}</Link>
              <Link to="/catalog" className="block text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">{t('nav.catalog')}</Link>
              <Link to="/services" className="block text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">{t('nav.services')}</Link>
              <Link to="/about" className="block text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">{t('nav.about')}</Link>
              <Link to="/contacts" className="block text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">{t('nav.contacts')}</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-[#C5A059] mb-4 text-sm uppercase tracking-wider">{t('footer.contactInfo')}</h4>
            <div className="space-y-3">
              <a href="https://t.me/chinatradeca" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">
                <MessageCircle className="w-4 h-4" /> Telegram
              </a>
              <a href="https://wa.me/chinatradeca" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a href="mailto:info@chinatrade.ca" className="flex items-center gap-2 text-sm text-[#F9F9F9]/60 hover:text-[#F9F9F9] transition-colors">
                ✉ info@chinatrade.ca
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 pt-8 border-t border-[#F9F9F9]/10">
          <p className="text-center text-xs text-[#F9F9F9]/40">{t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
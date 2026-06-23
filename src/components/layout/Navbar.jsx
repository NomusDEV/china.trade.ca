import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';
import { useTheme } from '@/lib/theme.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/catalog', label: t('nav.catalog') },
    { path: '/services', label: t('nav.services') },
    { path: '/about', label: t('nav.about') },
    { path: '/contacts', label: t('nav.contacts') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/30'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#E61D25] to-[#C5A059] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm lg:text-base">CT</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm lg:text-base text-[#0A0A0A] dark:text-[#F9F9F9] tracking-tight">China.Trade.CA</span>
              <span className="text-[10px] text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 -mt-0.5 hidden sm:block">Central Asia</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-[#E61D25] bg-[#E61D25]/10'
                    : 'text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9] hover:bg-[#0A0A0A]/5 dark:hover:bg-[#F9F9F9]/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'ru' ? 'tj' : 'ru')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:border-[#C5A059] hover:text-[#C5A059] transition-all duration-300"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === 'ru' ? 'TJ' : 'RU'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:text-[#C5A059] hover:bg-[#0A0A0A]/5 dark:hover:bg-[#F9F9F9]/5 transition-all duration-300"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-[#E61D25] bg-[#E61D25]/10'
                      : 'text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
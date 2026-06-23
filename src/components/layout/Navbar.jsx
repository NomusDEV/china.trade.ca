import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, ShoppingCart, LogOut, Shield } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';
import { useTheme } from '@/lib/theme.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext.jsx';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { count: cartCount } = useCart();
  const { settings } = useSiteSettings();
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
              <span className="font-bold text-sm lg:text-base text-[#0A0A0A] dark:text-[#F9F9F9] tracking-tight">{settings.company_name}</span>
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
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:text-[#C5A059] hover:bg-[#0A0A0A]/5 dark:hover:bg-[#F9F9F9]/5 transition-all duration-300"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E61D25] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#C5A059]/10 text-[#C5A059] hover:bg-[#C5A059]/20 transition-all"
                  >
                    <Shield className="w-3.5 h-3.5" /> {t('nav.admin')}
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:border-[#E61D25] hover:text-[#E61D25] transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{t('auth.logout')}</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#0A0A0A] dark:bg-[#F9F9F9] text-white dark:text-[#0A0A0A] hover:opacity-80 transition-all"
              >
                {t('auth.login')}
              </Link>
            )}
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
              <Link to="/cart" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">
                <ShoppingCart className="w-4 h-4" /> {t('cart.title')} {cartCount > 0 && `(${cartCount})`}
              </Link>
              {isAuthenticated ? (
                <>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#C5A059]">
                      <Shield className="w-4 h-4" /> {t('nav.admin')}
                    </Link>
                  )}
                  <button onClick={logout} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 w-full">
                    <LogOut className="w-4 h-4" /> {t('auth.logout')}
                  </button>
                </>
              ) : (
                <Link to="/login" className="block px-4 py-3 rounded-lg text-sm font-medium text-[#E61D25]">
                  {t('auth.login')}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
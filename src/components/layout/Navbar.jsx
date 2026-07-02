import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ShoppingCart, User, ChevronDown, LogOut, Package } from 'lucide-react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        ? 'bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/40 border-b border-black/5 dark:border-white/5'
        : 'bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-[#E61D25] to-[#C5A059] rounded-xl flex items-center justify-center shadow-md shadow-[#E61D25]/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-sm">CT</span>
            </div>
            <span className="font-bold text-sm lg:text-base text-[#0A0A0A] dark:text-[#F9F9F9] tracking-tight hidden sm:block">{settings.company_name}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-[#E61D25] bg-[#E61D25]/8'
                    : 'text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Link
              to="/cart"
              className="relative p-2 rounded-lg text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65 hover:text-[#E61D25] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#E61D25] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setLang(lang === 'ru' ? 'tj' : 'ru')}
              className="p-2 rounded-lg text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65 hover:text-[#C5A059] hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs font-bold"
            >
              {lang === 'ru' ? 'TJ' : 'RU'}
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65 hover:text-[#C5A059] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              {isDark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>

            {/* User Menu */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => (isAuthenticated ? setUserMenuOpen(!userMenuOpen) : (window.location.href = '/login'))}
                className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  isAuthenticated
                    ? 'bg-gradient-to-br from-[#E61D25] to-[#C5A059] text-white'
                    : 'bg-black/8 dark:bg-white/10 text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                {isAuthenticated && (
                  <ChevronDown className={`w-3.5 h-3.5 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                )}
              </button>

              <AnimatePresence>
                {userMenuOpen && isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-[#111111] shadow-2xl shadow-black/10 dark:shadow-black/50 border border-black/5 dark:border-white/5 overflow-hidden"
                  >
                    <div className="p-4 border-b border-black/5 dark:border-white/5">
                      <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{t('cabinet.welcome')}</p>
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{user?.full_name || user?.email}</p>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/cabinet"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      >
                        <User className="w-4 h-4" /> {t('cabinet.title')}
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#C5A059] hover:bg-[#C5A059]/10 transition-all"
                        >
                          <Package className="w-4 h-4" /> {t('nav.admin')}
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> {t('cabinet.logout')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 rounded-lg text-[#0A0A0A]/65 dark:text-[#F9F9F9]/65"
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
            className="lg:hidden bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-[#E61D25] bg-[#E61D25]/8'
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
                  <Link to="/cabinet" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">
                    <User className="w-4 h-4" /> {t('cabinet.title')}
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-[#C5A059]">
                      <Package className="w-4 h-4" /> {t('nav.admin')}
                    </Link>
                  )}
                  <button onClick={logout} className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-500 w-full">
                    <LogOut className="w-4 h-4" /> {t('cabinet.logout')}
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
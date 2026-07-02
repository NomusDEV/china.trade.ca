import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ShoppingCart, User, Package, LogIn, Home as HomeIcon, LayoutGrid, Wrench, Info, Phone } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';
import { useTheme } from '@/lib/theme.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useCart } from '@/lib/CartContext.jsx';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { lang, setLang, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { count: cartCount } = useCart();
  const { settings } = useSiteSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: HomeIcon },
    { path: '/catalog', label: t('nav.catalog'), icon: LayoutGrid },
    { path: '/services', label: t('nav.services'), icon: Wrench },
    { path: '/about', label: t('nav.about'), icon: Info },
    { path: '/contacts', label: t('nav.contacts'), icon: Phone },
  ];

  const statusBadge = () => {
    if (!isAuthenticated) return { text: lang === 'ru' ? 'Гость' : 'Меҳмон', color: 'bg-black/10 dark:bg-white/10 text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50' };
    if (user?.role === 'admin') return { text: 'Админ', color: 'bg-[#C5A059]/15 text-[#C5A059]' };
    return { text: lang === 'ru' ? 'Клиент' : 'Муштарӣ', color: 'bg-[#E61D25]/10 text-[#E61D25]' };
  };
  const badge = statusBadge();

  // User avatar or fallback icon
  const UserAvatar = ({ size = 'w-9 h-9', iconSize = 'w-[18px] h-[18px]' }) => {
    if (isAuthenticated && user?.avatar) {
      return <img src={user.avatar} alt="" className={`${size} rounded-xl object-cover`} />;
    }
    return (
      <div className={`${size} rounded-xl flex items-center justify-center transition-all ${
        isAuthenticated
          ? 'bg-gradient-to-br from-[#E61D25] to-[#C5A059] text-white'
          : 'bg-black/8 dark:bg-white/10 text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50'
      }`}>
        <User className={iconSize} />
      </div>
    );
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl shadow-lg shadow-black/5 dark:shadow-black/40 border-b border-black/5 dark:border-white/5'
        : 'bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* LEFT: Cart, Language, Theme (moved from right) */}
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
          </div>

          {/* CENTER: Company name */}
          <Link to="/" className="font-bold text-sm lg:text-base text-[#0A0A0A] dark:text-[#F9F9F9] tracking-tight">
            {settings.company_name}
          </Link>

          {/* RIGHT: User/Menu button (moved from left) */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all"
            >
              <UserAvatar />
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{isAuthenticated ? (user?.full_name || user?.email) : (lang === 'ru' ? 'Меню' : 'Меню')}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${badge.color}`}>{badge.text}</span>
              </div>
              <Menu className="w-4 h-4 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40" />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-[#111111] shadow-2xl shadow-black/10 dark:shadow-black/50 border border-black/5 dark:border-white/5 overflow-hidden"
                >
                  {/* Status header */}
                  <div className="p-4 border-b border-black/5 dark:border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('cabinet.welcome')}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.text}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] truncate">
                      {isAuthenticated ? (user?.full_name || user?.email) : (lang === 'ru' ? 'Не авторизован' : 'Ворид нашуда')}
                    </p>
                  </div>

                  {/* Nav links */}
                  <div className="p-2">
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            location.pathname === link.path
                              ? 'bg-[#E61D25]/8 text-[#E61D25]'
                              : 'text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4" /> {link.label}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Cabinet / Login */}
                  <div className="p-2 border-t border-black/5 dark:border-white/5">
                    {isAuthenticated ? (
                      <Link
                        to="/cabinet"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                      >
                        <User className="w-4 h-4" /> {t('cabinet.title')}
                      </Link>
                    ) : (
                      <a href="/login" className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#E61D25] hover:bg-[#E61D25]/8 transition-all">
                        <LogIn className="w-4 h-4" /> {t('auth.login')}
                      </a>
                    )}
                    {isAuthenticated && user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-[#C5A059] hover:bg-[#C5A059]/10 transition-all"
                      >
                        <Package className="w-4 h-4" /> {t('nav.admin')}
                      </Link>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
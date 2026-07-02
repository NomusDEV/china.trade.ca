import React, { useState, useRef, useEffect } from 'react';
import { COUNTRIES, findCountryByIso } from '@/lib/countries';
import { ChevronDown, Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CountryCodeSelect({ value, onChange, lang = 'ru' }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const selected = findCountryByIso(value) || COUNTRIES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = COUNTRIES.filter((c) => {
    const name = lang === 'tj' ? c.name_tj : c.name;
    return name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search) || c.iso.toLowerCase().includes(search.toLowerCase());
  });

  const getName = (c) => (lang === 'tj' ? c.name_tj : c.name);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-3 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] transition-colors whitespace-nowrap"
      >
        <span className="text-xl">{selected.flag}</span>
        <span className="font-medium">{selected.dial}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 mt-2 w-72 max-h-80 rounded-2xl bg-white dark:bg-[#111111] shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-black/5 dark:border-white/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
                <input
                  autoFocus
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === 'ru' ? 'Поиск страны...' : 'Ҷустуҷӯи кишвар...'}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none"
                />
              </div>
            </div>
            <div className="overflow-y-auto flex-1">
              {filtered.map((c) => (
                <button
                  key={c.iso}
                  type="button"
                  onClick={() => {
                    onChange(c.iso);
                    setOpen(false);
                    setSearch('');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-left ${
                    c.iso === value ? 'bg-[#E61D25]/5' : ''
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <span className="flex-1 text-sm text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{getName(c)}</span>
                  <span className="text-sm font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{c.dial}</span>
                  {c.iso === value && <Check className="w-4 h-4 text-[#E61D25]" />}
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="p-4 text-center text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
                  {lang === 'ru' ? 'Не найдено' : 'Ёфт нашуд'}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.jsx';

const FIELD = 'h-9 px-2.5 rounded border border-[#E4E1DA] dark:border-white/10 bg-white dark:bg-[#111111] text-[12.5px] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]';

export function inDateRange(dateStr, from, to) {
  if (!from && !to) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (from) {
    const f = new Date(from);
    f.setHours(0, 0, 0, 0);
    if (d < f) return false;
  }
  if (to) {
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    if (d > t) return false;
  }
  return true;
}

export function textMatch(value, query) {
  if (!query) return true;
  return String(value || '').toLowerCase().includes(query.toLowerCase());
}

export default function AdminFilters({
  search, onSearch, placeholder,
  filters = [],
  dateFrom, dateTo, onDateFrom, onDateTo,
  count, total, onReset,
}) {
  const { lang } = useLanguage();
  const hasAny = !!search || !!dateFrom || !!dateTo || filters.some((f) => f.value);

  const reset = () => {
    if (onReset) onReset();
    else {
      onSearch?.('');
      filters.forEach((f) => f.onChange(''));
      onDateFrom?.('');
      onDateTo?.('');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3 px-2.5 py-2 rounded border border-[#E4E1DA] dark:border-white/10 bg-[#FBFAF8] dark:bg-white/[0.02]">
      <div className="relative flex-1 min-w-[160px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className={`${FIELD} w-full pl-8`}
        />
      </div>
      {filters.map((f) => (
        <select key={f.key} value={f.value} onChange={(e) => f.onChange(e.target.value)} className={FIELD}>
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {onDateFrom && (
        <input
          type="date"
          value={dateFrom || ''}
          onChange={(e) => onDateFrom(e.target.value)}
          aria-label={lang === 'ru' ? 'С даты' : 'Аз сана'}
          title={lang === 'ru' ? 'С даты' : 'Аз сана'}
          className={FIELD}
        />
      )}
      {onDateTo && (
        <input
          type="date"
          value={dateTo || ''}
          onChange={(e) => onDateTo(e.target.value)}
          aria-label={lang === 'ru' ? 'По дату' : 'То сана'}
          title={lang === 'ru' ? 'По дату' : 'То сана'}
          className={FIELD}
        />
      )}
      {hasAny && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1 h-9 px-2.5 rounded border border-[#E4E1DA] dark:border-white/10 text-[12px] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9] transition-colors"
        >
          <X className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Сброс' : 'Тоза'}
        </button>
      )}
      <span className="ml-auto text-[11px] tabular-nums text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45">
        {count} / {total}
      </span>
    </div>
  );
}
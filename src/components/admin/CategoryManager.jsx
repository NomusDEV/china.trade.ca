import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import AdminFilters, { inDateRange, textMatch } from '@/components/admin/AdminFilters';

const FIELD = 'flex-1 h-10 px-3 rounded border border-[#E4E1DA] dark:border-white/10 bg-white dark:bg-[#111111] text-[13px] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059]';

export default function CategoryManager({ categories, onUpdate }) {
  const { lang } = useLanguage();
  const [name_ru, setNameRu] = useState('');
  const [name_tj, setNameTj] = useState('');
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filtered = categories.filter(
    (c) => textMatch(`${c.name_ru || ''} ${c.name_tj || ''}`, search) && inDateRange(c.created_date, from, to),
  );

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name_ru) return;
    setAdding(true);
    await base44.entities.Category.create({ name_ru, name_tj, order: categories.length });
    setNameRu('');
    setNameTj('');
    setAdding(false);
    onUpdate();
  };

  const deleteCategory = async (id) => {
    await base44.entities.Category.delete(id);
    onUpdate();
  };

  return (
    <div>
      <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          value={name_ru}
          onChange={(e) => setNameRu(e.target.value)}
          placeholder={lang === 'ru' ? 'Название категории (RU)' : 'Номи категория (RU)'}
          required
          className={FIELD}
        />
        <input
          value={name_tj}
          onChange={(e) => setNameTj(e.target.value)}
          placeholder={lang === 'ru' ? 'Название категории (TJ)' : 'Номи категория (TJ)'}
          className={FIELD}
        />
        <Button type="submit" disabled={adding} className="h-10 rounded bg-[#0A0A0A] hover:bg-[#C5A059] text-white">
          <Plus className="w-4 h-4 mr-1.5" /> {lang === 'ru' ? 'Добавить' : 'Илова кардан'}
        </Button>
      </form>

      <AdminFilters
        search={search}
        onSearch={setSearch}
        placeholder={lang === 'ru' ? 'Поиск категории...' : 'Ҷустуҷӯи категория...'}
        dateFrom={from}
        dateTo={to}
        onDateFrom={setFrom}
        onDateTo={setTo}
        count={filtered.length}
        total={categories.length}
      />

      <div className="space-y-2 max-h-[calc(100vh-360px)] min-h-[200px] overflow-y-auto pr-1">
        {filtered.map((cat) => (
          <div key={cat.id} className="flex items-center gap-3 px-3 py-2.5 rounded border border-[#E4E1DA] dark:border-white/10 bg-white dark:bg-[#111111] transition-colors hover:bg-[#FBFAF8] dark:hover:bg-white/[0.04]">
            <FolderOpen className="w-4 h-4 text-[#C5A059] flex-shrink-0" strokeWidth={1.7} />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">{cat.name_ru}</span>
              {cat.name_tj && <span className="text-[11px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-2">/ {cat.name_tj}</span>}
            </div>
            <span className="text-[11px] tabular-nums text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35">
              {new Date(cat.created_date).toLocaleDateString('ru-RU')}
            </span>
            <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-12 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-[13px]">{lang === 'ru' ? 'Нет категорий' : 'Категория нест'}</p>
          </div>
        )}
        {categories.length > 0 && filtered.length === 0 && (
          <p className="text-center py-10 text-[13px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            {lang === 'ru' ? 'Ничего не найдено' : 'Чизе ёфт нашуд'}
          </p>
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, FolderOpen } from 'lucide-react';

export default function CategoryManager({ categories, onUpdate }) {
  const { lang } = useLanguage();
  const [name_ru, setNameRu] = useState('');
  const [name_tj, setNameTj] = useState('');
  const [adding, setAdding] = useState(false);

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
      <form onSubmit={addCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={name_ru}
          onChange={(e) => setNameRu(e.target.value)}
          placeholder={lang === 'ru' ? 'Название категории (RU)' : 'Номи категория (RU)'}
          required
          className="flex-1 px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
        />
        <input
          value={name_tj}
          onChange={(e) => setNameTj(e.target.value)}
          placeholder={lang === 'ru' ? 'Название категории (TJ)' : 'Номи категория (TJ)'}
          className="flex-1 px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
        />
        <Button type="submit" disabled={adding} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> {lang === 'ru' ? 'Добавить' : 'Илова кардан'}
        </Button>
      </form>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#111111] border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5">
            <FolderOpen className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">{cat.name_ru}</span>
              {cat.name_tj && <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-2">/ {cat.name_tj}</span>}
            </div>
            <button onClick={() => deleteCategory(cat.id)} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-12 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{lang === 'ru' ? 'Нет категорий' : 'Категория нест'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
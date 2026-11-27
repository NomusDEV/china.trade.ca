import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Plus, Pencil, Trash2, Package, ChevronDown, Settings2, Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCT_TYPES } from '@/lib/productTypes';
import ProductForm from '@/components/admin/ProductForm';

const emptyBulk = { category: '', type: '', status: '', price: '' };
const inputClass = 'w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]';

export default function ProductManager({ products, categories, onUpdate }) {
  const { lang } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkForm, setBulkForm] = useState(emptyBulk);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const toggleSelected = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const remove = async (ids) => {
    await Promise.all(ids.map((id) => base44.entities.Product.delete(id)));
    setSelected([]);
    setConfirmDelete(null);
    onUpdate();
  };

  const applyBulk = async () => {
    const patch = {};
    if (bulkForm.category) patch.category = bulkForm.category;
    if (bulkForm.type) patch.type = bulkForm.type;
    if (bulkForm.status) patch.status = bulkForm.status;
    if (bulkForm.price !== '') patch.price = Number(bulkForm.price);

    if (Object.keys(patch).length === 0) {
      setBulkEdit(false);
      return;
    }
    setBulkSaving(true);
    await base44.entities.Product.bulkUpdate(selected.map((id) => ({ id, ...patch })));
    setBulkSaving(false);
    setBulkEdit(false);
    setBulkForm(emptyBulk);
    setSelected([]);
    onUpdate();
  };

  const generateImages = async () => {
    const items = products.filter((p) => selected.includes(p.id));
    setGenerating(true);
    setProgress({ done: 0, total: items.length });
    for (let i = 0; i < items.length; i += 1) {
      const p = items[i];
      const prompt = `Professional e-commerce product photo of ${p.name_ru || 'wholesale product'}${p.category ? `, category: ${p.category}` : ''}${p.description_ru ? `. ${p.description_ru}` : ''}. Clean studio lighting, light neutral background, sharp focus, realistic, centered composition, no text or watermarks.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      await base44.entities.Product.update(p.id, {
        images: [...(p.images || []), url],
      });
      setProgress({ done: i + 1, total: items.length });
    }
    setGenerating(false);
    setSelected([]);
    onUpdate();
  };

  if (showForm) {
    return (
      <ProductForm
        product={editing}
        categories={categories}
        onSave={() => { setShowForm(false); setEditing(null); onUpdate(); }}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 cursor-pointer">
            <input
              type="checkbox"
              checked={products.length > 0 && selected.length === products.length}
              onChange={(e) => setSelected(e.target.checked ? products.map((p) => p.id) : [])}
              className="w-4 h-4 accent-[#E61D25]"
            />
            {lang === 'ru' ? 'Выбрать все' : 'Ҳамаро интихоб кардан'}
          </label>
          {selected.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setActionsOpen(!actionsOpen)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Settings2 className="w-3.5 h-3.5" />
                {lang === 'ru' ? `Действия (${selected.length})` : `Амалҳо (${selected.length})`}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {actionsOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-[#111111] shadow-xl border border-black/5 dark:border-white/5 p-1 z-20">
                  <button
                    onClick={() => { setBulkEdit(true); setActionsOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Редактировать разделы' : 'Таҳрири бахшҳо'}
                  </button>
                  <button
                    onClick={() => { setActionsOpen(false); generateImages(); }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Сгенерировать фото' : 'Сурат сохтан'}
                  </button>
                  <button
                    onClick={() => { setConfirmDelete(products.filter((p) => selected.includes(p.id))); setActionsOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {lang === 'ru' ? 'Удалить' : 'Нест кардан'}
                  </button>
                </div>
              )}
            </div>
          )}
          {generating && (
            <span className="inline-flex items-center gap-2 text-xs text-[#C5A059] font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {lang === 'ru'
                ? `Генерация фото ${progress.done}/${progress.total}...`
                : `Сохтани сурат ${progress.done}/${progress.total}...`}
            </span>
          )}
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
          <Plus className="w-4 h-4 mr-2" /> {lang === 'ru' ? 'Добавить товар' : 'Мол илова кардан'}
        </Button>
      </div>

      {bulkEdit && selected.length > 0 && (
        <div className="p-5 rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/5 mb-4">
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-1">
            {lang === 'ru' ? `Редактировать выбранные товары (${selected.length})` : `Таҳрири молҳои интихобшуда (${selected.length})`}
          </p>
          <p className="text-[11px] text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45 mb-4">
            {lang === 'ru' ? 'Заполните только те поля, которые нужно изменить' : 'Танҳо майдонҳои заруриро пур кунед'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Категория' : 'Категория'}
              </label>
              <select
                value={bulkForm.category}
                onChange={(e) => setBulkForm({ ...bulkForm, category: e.target.value })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                {categories.map((c) => <option key={c.id} value={c.name_ru}>{c.name_ru}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Тип товара' : 'Навъи мол'}
              </label>
              <select
                value={bulkForm.type}
                onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                {PRODUCT_TYPES.map((tp) => (
                  <option key={tp.value} value={tp.value}>{lang === 'tj' ? tp.label_tj : tp.label_ru}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Статус' : 'Вазъият'}
              </label>
              <select
                value={bulkForm.status}
                onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                <option value="active">{lang === 'ru' ? 'Активный' : 'Фаъол'}</option>
                <option value="inactive">{lang === 'ru' ? 'Неактивный' : 'Ғайрифаъол'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Цена ($)' : 'Нарх ($)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={bulkForm.price}
                onChange={(e) => setBulkForm({ ...bulkForm, price: e.target.value })}
                placeholder={lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              onClick={applyBulk}
              disabled={bulkSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C5A059] text-white text-xs font-semibold hover:bg-[#C5A059]/90 disabled:opacity-50"
            >
              {bulkSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {lang === 'ru' ? 'Применить' : 'Татбиқ кардан'}
            </button>
            <button
              onClick={() => { setBulkEdit(false); setBulkForm(emptyBulk); }}
              className="px-3 py-2 rounded-lg text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
            >
              {lang === 'ru' ? 'Отмена' : 'Бекор'}
            </button>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 mb-4">
          <p className="text-sm font-semibold text-red-500 mb-2">
            {lang === 'ru' ? 'Вы хотите удалить:' : 'Шумо мехоҳед нест кунед:'}
          </p>
          <ul className="space-y-1 mb-3 max-h-40 overflow-y-auto">
            {confirmDelete.map((p) => (
              <li key={p.id} className="text-xs text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">• {p.name_ru}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => remove(confirmDelete.map((p) => p.id))}
              className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-500/90"
            >
              {lang === 'ru' ? 'Да, удалить' : 'Бале, нест кунед'}
            </button>
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
            >
              {lang === 'ru' ? 'Отмена' : 'Бекор'}
            </button>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{lang === 'ru' ? 'Нет товаров' : 'Мол нест'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#111111] border ${selected.includes(product.id) ? 'border-[#E61D25]/40' : 'border-black/5 dark:border-white/5'}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(product.id)}
                onChange={() => toggleSelected(product.id)}
                className="w-4 h-4 accent-[#E61D25] flex-shrink-0"
              />
              <div className="w-16 h-16 rounded-lg bg-[#F0F0F0] dark:bg-[#1A1A1A] flex-shrink-0 overflow-hidden">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-[#0A0A0A]/10 dark:text-[#F9F9F9]/10" /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{product.name_ru}</h3>
                <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{product.category} · ${product.price} · MOQ: {product.moq}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-medium ${product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {product.status}
              </div>
              <button onClick={() => { setEditing(product); setShowForm(true); }} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059] transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => setConfirmDelete([product])} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
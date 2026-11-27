import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Plus, Pencil, Trash2, Factory, ChevronDown, Settings2, Sparkles, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCT_TYPES, getTypeLabel } from '@/lib/productTypes';

const emptyBulk = { type: '', country: '', city: '', status: '', subscription: '' };

export default function FactoryManager() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkForm, setBulkForm] = useState(emptyBulk);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const load = async () => {
    setLoading(true);
    const items = await base44.entities.Factory.list('-created_date');
    setFactories(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleSelected = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const remove = async (ids) => {
    await Promise.all(ids.map((id) => base44.entities.Factory.delete(id)));
    setSelected([]);
    setConfirmDelete(null);
    load();
  };

  const applyBulk = async () => {
    const patch = {};
    if (bulkForm.type) patch.type = bulkForm.type;
    if (bulkForm.country.trim()) patch.country = bulkForm.country.trim();
    if (bulkForm.city.trim()) patch.city = bulkForm.city.trim();
    if (bulkForm.status) patch.status = bulkForm.status;
    if (bulkForm.subscription) patch.requires_subscription = bulkForm.subscription === 'yes';

    if (Object.keys(patch).length === 0) {
      setBulkEdit(false);
      return;
    }
    setBulkSaving(true);
    await base44.entities.Factory.bulkUpdate(selected.map((id) => ({ id, ...patch })));
    setBulkSaving(false);
    setBulkEdit(false);
    setBulkForm(emptyBulk);
    setSelected([]);
    load();
  };

  const generateImages = async () => {
    const items = factories.filter((f) => selected.includes(f.id));
    setGenerating(true);
    setProgress({ done: 0, total: items.length });
    for (let i = 0; i < items.length; i += 1) {
      const f = items[i];
      const prompt = `Professional photo of a modern manufacturing factory${f.name_ru ? ` of ${f.name_ru}` : ''}${f.city ? ` in ${f.city}` : ''}${f.country ? `, ${f.country}` : ''}${f.main_products_ru ? `, producing ${f.main_products_ru}` : ''}. Industrial building exterior, clean daylight, realistic, wide angle, no text or watermarks.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      await base44.entities.Factory.update(f.id, {
        image: url,
        images: [...(f.images || []), url],
      });
      setProgress({ done: i + 1, total: items.length });
    }
    setGenerating(false);
    setSelected([]);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 cursor-pointer">
            <input
              type="checkbox"
              checked={factories.length > 0 && selected.length === factories.length}
              onChange={(e) => setSelected(e.target.checked ? factories.map((f) => f.id) : [])}
              className="w-4 h-4 accent-[#C5A059]"
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
                <div className="absolute left-0 top-full mt-2 w-56 rounded-md bg-white dark:bg-[#111111] shadow-lg border border-[#E4E1DA] dark:border-white/10 p-1 z-20">
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
                    onClick={() => { setConfirmDelete(factories.filter((f) => selected.includes(f.id))); setActionsOpen(false); }}
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
        <Button onClick={() => navigate('/admin/factory/new')} className="rounded bg-[#0A0A0A] hover:bg-[#C5A059] text-white">
          <Plus className="w-4 h-4 mr-2" /> {lang === 'ru' ? 'Добавить завод' : 'Завод илова кардан'}
        </Button>
      </div>

      {bulkEdit && selected.length > 0 && (
        <div className="p-5 rounded-md border border-[#C5A059]/40 bg-[#F3F2EF] dark:bg-white/[0.03] mb-4">
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-1">
            {lang === 'ru' ? `Редактировать выбранные заводы (${selected.length})` : `Таҳрири заводҳои интихобшуда (${selected.length})`}
          </p>
          <p className="text-[11px] text-[#0A0A0A]/45 dark:text-[#F9F9F9]/45 mb-4">
            {lang === 'ru' ? 'Заполните только те поля, которые нужно изменить' : 'Танҳо майдонҳои заруриро пур кунед'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Направление' : 'Самт'}
              </label>
              <select
                value={bulkForm.type}
                onChange={(e) => setBulkForm({ ...bulkForm, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                {PRODUCT_TYPES.map((tp) => (
                  <option key={tp.value} value={tp.value}>{lang === 'tj' ? tp.label_tj : tp.label_ru}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Страна' : 'Кишвар'}
              </label>
              <input
                value={bulkForm.country}
                onChange={(e) => setBulkForm({ ...bulkForm, country: e.target.value })}
                placeholder={lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Город' : 'Шаҳр'}
              </label>
              <input
                value={bulkForm.city}
                onChange={(e) => setBulkForm({ ...bulkForm, city: e.target.value })}
                placeholder={lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Статус' : 'Вазъият'}
              </label>
              <select
                value={bulkForm.status}
                onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                <option value="active">{lang === 'ru' ? 'Активный' : 'Фаъол'}</option>
                <option value="inactive">{lang === 'ru' ? 'Неактивный' : 'Ғайрифаъол'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Подписка' : 'Обуна'}
              </label>
              <select
                value={bulkForm.subscription}
                onChange={(e) => setBulkForm({ ...bulkForm, subscription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                <option value="yes">{lang === 'ru' ? 'Только по подписке' : 'Танҳо бо обуна'}</option>
                <option value="no">{lang === 'ru' ? 'Открытые контакты' : 'Тамосҳои кушод'}</option>
              </select>
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
        <div className="p-5 rounded-md border border-red-500/30 bg-red-500/5 mb-4">
          <p className="text-sm font-semibold text-red-500 mb-2">
            {lang === 'ru' ? 'Вы хотите удалить:' : 'Шумо мехоҳед нест кунед:'}
          </p>
          <ul className="space-y-1 mb-3 max-h-40 overflow-y-auto">
            {confirmDelete.map((f) => (
              <li key={f.id} className="text-xs text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">• {f.name_ru}</li>
            ))}
          </ul>
          <div className="flex gap-2">
            <button
              onClick={() => remove(confirmDelete.map((f) => f.id))}
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

      {factories.length === 0 ? (
        <div className="text-center py-16 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
          <Factory className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">{lang === 'ru' ? 'Заводов пока нет' : 'Ҳоло заводҳо нест'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {factories.map((factory) => (
            <div
              key={factory.id}
              className={`flex items-center gap-4 p-4 rounded-md bg-white dark:bg-[#111111] border ${selected.includes(factory.id) ? 'border-[#C5A059]/60' : 'border-[#E4E1DA] dark:border-white/10'}`}
            >
              <input
                type="checkbox"
                checked={selected.includes(factory.id)}
                onChange={() => toggleSelected(factory.id)}
                className="w-4 h-4 accent-[#C5A059] flex-shrink-0"
              />
              <button onClick={() => navigate(`/admin/factory/${factory.id}`)} className="flex flex-1 items-center gap-4 min-w-0 text-left">
                {factory.image ? (
                  <img src={factory.image} alt="" className="w-11 h-11 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center flex-shrink-0">
                    <Factory className="w-5 h-5 text-[#C5A059]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-[#0A0A0A] dark:text-[#F9F9F9] truncate">{factory.name_ru}</h3>
                  <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 truncate">
                    {getTypeLabel(factory.type, lang)}
                    {factory.city ? ` · ${factory.city}` : ''}
                    {factory.country ? `, ${factory.country}` : ''}
                    {factory.phone ? ` · ${factory.phone}` : ''}
                  </p>
                </div>
              </button>
              {factory.requires_subscription && (
                <span className="px-2 py-1 rounded text-[10px] font-medium bg-[#C5A059]/10 text-[#C5A059]">
                  {lang === 'ru' ? 'Подписка' : 'Обуна'}
                </span>
              )}
              <div className={`px-2 py-1 rounded text-[10px] font-medium ${factory.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {factory.status}
              </div>
              <button onClick={() => navigate(`/admin/factory/${factory.id}`)} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059] transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => setConfirmDelete([factory])} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
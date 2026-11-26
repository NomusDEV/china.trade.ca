import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Plus, Pencil, Trash2, Factory, X, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCT_TYPES, getTypeLabel } from '@/lib/productTypes';

const emptyForm = {
  name_ru: '', name_tj: '', type: '', country: '', city: '',
  phone: '', telegram: '', whatsapp: '', wechat: '', website: '',
  description_ru: '', description_tj: '', status: 'active', requires_subscription: false, image: '',
  address: '', founded_year: '', employees: '', min_order: '', certifications: '', working_hours: '',
  main_products_ru: '', main_products_tj: '', capacity_ru: '', capacity_tj: '',
  delivery_terms_ru: '', delivery_terms_tj: '',
};

export default function FactoryManager() {
  const { lang } = useLanguage();
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saveConfirm, setSaveConfirm] = useState(false);
  const [bulkEdit, setBulkEdit] = useState(false);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkForm, setBulkForm] = useState({ type: '', country: '', city: '', status: '', subscription: '' });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm((prev) => ({ ...prev, image: file_url }));
    setUploading(false);
  };

  const load = async () => {
    setLoading(true);
    const items = await base44.entities.Factory.list('-created_date');
    setFactories(items);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (factory) => {
    setEditing(factory);
    setForm({ ...emptyForm, ...factory });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); setSaveConfirm(false); };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaveConfirm(true);
  };

  const performSave = async () => {
    setSaveConfirm(false);
    setSaving(true);
    const data = { ...form };
    delete data.id;
    delete data.created_date;
    delete data.updated_date;
    delete data.created_by_id;
    if (data.founded_year !== '' && data.founded_year !== undefined && data.founded_year !== null) {
      data.founded_year = Number(data.founded_year);
    }
    if (editing) {
      await base44.entities.Factory.update(editing.id, data);
    } else {
      await base44.entities.Factory.create(data);
    }
    setSaving(false);
    closeForm();
    load();
  };

  const remove = async (ids) => {
    await Promise.all(ids.map((id) => base44.entities.Factory.delete(id)));
    setSelected([]);
    setConfirmDelete(null);
    load();
  };

  const toggleSelected = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const applyBulk = async () => {
    const patch = {};
    if (bulkForm.type) patch.type = bulkForm.type;
    if (bulkForm.country.trim()) patch.country = bulkForm.country.trim();
    if (bulkForm.city.trim()) patch.city = bulkForm.city.trim();
    if (bulkForm.status) patch.status = bulkForm.status;
    if (bulkForm.subscription) patch.requires_subscription = bulkForm.subscription === 'yes';

    if (Object.keys(patch).length === 0) {
      setBulkConfirm(false);
      return;
    }
    setBulkSaving(true);
    await base44.entities.Factory.bulkUpdate(selected.map((id) => ({ id, ...patch })));
    setBulkSaving(false);
    setBulkEdit(false);
    setBulkConfirm(false);
    setSelected([]);
    setBulkForm({ type: '', country: '', city: '', status: '', subscription: '' });
    load();
  };

  const field = (key, label, props = {}) => (
    <div>
      <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{label}</label>
      <input
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
        {...props}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {showForm ? (
        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
              {editing
                ? (lang === 'ru' ? 'Редактировать завод' : 'Таҳрири завод')
                : (lang === 'ru' ? 'Новый завод' : 'Заводи нав')}
            </h2>
            <button type="button" onClick={closeForm} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {field('name_ru', lang === 'ru' ? 'Название (RU)' : 'Ном (RU)', { required: true })}
            {field('name_tj', lang === 'ru' ? 'Название (TJ)' : 'Ном (TJ)')}
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Направление товаров' : 'Самти молҳо'}
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">—</option>
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
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="active">{lang === 'ru' ? 'Активный' : 'Фаъол'}</option>
                <option value="inactive">{lang === 'ru' ? 'Неактивный' : 'Ғайрифаъол'}</option>
              </select>
            </div>
            {field('country', lang === 'ru' ? 'Страна' : 'Кишвар')}
            {field('city', lang === 'ru' ? 'Город' : 'Шаҳр')}
            {field('phone', lang === 'ru' ? 'Телефон' : 'Телефон')}
            {field('telegram', 'Telegram')}
            {field('whatsapp', 'WhatsApp')}
            {field('wechat', 'WeChat')}
            {field('website', lang === 'ru' ? 'Сайт' : 'Сайт')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Описание (RU)' : 'Шарҳ (RU)'}
              </label>
              <textarea
                value={form.description_ru}
                onChange={(e) => setForm({ ...form, description_ru: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm resize-none focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                {lang === 'ru' ? 'Описание (TJ)' : 'Шарҳ (TJ)'}
              </label>
              <textarea
                value={form.description_tj}
                onChange={(e) => setForm({ ...form, description_tj: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm resize-none focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">
              {lang === 'ru' ? 'Дополнительная информация' : 'Маълумоти иловагӣ'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field('address', lang === 'ru' ? 'Адрес' : 'Суроға')}
              <div>
                <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
                  {lang === 'ru' ? 'Год основания' : 'Соли таъсис'}
                </label>
                <input
                  type="number"
                  value={form.founded_year}
                  onChange={(e) => setForm({ ...form, founded_year: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              {field('employees', lang === 'ru' ? 'Сотрудники' : 'Кормандон')}
              {field('min_order', lang === 'ru' ? 'Мин. партия' : 'Партияи ҳадди ақал')}
              {field('certifications', lang === 'ru' ? 'Сертификаты' : 'Сертификатҳо')}
              {field('working_hours', lang === 'ru' ? 'Время работы' : 'Вақти корӣ')}
              {field('main_products_ru', lang === 'ru' ? 'Ассортимент (RU)' : 'Ассортимент (RU)')}
              {field('main_products_tj', lang === 'ru' ? 'Ассортимент (TJ)' : 'Ассортимент (TJ)')}
              {field('capacity_ru', lang === 'ru' ? 'Производство (RU)' : 'Истеҳсолот (RU)')}
              {field('capacity_tj', lang === 'ru' ? 'Производство (TJ)' : 'Истеҳсолот (TJ)')}
              {field('delivery_terms_ru', lang === 'ru' ? 'Условия доставки (RU)' : 'Шартҳои расонидан (RU)')}
              {field('delivery_terms_tj', lang === 'ru' ? 'Условия доставки (TJ)' : 'Шартҳои расонидан (TJ)')}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
              {lang === 'ru' ? 'Фото завода' : 'Сурати завод'}
            </label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <div className="relative w-28 h-20 rounded-xl overflow-hidden group">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <label className="w-28 h-20 rounded-xl border-2 border-dashed border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center cursor-pointer hover:border-[#C5A059] transition-colors">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
              <p className="text-[11px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 max-w-[200px]">
                {lang === 'ru' ? 'Загрузите фото или логотип завода' : 'Сурат ё логотипи заводро бор кунед'}
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 mt-5 p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/20 cursor-pointer">
            <input
              type="checkbox"
              checked={!!form.requires_subscription}
              onChange={(e) => setForm({ ...form, requires_subscription: e.target.checked })}
              className="w-4 h-4 accent-[#C5A059]"
            />
            <span className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">
              {lang === 'ru' ? 'Контакты доступны только по подписке' : 'Тамосҳо танҳо бо обуна дастрасанд'}
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-5">
            {saveConfirm ? (
              <>
                <span className="text-sm font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">
                  {lang === 'ru' ? 'Сохранить изменения завода?' : 'Тағйиротро нигоҳ дорам?'}
                </span>
                <Button type="button" onClick={performSave} disabled={saving} className="bg-green-600 hover:bg-green-600/90 text-white">
                  <Save className="w-4 h-4 mr-2" /> {lang === 'ru' ? 'Да, сохранить' : 'Бале, нигоҳ доред'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setSaveConfirm(false)}>
                  {lang === 'ru' ? 'Нет' : 'Не'}
                </Button>
              </>
            ) : (
              <>
                <Button type="submit" disabled={saving} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '...' : (lang === 'ru' ? 'Сохранить' : 'Нигоҳ доштан')}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  {lang === 'ru' ? 'Отмена' : 'Бекор кардан'}
                </Button>
              </>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 cursor-pointer">
              <input
                type="checkbox"
                checked={factories.length > 0 && selected.length === factories.length}
                onChange={(e) => setSelected(e.target.checked ? factories.map((f) => f.id) : [])}
                className="w-4 h-4 accent-[#E61D25]"
              />
              {lang === 'ru' ? 'Выбрать все' : 'Ҳамаро интихоб кардан'}
            </label>
            {selected.length > 0 && (
              <>
                <button
                  onClick={() => setBulkEdit(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#C5A059] text-white text-xs font-semibold hover:bg-[#C5A059]/90 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> {lang === 'ru' ? `Редактировать (${selected.length})` : `Таҳрир (${selected.length})`}
                </button>
                <button
                  onClick={() => setConfirmDelete(factories.filter((f) => selected.includes(f.id)))}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-500/90 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {lang === 'ru' ? `Удалить (${selected.length})` : `Нест кардан (${selected.length})`}
                </button>
              </>
            )}
          </div>
          <Button onClick={openNew} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> {lang === 'ru' ? 'Добавить завод' : 'Завод илова кардан'}
          </Button>
        </div>
      )}

      {bulkEdit && selected.length > 0 && (
        <div className="p-5 rounded-2xl border border-[#C5A059]/30 bg-[#C5A059]/5 mb-4">
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
                {lang === 'ru' ? 'Доступ к контактам' : 'Дастрасӣ ба тамосҳо'}
              </label>
              <select
                value={bulkForm.subscription}
                onChange={(e) => setBulkForm({ ...bulkForm, subscription: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
              >
                <option value="">{lang === 'ru' ? 'Не менять' : 'Тағйир надиҳед'}</option>
                <option value="yes">{lang === 'ru' ? 'Только по подписке' : 'Танҳо бо обуна'}</option>
                <option value="no">{lang === 'ru' ? 'Открытые для всех' : 'Барои ҳама кушода'}</option>
              </select>
            </div>
          </div>

          {bulkConfirm ? (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <span className="text-xs font-medium text-[#0A0A0A] dark:text-[#F9F9F9]">
                {lang === 'ru' ? `Применить изменения к ${selected.length} заводам?` : `Тағйирот ба ${selected.length} завод татбиқ шавад?`}
              </span>
              <button
                onClick={applyBulk}
                disabled={bulkSaving}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-semibold hover:bg-green-600/90 disabled:opacity-50"
              >
                {lang === 'ru' ? 'Да, применить' : 'Бале, татбиқ кунед'}
              </button>
              <button
                onClick={() => setBulkConfirm(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50"
              >
                {lang === 'ru' ? 'Нет' : 'Не'}
              </button>
            </div>
          ) : (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setBulkConfirm(true)}
                className="px-4 py-2 rounded-lg bg-[#C5A059] text-white text-xs font-semibold hover:bg-[#C5A059]/90"
              >
                {lang === 'ru' ? 'Применить' : 'Татбиқ кардан'}
              </button>
              <button
                onClick={() => { setBulkEdit(false); setBulkConfirm(false); }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 hover:text-[#0A0A0A] dark:hover:text-[#F9F9F9]"
              >
                {lang === 'ru' ? 'Отмена' : 'Бекор'}
              </button>
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="p-5 rounded-2xl border border-red-500/30 bg-red-500/5 mb-4">
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
            <div key={factory.id} className={`flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#111111] border ${selected.includes(factory.id) ? 'border-[#E61D25]/40' : 'border-black/5 dark:border-white/5'}`}>
              <input
                type="checkbox"
                checked={selected.includes(factory.id)}
                onChange={() => toggleSelected(factory.id)}
                className="w-4 h-4 accent-[#E61D25] flex-shrink-0"
              />
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
              {factory.requires_subscription && (
                <span className="px-2 py-1 rounded text-[10px] font-medium bg-[#C5A059]/10 text-[#C5A059]">
                  {lang === 'ru' ? 'Подписка' : 'Обуна'}
                </span>
              )}
              <div className={`px-2 py-1 rounded text-[10px] font-medium ${factory.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {factory.status}
              </div>
              <button onClick={() => openEdit(factory)} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#C5A059] transition-colors">
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
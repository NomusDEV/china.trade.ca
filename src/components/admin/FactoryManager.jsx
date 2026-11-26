import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Plus, Pencil, Trash2, Factory, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRODUCT_TYPES, getTypeLabel } from '@/lib/productTypes';

const emptyForm = {
  name_ru: '', name_tj: '', type: '', country: '', city: '',
  phone: '', telegram: '', whatsapp: '', wechat: '', website: '',
  description_ru: '', description_tj: '', status: 'active', requires_subscription: false,
};

export default function FactoryManager() {
  const { lang } = useLanguage();
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

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
  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form };
    delete data.id;
    delete data.created_date;
    delete data.updated_date;
    delete data.created_by_id;
    if (editing) {
      await base44.entities.Factory.update(editing.id, data);
    } else {
      await base44.entities.Factory.create(data);
    }
    setSaving(false);
    closeForm();
    load();
  };

  const remove = async (id) => {
    await base44.entities.Factory.delete(id);
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

          <div className="flex gap-3 pt-5">
            <Button type="submit" disabled={saving} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
              <Save className="w-4 h-4 mr-2" />
              {saving ? '...' : (lang === 'ru' ? 'Сохранить' : 'Нигоҳ доштан')}
            </Button>
            <Button type="button" variant="outline" onClick={closeForm}>
              {lang === 'ru' ? 'Отмена' : 'Бекор кардан'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex justify-end mb-6">
          <Button onClick={openNew} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> {lang === 'ru' ? 'Добавить завод' : 'Завод илова кардан'}
          </Button>
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
            <div key={factory.id} className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#C5A059]/15 to-[#E61D25]/10 flex items-center justify-center flex-shrink-0">
                <Factory className="w-5 h-5 text-[#C5A059]" />
              </div>
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
              <button onClick={() => remove(factory.id)} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25] transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
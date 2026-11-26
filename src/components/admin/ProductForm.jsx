import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { X, Upload, Image, Sparkles, Loader2 } from 'lucide-react';
import { PRODUCT_TYPES } from '@/lib/productTypes';

export default function ProductForm({ product, categories, onSave, onCancel }) {
  const { lang } = useLanguage();
  const [form, setForm] = useState({
    name_ru: product?.name_ru || '',
    name_tj: product?.name_tj || '',
    description_ru: product?.description_ru || '',
    description_tj: product?.description_tj || '',
    category: product?.category || '',
    type: product?.type || '',
    price: product?.price || '',
    moq: product?.moq || '',
    specifications_ru: product?.specifications_ru || '',
    specifications_tj: product?.specifications_tj || '',
    images: product?.images || [],
    status: product?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const generateImage = async () => {
    setGeneratingImage(true);
    try {
      const prompt = `Professional e-commerce product photo of ${form.name_ru || form.name_tj || 'wholesale product'}${form.category ? `, ${form.category}` : ''}. Clean studio lighting, light neutral background, sharp focus, realistic, centered composition, no text or watermarks.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      setForm((prev) => ({ ...prev, images: [...prev.images, url] }));
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setForm({ ...form, images: [...form.images, file_url] });
    setUploading(false);
  };

  const removeImage = (idx) => {
    setForm({ ...form, images: form.images.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, price: Number(form.price), moq: Number(form.moq) };
    if (product) {
      await base44.entities.Product.update(product.id, data);
    } else {
      await base44.entities.Product.create(data);
    }
    setSaving(false);
    onSave();
  };

  const fieldLabel = (ru, tj) => lang === 'tj' ? tj : ru;

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
          {product ? (lang === 'ru' ? 'Редактировать товар' : 'Таҳрири мол') : (lang === 'ru' ? 'Новый товар' : 'Моли нав')}
        </h2>
        <button onClick={onCancel} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25]"><X className="w-5 h-5" /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Название (RU)', 'Ном (RU)')}</label>
            <input value={form.name_ru} onChange={(e) => setForm({ ...form, name_ru: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Название (TJ)', 'Ном (TJ)')}</label>
            <input value={form.name_tj} onChange={(e) => setForm({ ...form, name_tj: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Тип товара', 'Навъи мол')}</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]">
              <option value="">—</option>
              {PRODUCT_TYPES.map((tp) => (
                <option key={tp.value} value={tp.value}>{lang === 'tj' ? tp.label_tj : tp.label_ru}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Категория', 'Категория')}</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]">
              <option value="">—</option>
              {categories.map((c) => <option key={c.id} value={c.name_ru}>{c.name_ru}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Цена ($)', 'Нарх ($)')}</label>
            <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">MOQ</label>
            <input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} required className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Описание (RU)', 'Шарҳ (RU)')}</label>
            <textarea value={form.description_ru} onChange={(e) => setForm({ ...form, description_ru: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm resize-none focus:outline-none focus:border-[#C5A059]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Описание (TJ)', 'Шарҳ (TJ)')}</label>
            <textarea value={form.description_tj} onChange={(e) => setForm({ ...form, description_tj: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm resize-none focus:outline-none focus:border-[#C5A059]" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Характеристики (RU)', 'Тавсифот (RU)')}</label>
            <textarea value={form.specifications_ru} onChange={(e) => setForm({ ...form, specifications_ru: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm resize-none focus:outline-none focus:border-[#C5A059]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Характеристики (TJ)', 'Тавсифот (TJ)')}</label>
            <textarea value={form.specifications_tj} onChange={(e) => setForm({ ...form, specifications_tj: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm resize-none focus:outline-none focus:border-[#C5A059]" />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Статус', 'Вазъият')}</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]">
            <option value="active">{lang === 'ru' ? 'Активный' : 'Фаъол'}</option>
            <option value="inactive">{lang === 'ru' ? 'Неактивный' : 'Ғайрифаъол'}</option>
          </select>
        </div>

        {/* Images */}
        <div>
          <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{fieldLabel('Фотографии', 'Суратҳо')}</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {form.images.map((img, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center cursor-pointer hover:border-[#C5A059] transition-colors">
              {uploading ? (
                <div className="w-5 h-5 border-2 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            <button
              type="button"
              onClick={generateImage}
              disabled={generatingImage}
              className="inline-flex flex-col items-center justify-center gap-1.5 w-20 h-20 rounded-lg border border-dashed border-[#C5A059]/50 text-[#C5A059] text-[10px] font-medium hover:bg-[#C5A059]/5 disabled:opacity-50 transition-colors"
            >
              {generatingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {lang === 'ru' ? 'Сгенерировать' : 'Сохтан'}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={saving} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
            {saving ? '...' : (product ? (lang === 'ru' ? 'Сохранить' : 'Нигоҳ доштан') : (lang === 'ru' ? 'Создать' : 'Сохтан'))}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>{lang === 'ru' ? 'Отмена' : 'Бекор кардан'}</Button>
        </div>
      </form>
    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Button } from '@/components/ui/button';
import { X, Upload, Sparkles, Loader2, Video, Save } from 'lucide-react';
import { PRODUCT_TYPES } from '@/lib/productTypes';
import { compressImage } from '@/lib/mediaCompress';

const emptyForm = {
  name_ru: '', name_tj: '', type: '', country: '', city: '',
  phone: '', telegram: '', whatsapp: '', wechat: '', website: '',
  description_ru: '', description_tj: '', status: 'active', requires_subscription: false,
  image: '', images: [], videos: [],
  address: '', founded_year: '', employees: '', min_order: '', certifications: '', working_hours: '',
  main_products_ru: '', main_products_tj: '', capacity_ru: '', capacity_tj: '',
  delivery_terms_ru: '', delivery_terms_tj: '',
};

const inputClass = 'w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]';

export default function FactoryForm({ factory, onSaved, onCancel }) {
  const { lang } = useLanguage();
  const [form, setForm] = useState(() => {
    if (!factory) return emptyForm;
    const images = factory.images?.length ? factory.images : (factory.image ? [factory.image] : []);
    return { ...emptyForm, ...factory, images, videos: factory.videos || [] };
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);

  const field = (key, label, opts = {}) => (
    <div>
      <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">{label}</label>
      <input
        value={form[key] ?? ''}
        onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
        required={opts.required}
        className={inputClass}
      />
    </div>
  );

  const generateImage = async () => {
    setGeneratingImage(true);
    try {
      const prompt = `Professional photo of a modern manufacturing factory${form.name_ru ? ` of ${form.name_ru}` : ''}${form.city ? ` in ${form.city}` : ''}${form.country ? `, ${form.country}` : ''}. Industrial building exterior, clean daylight, realistic, wide angle, no text or watermarks.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt });
      setForm((prev) => ({ ...prev, images: [...prev.images, url], image: prev.image || url }));
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const optimized = await compressImage(file);
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file: optimized });
      urls.push(file_url);
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls], image: prev.image || urls[0] }));
    setUploading(false);
    e.target.value = '';
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingVideo(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      urls.push(file_url);
    }
    setForm((prev) => ({ ...prev, videos: [...prev.videos, ...urls] }));
    setUploadingVideo(false);
    e.target.value = '';
  };

  const removeImage = (idx) => {
    setForm((prev) => {
      const images = prev.images.filter((_, i) => i !== idx);
      return { ...prev, images, image: images[0] || '' };
    });
  };

  const removeVideo = (idx) => {
    setForm((prev) => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const data = { ...form };
      delete data.id;
      delete data.created_date;
      delete data.updated_date;
      delete data.created_by_id;
      if (data.founded_year === '' || data.founded_year === null || data.founded_year === undefined) {
        delete data.founded_year;
      } else {
        data.founded_year = Number(data.founded_year);
      }
      data.image = data.images?.[0] || '';
      const saved = factory
        ? await base44.entities.Factory.update(factory.id, data)
        : await base44.entities.Factory.create(data);
      onSaved(saved);
    } catch (err) {
      setError(err?.message || (lang === 'ru' ? 'Не удалось сохранить' : 'Нигоҳ доштан нашуд'));
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
          {factory
            ? (lang === 'ru' ? 'Редактировать завод' : 'Таҳрири завод')
            : (lang === 'ru' ? 'Новый завод' : 'Заводи нав')}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 hover:text-[#E61D25]">
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
            onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
            required
            className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
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
            onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
            className={`${inputClass} [color-scheme:light] dark:[color-scheme:dark]`}
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
            onChange={(e) => setForm((prev) => ({ ...prev, description_ru: e.target.value }))}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
            {lang === 'ru' ? 'Описание (TJ)' : 'Шарҳ (TJ)'}
          </label>
          <textarea
            value={form.description_tj}
            onChange={(e) => setForm((prev) => ({ ...prev, description_tj: e.target.value }))}
            rows={3}
            className={`${inputClass} resize-none`}
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
              onChange={(e) => setForm((prev) => ({ ...prev, founded_year: e.target.value }))}
              className={inputClass}
            />
          </div>
          {field('employees', lang === 'ru' ? 'Сотрудники' : 'Кормандон')}
          {field('min_order', lang === 'ru' ? 'Мин. партия' : 'Партияи ҳадди ақал')}
          {field('certifications', lang === 'ru' ? 'Сертификаты' : 'Сертификатҳо')}
          {field('working_hours', lang === 'ru' ? 'Время работы' : 'Вақти корӣ')}
          {field('main_products_ru', 'Ассортимент (RU)')}
          {field('main_products_tj', 'Ассортимент (TJ)')}
          {field('capacity_ru', 'Производство (RU)')}
          {field('capacity_tj', 'Производство (TJ)')}
          {field('delivery_terms_ru', 'Условия доставки (RU)')}
          {field('delivery_terms_tj', 'Условия доставки (TJ)')}
        </div>
      </div>

      <div className="mt-5">
        <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
          {lang === 'ru' ? 'Фотографии завода' : 'Суратҳои завод'}
        </label>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          {form.images.map((img, i) => (
            <div key={i} className="relative w-28 h-20 rounded-xl overflow-hidden group">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
          <label className="w-28 h-20 rounded-xl border-2 border-dashed border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center cursor-pointer hover:border-[#C5A059] transition-colors">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
            )}
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
          </label>
          <button
            type="button"
            onClick={generateImage}
            disabled={generatingImage}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-[#C5A059]/50 text-[#C5A059] text-xs font-medium hover:bg-[#C5A059]/5 disabled:opacity-50 transition-colors"
          >
            {generatingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {lang === 'ru' ? 'Сгенерировать фото' : 'Сурат сохтан'}
          </button>
        </div>
        <p className="text-[11px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
          {lang === 'ru' ? 'Можно выбрать несколько фото сразу' : 'Метавонед якчанд сурат интихоб кунед'}
        </p>

        <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2 mt-4">
          {lang === 'ru' ? 'Видео завода' : 'Видеои завод'}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          {form.videos.map((video, i) => (
            <div key={i} className="relative w-36 h-20 rounded-xl overflow-hidden group bg-black">
              <video src={video} muted playsInline preload="metadata" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
          <label className="w-36 h-20 rounded-xl border-2 border-dashed border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#C5A059] transition-colors">
            {uploadingVideo ? (
              <div className="w-5 h-5 border-2 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
            ) : (
              <Video className="w-5 h-5 text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30" />
            )}
            <span className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">Видео</span>
            <input type="file" accept="video/*" multiple onChange={handleVideoUpload} className="hidden" />
          </label>
        </div>
      </div>

      <label className="flex items-center gap-3 mt-5 p-4 rounded-xl bg-[#C5A059]/5 border border-[#C5A059]/20 cursor-pointer">
        <input
          type="checkbox"
          checked={!!form.requires_subscription}
          onChange={(e) => setForm((prev) => ({ ...prev, requires_subscription: e.target.checked }))}
          className="w-4 h-4 accent-[#C5A059]"
        />
        <span className="text-sm text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70">
          {lang === 'ru' ? 'Контакты доступны только по подписке' : 'Тамосҳо танҳо бо обуна дастрасанд'}
        </span>
      </label>

      {error && <p className="mt-4 text-xs text-red-500">{error}</p>}

      <div className="flex flex-wrap items-center gap-3 pt-5">
        <Button type="submit" disabled={saving} className="bg-[#E61D25] hover:bg-[#E61D25]/90 text-white">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? (lang === 'ru' ? 'Сохранение...' : 'Нигоҳ дошта мешавад...') : (lang === 'ru' ? 'Сохранить' : 'Нигоҳ доштан')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {lang === 'ru' ? 'Отмена' : 'Бекор кардан'}
        </Button>
      </div>
    </form>
  );
}
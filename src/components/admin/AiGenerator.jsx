import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { Sparkles, Loader2, Package, Factory as FactoryIcon, CheckCircle } from 'lucide-react';
import { PRODUCT_TYPES } from '@/lib/productTypes';

const productSchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_ru: { type: 'string' },
          name_tj: { type: 'string' },
          description_ru: { type: 'string' },
          description_tj: { type: 'string' },
          category: { type: 'string' },
          type: { type: 'string', enum: PRODUCT_TYPES.map((tp) => tp.value) },
          price: { type: 'number' },
          moq: { type: 'number' },
          specifications_ru: { type: 'string' },
          specifications_tj: { type: 'string' },
        },
        required: ['name_ru', 'name_tj', 'description_ru', 'description_tj', 'category', 'type', 'price', 'moq'],
      },
    },
  },
  required: ['items'],
};

const factorySchema = {
  type: 'object',
  properties: {
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name_ru: { type: 'string' },
          name_tj: { type: 'string' },
          type: { type: 'string', enum: PRODUCT_TYPES.map((tp) => tp.value) },
          description_ru: { type: 'string' },
          description_tj: { type: 'string' },
          country: { type: 'string' },
          city: { type: 'string' },
          address: { type: 'string' },
          founded_year: { type: 'number' },
          employees: { type: 'string' },
          main_products_ru: { type: 'string' },
          main_products_tj: { type: 'string' },
          capacity_ru: { type: 'string' },
          capacity_tj: { type: 'string' },
          min_order: { type: 'string' },
          certifications: { type: 'string' },
          working_hours: { type: 'string' },
          delivery_terms_ru: { type: 'string' },
          delivery_terms_tj: { type: 'string' },
          phone: { type: 'string' },
          telegram: { type: 'string' },
          whatsapp: { type: 'string' },
          wechat: { type: 'string' },
          website: { type: 'string' },
        },
        required: ['name_ru', 'name_tj', 'type', 'description_ru', 'country', 'city'],
      },
    },
  },
  required: ['items'],
};

export default function AiGenerator({ onGenerated }) {
  const { lang } = useLanguage();
  const [mode, setMode] = useState('products');
  const [count, setCount] = useState(5);
  const [type, setType] = useState('');
  const [categories, setCategories] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    base44.entities.Category.list('order').then(setCategories).catch(() => {});
  }, []);

  const generate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const n = Math.min(Math.max(Number(count) || 1, 1), 20);
      const typeName = type ? PRODUCT_TYPES.find((tp) => tp.value === type)?.label_ru : 'разные направления';
      const categoryNames = categories.map((c) => c.name_ru).filter(Boolean).join(', ');

      const prompt = mode === 'products'
        ? `Сгенерируй ${n} реалистичных оптовых товаров из Китая для B2B-платформы поставок в Центральную Азию и Россию.
Направление: ${typeName}.
Категории сайта (используй одну из них в поле category, если подходит): ${categoryNames || 'любая подходящая'}.
Для каждого товара: название, подробное описание, цена в USD (оптовая, реалистичная), минимальная партия (moq, число), характеристики.
Все тексты дай на русском (name_ru, description_ru, specifications_ru) и на таджикском (name_tj, description_tj, specifications_tj).
Поле type обязательно одно из: ${PRODUCT_TYPES.map((tp) => tp.value).join(', ')}.
Цены — числа, без символов валюты. Верни ровно ${n} товаров.`
        : `Сгенерируй ${n} реалистичных китайских заводов-производителей для B2B-платформы.
Направление: ${typeName}.
Для каждого завода: название, описание, страна, город, адрес, год основания, число сотрудников, ассортимент, производственная мощность, минимальная партия, сертификаты, время работы, условия доставки, телефон, telegram, whatsapp, wechat, сайт.
Все тексты на русском (поля *_ru) и таджикском (поля *_tj).
Поле type обязательно одно из: ${PRODUCT_TYPES.map((tp) => tp.value).join(', ')}.
Телефоны и мессенджеры — правдоподобные, в международном формате. Верни ровно ${n} заводов.`;

      const data = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: mode === 'products' ? productSchema : factorySchema,
      });

      const items = (data?.items || []).slice(0, n);

      if (mode === 'products') {
        await base44.entities.Product.bulkCreate(
          items.map((p) => ({
            ...p,
            images: [],
            status: 'active',
            price: Number(p.price) || 0,
            moq: Number(p.moq) || 1,
          }))
        );
      } else {
        await base44.entities.Factory.bulkCreate(
          items.map((f) => ({
            ...f,
            status: 'active',
            requires_subscription: false,
            founded_year: Number(f.founded_year) || undefined,
          }))
        );
      }

      setResult({ count: items.length });
      if (onGenerated) onGenerated();
    } finally {
      setGenerating(false);
    }
  };

  const modes = [
    { key: 'products', label: lang === 'ru' ? 'Товары каталога' : 'Молҳои каталог', Icon: Package },
    { key: 'factories', label: lang === 'ru' ? 'Заводы' : 'Заводҳо', Icon: FactoryIcon },
  ];

  return (
    <div className="max-w-3xl">
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A059]/20 to-[#E61D25]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9]">
              {lang === 'ru' ? 'Генерация с помощью ИИ' : 'Сохтани маълумот бо ИИ'}
            </h2>
            <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">
              {lang === 'ru' ? 'ИИ создаст и добавит записи автоматически' : 'ИИ сабтҳоро худкор месозад'}
            </p>
          </div>
        </div>

        <p className="text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">
          {lang === 'ru' ? 'Что сгенерировать' : 'Чиро сохтан'}
        </p>
        <div className="grid grid-cols-2 gap-2 mb-5">
          {modes.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => { setMode(key); setResult(null); }}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                mode === key
                  ? 'bg-[#E61D25] text-white border-[#E61D25]'
                  : 'bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border-black/10 dark:border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
              {lang === 'ru' ? 'Количество' : 'Миқдор'} (1–20)
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 mb-2">
              {lang === 'ru' ? 'Направление' : 'Самт'}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-[#F9F9F9] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="">{lang === 'ru' ? 'Любое' : 'Ҳама'}</option>
              {PRODUCT_TYPES.map((tp) => (
                <option key={tp.value} value={tp.value}>{lang === 'tj' ? tp.label_tj : tp.label_ru}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E61D25] text-white font-semibold rounded-xl text-sm hover:bg-[#E61D25]/90 disabled:opacity-60 transition-colors"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating
            ? (lang === 'ru' ? 'ИИ генерирует...' : 'ИИ месозад...')
            : (lang === 'ru' ? 'Сгенерировать' : 'Сохтан')}
        </button>

        {result && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-green-500/10 text-green-600 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            {lang === 'ru'
              ? `Добавлено записей: ${result.count}`
              : `Сабтҳои иловашуда: ${result.count}`}
          </div>
        )}
      </div>
    </div>
  );
}
import { Home, Shirt, Footprints, Smartphone, Headphones, Sparkles, Car, ToyBrick, Hammer, Package } from 'lucide-react';

export const PRODUCT_TYPES = [
  { value: 'household', label_ru: 'Бытовые товары', label_tj: 'Молҳои рӯзгор', Icon: Home },
  { value: 'clothing', label_ru: 'Одежда', label_tj: 'Либос', Icon: Shirt },
  { value: 'shoes', label_ru: 'Обувь', label_tj: 'Пойафзол', Icon: Footprints },
  { value: 'smartphones', label_ru: 'Смартфоны', label_tj: 'Смартфонҳо', Icon: Smartphone },
  { value: 'electronics', label_ru: 'Электроника', label_tj: 'Электроника', Icon: Headphones },
  { value: 'cosmetics', label_ru: 'Косметика', label_tj: 'Косметика', Icon: Sparkles },
  { value: 'auto', label_ru: 'Автозапчасти', label_tj: 'Қисмҳои мошин', Icon: Car },
  { value: 'toys', label_ru: 'Игрушки', label_tj: 'Бозичаҳо', Icon: ToyBrick },
  { value: 'construction', label_ru: 'Стройматериалы', label_tj: 'Масолеҳи сохтмон', Icon: Hammer },
  { value: 'other', label_ru: 'Другое', label_tj: 'Дигар', Icon: Package },
];

export const getTypeLabel = (value, lang) => {
  const type = PRODUCT_TYPES.find((t) => t.value === value);
  if (!type) return value || '';
  return lang === 'tj' ? type.label_tj : type.label_ru;
};

export const getTypeIcon = (value) => {
  const type = PRODUCT_TYPES.find((t) => t.value === value);
  return type ? type.Icon : Package;
};
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Package, ShoppingCart, LayoutGrid, List, SlidersHorizontal, X, LayoutGrid as AllIcon } from 'lucide-react';
import { useCart } from '@/lib/CartContext.jsx';
import { PRODUCT_TYPES, getTypeLabel } from '@/lib/productTypes';
import BackButton from '@/components/layout/BackButton';

export default function Catalog() {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.Product.filter({ status: 'active' }),
      base44.entities.Category.list('order'),
    ]).then(([prods, cats]) => {
      setProducts(prods);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const getName = (item) => (lang === 'tj' && item.name_tj) ? item.name_tj : item.name_ru;
  const getDesc = (item) => (lang === 'tj' && item.description_tj) ? item.description_tj : item.description_ru;

  const typeCounts = products.reduce((acc, p) => {
    const key = p.type || 'other';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filtered = products.filter((p) => {
    const matchesSearch = getName(p).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !selectedType || (p.type || 'other') === selectedType;
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const matchesMinPrice = !minPrice || p.price >= parseFloat(minPrice);
    const matchesMaxPrice = !maxPrice || p.price <= parseFloat(maxPrice);
    return matchesSearch && matchesType && matchesCat && matchesMinPrice && matchesMaxPrice;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_date) - new Date(a.created_date);
      case 'oldest':
        return new Date(a.created_date) - new Date(b.created_date);
      case 'priceLow':
        return a.price - b.price;
      case 'priceHigh':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  const resetFilters = () => {
    setSelectedType('');
    setSelectedCategory('');
    setSortBy('newest');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
  };

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/" />

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">Catalog</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('catalog.title')}</h1>
        </motion.div>

        {/* Product types — choose first */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 uppercase tracking-widest mb-3">
            {lang === 'ru' ? 'Тип товара' : 'Навъи мол'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            <button
              onClick={() => setSelectedType('')}
              className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all border ${
                !selectedType
                  ? 'bg-[#E61D25] text-white border-[#E61D25] shadow-lg shadow-[#E61D25]/20'
                  : 'bg-white dark:bg-[#111111] text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 hover:border-[#C5A059]'
              }`}
            >
              <AllIcon className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs font-semibold truncate">{lang === 'ru' ? 'Все товары' : 'Ҳамаи молҳо'}</span>
              <span className={`ml-auto text-[10px] font-bold ${!selectedType ? 'text-white/70' : 'text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30'}`}>{products.length}</span>
            </button>
            {PRODUCT_TYPES.map((type) => {
              const Icon = type.Icon;
              const count = typeCounts[type.value] || 0;
              const active = selectedType === type.value;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(active ? '' : type.value)}
                  className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-left transition-all border ${
                    active
                      ? 'bg-[#E61D25] text-white border-[#E61D25] shadow-lg shadow-[#E61D25]/20'
                      : 'bg-white dark:bg-[#111111] text-[#0A0A0A]/70 dark:text-[#F9F9F9]/70 border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 hover:border-[#C5A059]'
                  } ${count === 0 ? 'opacity-50' : ''}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold truncate">{getTypeLabel(type.value, lang)}</span>
                  <span className={`ml-auto text-[10px] font-bold ${active ? 'text-white/70' : 'text-[#0A0A0A]/30 dark:text-[#F9F9F9]/30'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search + View toggle */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40" />
            <input
              type="text"
              placeholder={t('catalog.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F9F9F9] focus:outline-none focus:border-[#C5A059] transition-colors text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                showFilters
                  ? 'bg-[#C5A059] text-white'
                  : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> {t('catalogFilters.sortBy')}
            </button>
            <div className="flex rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors ${viewMode === 'grid' ? 'bg-[#E61D25] text-white' : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-[#E61D25] text-white' : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
          <button
            onClick={() => setSelectedCategory('')}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !selectedCategory
                ? 'bg-[#E61D25] text-white'
                : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 hover:border-[#C5A059]'
            }`}
          >
            {t('catalog.allCategories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name_ru)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.name_ru
                  ? 'bg-[#E61D25] text-white'
                  : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 hover:border-[#C5A059]'
              }`}
            >
              {getName(cat)}
            </button>
          ))}
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden mb-6"
          >
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111111] border border-black/5 dark:border-white/5 flex flex-wrap items-end gap-4">
              {/* Sort */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('catalogFilters.sortBy')}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059] [color-scheme:light] dark:[color-scheme:dark]"
                >
                  <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="newest">{t('catalogFilters.newest')}</option>
                  <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="oldest">{t('catalogFilters.oldest')}</option>
                  <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="priceLow">{t('catalogFilters.priceLow')}</option>
                  <option className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-[#F9F9F9]" value="priceHigh">{t('catalogFilters.priceHigh')}</option>
                </select>
              </div>
              {/* Min price */}
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('catalogFilters.minPrice')}</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="$0"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              {/* Max price */}
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-2">{t('catalogFilters.maxPrice')}</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="$9999"
                  className="w-full px-4 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-transparent text-[#0A0A0A] dark:text-[#F9F9F9] text-sm focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/5 transition-colors"
              >
                <X className="w-4 h-4" /> {t('catalogFilters.reset')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mb-4">
            {t('catalogFilters.results')}: <span className="font-semibold text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60">{sorted.length}</span>
          </p>
        )}

        {/* Products */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 mb-4" />
            <p className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{t('catalog.noProducts')}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {sorted.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to={`/product/${product.id}`} className="group block rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 overflow-hidden bg-white dark:bg-[#111111] hover:shadow-xl transition-all duration-500">
                  <div className="relative aspect-square bg-[#F0F0F0] dark:bg-[#1A1A1A] overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={getName(product)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-[#0A0A0A]/10 dark:text-[#F9F9F9]/10" /></div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] text-[#C5A059] font-medium mb-0.5 truncate">{product.category}</p>
                    <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] text-xs mb-2 line-clamp-2 min-h-[2rem]">{getName(product)}</h3>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-base font-bold text-[#E61D25]">${product.price}</span>
                      <span className="text-[9px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">MOQ: {product.moq}</span>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product, 1); }}
                      className="w-full py-1.5 bg-[#E61D25] text-white text-[11px] font-semibold rounded-lg hover:bg-[#E61D25]/90 transition-colors flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" /> {t('cart.addToCart')}
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="space-y-3">
            {sorted.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link to={`/product/${product.id}`} className="group flex gap-4 rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 overflow-hidden bg-white dark:bg-[#111111] hover:shadow-xl transition-all duration-500 p-3">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-[#F0F0F0] dark:bg-[#1A1A1A] overflow-hidden flex-shrink-0">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={getName(product)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-8 h-8 text-[#0A0A0A]/10 dark:text-[#F9F9F9]/10" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#C5A059] font-medium mb-0.5">{product.category}</p>
                      <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] text-sm mb-1 line-clamp-1">{getName(product)}</h3>
                      <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 line-clamp-2 hidden sm:block">{getDesc(product)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-[#E61D25]">${product.price}</span>
                        <span className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">/ {t('catalog.perUnit')} · MOQ: {product.moq}</span>
                      </div>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); addItem(product, 1); }}
                        className="px-4 py-2 bg-[#E61D25] text-white text-xs font-semibold rounded-lg hover:bg-[#E61D25]/90 transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> {t('cart.addToCart')}
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
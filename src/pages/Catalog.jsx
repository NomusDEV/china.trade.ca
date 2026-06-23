import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { Search, ShieldCheck, Package, ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/CartContext.jsx';

export default function Catalog() {
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const filtered = products.filter((p) => {
    const matchesSearch = getName(p).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-[#C5A059]" />
            <span className="text-[#C5A059] text-xs font-semibold tracking-widest uppercase">Catalog</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{t('catalog.title')}</h1>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('')}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === cat.name_ru
                    ? 'bg-[#E61D25] text-white'
                    : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 hover:border-[#C5A059]'
                }`}
              >
                {getName(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 mb-4" />
            <p className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50">{t('catalog.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/product/${product.id}`}
                  className="group block rounded-2xl border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5 overflow-hidden bg-white dark:bg-[#111111] hover:shadow-xl hover:shadow-[#0A0A0A]/5 dark:hover:shadow-[#F9F9F9]/5 transition-all duration-500"
                >
                  <div className="relative aspect-square bg-[#F0F0F0] dark:bg-[#1A1A1A] overflow-hidden">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={getName(product)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-[#0A0A0A]/10 dark:text-[#F9F9F9]/10" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#C5A059]/90 text-white text-[10px] font-medium">
                        <ShieldCheck className="w-3 h-3" /> China.Trade.CA
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-[#C5A059] font-medium mb-1">{product.category}</p>
                    <h3 className="font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] text-sm mb-2 line-clamp-2">{getName(product)}</h3>
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-lg font-bold text-[#E61D25]">${product.price}</span>
                        <span className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-1">/ {t('catalog.perUnit')}</span>
                      </div>
                      <span className="text-[10px] text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('catalog.moq')}: {product.moq}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addItem(product, Math.max(product.moq || 1, 1));
                      }}
                      className="mt-3 w-full py-2 bg-[#E61D25] text-white text-xs font-semibold rounded-lg hover:bg-[#E61D25]/90 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> {t('cart.addToCart')}
                    </button>
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
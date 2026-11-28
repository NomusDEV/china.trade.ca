import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n.jsx';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, Package, ShoppingCart, Plus, Minus } from 'lucide-react';
import MediaGallery from '@/components/media/MediaGallery';
import { useCart } from '@/lib/CartContext.jsx';
import { useAuth } from '@/lib/AuthContext';
import { useSiteSettings } from '@/lib/SiteSettingsContext.jsx';
import ProductComments from '@/components/product/ProductComments';
import BackButton from '@/components/layout/BackButton';

export default function ProductDetail() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const { addItem } = useCart();
  const { user } = useAuth();
  const { telegramLink, whatsappLink } = useSiteSettings();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    base44.entities.Product.get(id)
      .then((p) => {
        setProduct(p);
        const m = Number(p?.moq);
        setQty(m > 0 && m <= 10000 ? m : 1);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A]">
        <div className="w-8 h-8 border-4 border-[#E61D25]/20 border-t-[#E61D25] rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F9F9F9] dark:bg-[#0A0A0A]">
        <Package className="w-16 h-16 text-[#0A0A0A]/20 dark:text-[#F9F9F9]/20 mb-4" />
        <p className="text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-4">Product not found</p>
        <Link to="/catalog" className="text-[#E61D25] text-sm">{t('product.back')}</Link>
      </div>
    );
  }

  const getName = () => (lang === 'tj' && product.name_tj) ? product.name_tj : product.name_ru;
  const getDesc = () => (lang === 'tj' && product.description_tj) ? product.description_tj : product.description_ru;
  const getSpecs = () => (lang === 'tj' && product.specifications_tj) ? product.specifications_tj : product.specifications_ru;
  const images = product.images?.length ? product.images : [];
  const moq = Number(product.moq) > 0 && Number(product.moq) <= 10000 ? Number(product.moq) : 1;
  const price = Number(product.price) || 0;
  const telegramMsg = encodeURIComponent(`Здравствуйте! Меня интересует товар: ${product.name_ru} (ID: ${product.id})`);
  const whatsappMsg = encodeURIComponent(`Здравствуйте! Меня интересует товар: ${product.name_ru} (ID: ${product.id})`);
  const telegramHref = telegramLink !== '#' ? `${telegramLink}?text=${telegramMsg}` : '#';
  const whatsappHref = whatsappLink !== '#' ? `${whatsappLink}?text=${whatsappMsg}` : '#';

  return (
    <div className="flex-1 pt-20 lg:pt-24 pb-16 bg-[#F9F9F9] dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BackButton to="/catalog" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <MediaGallery
              images={images}
              videos={product.videos || []}
              alt={getName()}
              canDownload={user?.role === 'admin' || !!user?.subscription_active}
            />
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-xs text-[#C5A059] font-medium tracking-wider uppercase">{product.category}</span>
            <h1 className="text-2xl lg:text-3xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] mt-2 mb-2">{getName()}</h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#0A0A0A]/35 dark:text-[#F9F9F9]/35 mb-6">
              <span>
                {lang === 'ru' ? 'Добавлен' : 'Илова шуд'}:{' '}
                {new Date(product.created_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
              </span>
              {product.updated_date && (
                <span>
                  {lang === 'ru' ? 'Обновлён' : 'Нав карда шуд'}:{' '}
                  {new Date(product.updated_date).toLocaleDateString(lang === 'tj' ? 'tg-TJ' : 'ru-RU')}
                </span>
              )}
            </p>

            <div className="flex items-baseline gap-4 mb-8 pb-8 border-b border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10">
              <div>
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mb-1">{t('product.price')}</p>
                <span className="text-3xl font-bold text-[#E61D25]">${price.toFixed(2)}</span>
                <span className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-1">/ {t('product.units')}</span>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 mb-1">{t('product.moq')}</p>
                <span className="text-2xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9]">{moq}</span>
                <span className="text-sm text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40 ml-1">{t('product.units')}</span>
              </div>
            </div>

            {getDesc() && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">{t('product.description')}</h3>
                <p className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 leading-relaxed whitespace-pre-wrap">{getDesc()}</p>
              </div>
            )}

            {getSpecs() && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#0A0A0A] dark:text-[#F9F9F9] mb-3">{t('product.specifications')}</h3>
                <p className="text-sm text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 leading-relaxed whitespace-pre-wrap">{getSpecs()}</p>
              </div>
            )}

            <div className="mb-6 p-5 rounded-2xl bg-[#F9F9F9] dark:bg-[#0A0A0A] border border-[#0A0A0A]/5 dark:border-[#F9F9F9]/5">
              <p className="text-xs text-[#0A0A0A]/50 dark:text-[#F9F9F9]/50 mb-3">
                {t('product.quantity')} · {t('product.minOrder')}: {moq} {t('product.units')}
              </p>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setQty(Math.max(moq, qty - 1))}
                  className="w-11 h-11 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  min={moq}
                  value={qty}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setQty(Math.max(moq, val));
                  }}
                  className="w-24 text-center text-xl font-bold text-[#0A0A0A] dark:text-[#F9F9F9] bg-transparent border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 rounded-xl py-2 focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-11 h-11 rounded-xl border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 flex items-center justify-center text-[#0A0A0A]/60 dark:text-[#F9F9F9]/60 hover:border-[#C5A059] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="ml-auto text-right">
                  <p className="text-xs text-[#0A0A0A]/40 dark:text-[#F9F9F9]/40">{t('product.totalCost')}</p>
                  <p className="text-2xl font-bold text-[#E61D25]">${(price * qty).toFixed(2)}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  addItem(product, qty);
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2000);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#C5A059] to-[#C5A059]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#C5A059]/30 transition-all text-sm"
              >
                <ShoppingCart className="w-5 h-5" /> {added ? t('cart.addedToCart') : t('cart.addToCart')}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#E61D25] to-[#E61D25]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#E61D25]/30 transition-all text-sm"
              >
                <MessageCircle className="w-5 h-5" /> {t('product.contactTelegram')}
              </a>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 border border-[#0A0A0A]/10 dark:border-[#F9F9F9]/10 text-[#0A0A0A] dark:text-[#F9F9F9] font-semibold rounded-xl hover:border-[#C5A059] transition-all text-sm"
              >
                <MessageCircle className="w-5 h-5" /> {t('product.contactWhatsApp')}
              </a>
            </div>
          </motion.div>
        </div>

        {/* Comments & Reviews */}
        <ProductComments productId={product.id} />
      </div>
    </div>
  );
}